import crypto from 'crypto'

const BASE_URL =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg'

const HEADERS = {
  'x-api-version': '2023-08-01',
  'x-client-id': process.env.CASHFREE_APP_ID!,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
  'Content-Type': 'application/json',
}

export interface CashfreeOrder {
  order_id: string
  order_amount: number
  order_currency: string
  customer_details: {
    customer_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
  }
  order_meta?: {
    return_url?: string
    notify_url?: string
  }
}

export async function createOrder(order: CashfreeOrder): Promise<{ payment_session_id: string; cf_order_id: string }> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(order),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? 'Failed to create Cashfree order')
  }

  return res.json()
}

export function verifyCashfreeWebhook(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY!
  const payload = timestamp + rawBody
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
  return expected === signature
}

export function getPlanAmount(plan: string, isFoundingMember = true): number {
  const prices: Record<string, { founding: number; regular: number }> = {
    starter:  { founding: 6999,  regular: 9999 },
    growth:   { founding: 17999, regular: 24999 },
    business: { founding: 41999, regular: 59999 },
  }
  const p = prices[plan]
  if (!p) return 0
  return isFoundingMember ? p.founding : p.regular
}

export function getPlanSetupFee(plan: string): number {
  const fees: Record<string, number> = {
    starter: 4999,
    growth: 9999,
    business: 19999,
  }
  return fees[plan] ?? 0
}
