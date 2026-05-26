import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePrivacyNotice } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orgId } = await request.json()

    const [{ data: org }, { data: activities }] = await Promise.all([
      supabase.from('organisations').select('*').eq('id', orgId).eq('owner_id', user.id).single(),
      supabase.from('processing_activities').select('*').eq('org_id', orgId).eq('is_active', true),
    ])

    if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

    const content = await generatePrivacyNotice(org, activities ?? [])
    return NextResponse.json({ content })
  } catch (err) {
    console.error('Privacy notice generation error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
