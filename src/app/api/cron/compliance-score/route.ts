import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: orgs } = await supabase.from('organisations').select('id, is_significant_data_fiduciary, grievance_officer_email')

  if (!orgs) return NextResponse.json({ updated: 0 })

  let updated = 0

  for (const org of orgs) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { data: activeNotice },
      { count: activityCount },
      { count: completionCount },
      { count: overdueCount },
      { count: criticalBreaches },
      { count: assignedDpos },
    ] = await Promise.all([
      supabase.from('privacy_notices').select('id').eq('org_id', org.id).eq('status', 'active').limit(1).single(),
      supabase.from('processing_activities').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('is_active', true),
      supabase.from('module_completions').select('*', { count: 'exact', head: true }).eq('org_id', org.id),
      supabase.from('data_principal_requests').select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .lt('submitted_at', thirtyDaysAgo)
        .not('status', 'in', '("resolved","rejected")'),
      supabase.from('data_breaches').select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .in('severity', ['high', 'critical'])
        .not('status', 'in', '("notified_principals","closed")'),
      supabase.from('data_principal_requests').select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .not('assigned_dpo_id', 'is', null),
    ])

    let score = 0
    if (org.grievance_officer_email) score += 15
    if (activeNotice) score += 10
    if ((activityCount ?? 0) > 0) score += 10
    if ((completionCount ?? 0) >= 5) score += 15
    if ((overdueCount ?? 0) === 0) score += 20
    if ((criticalBreaches ?? 0) === 0) score += 20
    if (!org.is_significant_data_fiduciary || (assignedDpos ?? 0) > 0) score += 10

    const compliance_status =
      score <= 20 ? 'not_started' :
      score <= 50 ? 'in_progress' :
      score <= 75 ? 'at_risk' :
      'compliant'

    await supabase
      .from('organisations')
      .update({ compliance_score: score, compliance_status })
      .eq('id', org.id)

    updated++
  }

  return NextResponse.json({ updated })
}
