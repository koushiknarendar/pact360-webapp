import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Find requests overdue at 21 days — escalation warning
  const { data: escalationRequests } = await supabase
    .from('data_principal_requests')
    .select('id, request_number, org_id, organisations(grievance_officer_email, name)')
    .lt('submitted_at', twentyOneDaysAgo)
    .not('status', 'in', '("resolved","rejected","escalated")')

  // Find requests overdue at 30 days — mark overdue
  const { data: overdueRequests } = await supabase
    .from('data_principal_requests')
    .select('id')
    .lt('submitted_at', thirtyDaysAgo)
    .not('status', 'in', '("resolved","rejected")')

  if (overdueRequests && overdueRequests.length > 0) {
    await supabase
      .from('data_principal_requests')
      .update({ status: 'escalated' })
      .in('id', overdueRequests.map(r => r.id))
  }

  return NextResponse.json({
    escalation_alerts: escalationRequests?.length ?? 0,
    overdue_marked: overdueRequests?.length ?? 0,
  })
}
