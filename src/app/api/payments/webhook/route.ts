import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCashfreeWebhook } from '@/lib/cashfree'
import { sendFiduciaryWelcome } from '@/lib/email'
import { PLANS } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const timestamp = req.headers.get('x-webhook-timestamp') ?? ''
  const signature = req.headers.get('x-webhook-signature') ?? ''

  if (!verifyCashfreeWebhook(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: {
    type: string
    data: {
      order: { order_id: string; order_status: string }
      payment?: { payment_status: string }
    }
  }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  // Only handle successful payment events
  if (
    event.type !== 'PAYMENT_SUCCESS_WEBHOOK' &&
    event.type !== 'ORDER_PAID'
  ) {
    return NextResponse.json({ received: true })
  }

  const orderId = event.data.order.order_id
  const supabase = createAdminClient()

  // Look up the demo request by cashfree_order_id
  const { data: lead, error: leadError } = await supabase
    .from('demo_requests')
    .select('id, email, contact_name, company_name, plan, status')
    .eq('cashfree_order_id', orderId)
    .single()

  if (leadError || !lead) {
    console.error('webhook: lead not found for order', orderId)
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // Idempotency — skip if already provisioned
  if (lead.status === 'claimed') {
    return NextResponse.json({ received: true })
  }

  const plan = lead.plan as keyof typeof PLANS
  const planConfig = PLANS[plan]

  try {
    // 1. Create auth user (sends password reset email via Supabase)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: lead.email,
      email_confirm: true,
      user_metadata: {
        full_name: lead.contact_name,
        role: 'fiduciary',
      },
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Failed to create auth user')
    }

    const userId = authData.user.id

    // 2. Create organisation
    const slug = lead.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)

    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert({
        name: lead.company_name,
        slug,
        subscription_plan: plan,
        is_founding_member: true,
      })
      .select('id, public_token')
      .single()

    if (orgError || !org) {
      throw new Error(orgError?.message ?? 'Failed to create organisation')
    }

    // 3. Update profile with org and role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        org_id: org.id,
        role: 'fiduciary',
        full_name: lead.contact_name,
      })
      .eq('id', userId)

    if (profileError) {
      throw new Error(profileError.message)
    }

    // 4. Create subscription record
    const now = new Date()
    const renewsAt = new Date(now)
    renewsAt.setFullYear(renewsAt.getFullYear() + 1)

    await supabase.from('subscriptions').insert({
      org_id: org.id,
      plan,
      status: 'active',
      is_founding_member: true,
      max_requests: planConfig.max_requests,
      max_dpos: planConfig.max_dpos,
      renews_at: renewsAt.toISOString(),
    })

    // 5. Mark demo_request as claimed
    await supabase
      .from('demo_requests')
      .update({ status: 'claimed', provisioned_at: now.toISOString() })
      .eq('id', lead.id)

    // 6. Generate a password setup link and send welcome email
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: lead.email,
    })

    const loginUrl =
      linkData?.properties?.action_link ??
      `${process.env.NEXT_PUBLIC_APP_URL}/login`

    await sendFiduciaryWelcome({
      email: lead.email,
      name: lead.contact_name,
      orgName: lead.company_name,
      loginUrl,
    })
  } catch (err) {
    console.error('webhook provisioning error:', err)
    return NextResponse.json({ error: 'Provisioning failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
