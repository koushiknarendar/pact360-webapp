import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrder, getPlanAmount, getPlanSetupFee } from '@/lib/cashfree'
import { z } from 'zod'

const schema = z.object({
  demo_request_id: z.string().uuid(),
  plan: z.enum(['starter', 'growth', 'business']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: lead, error: leadError } = await supabase
    .from('demo_requests')
    .select('id, email, contact_name, company_name, phone')
    .eq('id', parsed.data.demo_request_id)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const planAmount = getPlanAmount(parsed.data.plan, true)
  const setupFee = getPlanSetupFee(parsed.data.plan)
  const totalAmount = planAmount + setupFee

  const orderId = `PACT-${lead.id.slice(0, 8).toUpperCase()}-${Date.now()}`

  const order = await createOrder({
    order_id: orderId,
    order_amount: totalAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: lead.id,
      customer_name: lead.contact_name,
      customer_email: lead.email,
      customer_phone: lead.phone ?? '0000000000',
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/get-started/success?order_id={order_id}&id=${lead.id}&plan=${parsed.data.plan}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    },
  })

  // Persist the Cashfree order_id on the demo_request so the webhook can look it up
  await supabase
    .from('demo_requests')
    .update({ cashfree_order_id: orderId })
    .eq('id', lead.id)

  return NextResponse.json({
    payment_session_id: order.payment_session_id,
    order_id: orderId,
  })
}
