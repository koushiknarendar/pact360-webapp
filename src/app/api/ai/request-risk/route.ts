import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeRequestRisk } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { requestId } = await request.json()

    const { data: req } = await supabase
      .from('data_principal_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    const analysis = await analyzeRequestRisk(req)
    return NextResponse.json(analysis)
  } catch (err) {
    console.error('Risk analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
