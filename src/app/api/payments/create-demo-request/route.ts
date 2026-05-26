import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  contact_name: z.string().min(2),
  email: z.string().email(),
  company_name: z.string().min(2),
  phone: z.string().optional(),
  plan: z.enum(['starter', 'growth', 'business']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('demo_requests')
    .insert({
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      company_name: parsed.data.company_name,
      phone: parsed.data.phone ?? null,
      plan: parsed.data.plan,
      status: 'lead',
    })
    .select('id')
    .single()

  if (error) {
    console.error('demo_request insert:', error)
    return NextResponse.json({ error: 'Failed to save details' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
