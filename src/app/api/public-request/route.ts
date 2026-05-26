import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      org_id,
      request_type,
      principal_name,
      principal_email,
      principal_phone,
      principal_id_type,
      principal_id_last4,
      description,
      data_categories,
    } = body

    if (!org_id || !request_type || !principal_name || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Determine priority
    let priority = 'medium'
    if (request_type === 'erasure' && data_categories?.some((c: string) => c.toLowerCase().includes('children') || c.toLowerCase().includes('minor'))) {
      priority = 'critical'
    } else if (request_type === 'erasure') {
      priority = 'high'
    } else if (request_type === 'access' && data_categories?.length > 5) {
      priority = 'high'
    }

    const { data, error } = await supabase
      .from('data_principal_requests')
      .insert({
        org_id,
        request_type,
        status: 'submitted',
        priority,
        principal_name,
        principal_email,
        principal_phone,
        principal_id_type,
        principal_id_last4,
        description,
        data_categories,
      })
      .select('request_number')
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    return NextResponse.json({ request_number: data.request_number })
  } catch (err) {
    console.error('Public request error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
