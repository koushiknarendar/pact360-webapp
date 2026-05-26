import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const in6Hours = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

  // DPB deadline within 6 hours
  const { data: urgentDpb } = await supabase
    .from('data_breaches')
    .select('id, breach_number, org_id, title, dpb_notification_deadline')
    .lt('dpb_notification_deadline', in6Hours)
    .gt('dpb_notification_deadline', now.toISOString())
    .is('dpb_notified_at', null)

  // Principal notification deadline within 24 hours
  const { data: urgentPrincipal } = await supabase
    .from('data_breaches')
    .select('id, breach_number, org_id, title, principals_notification_deadline')
    .lt('principals_notification_deadline', in24Hours)
    .gt('principals_notification_deadline', now.toISOString())
    .is('principals_notified_at', null)

  // TODO: Send urgent email notifications for each breach here
  // These would fire Resend emails to org admins

  return NextResponse.json({
    dpb_urgent: urgentDpb?.length ?? 0,
    principal_urgent: urgentPrincipal?.length ?? 0,
  })
}
