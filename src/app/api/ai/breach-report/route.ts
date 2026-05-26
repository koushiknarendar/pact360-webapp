import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { draftBreachReport } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { breachId } = await request.json()

    const { data: breach } = await supabase
      .from('data_breaches')
      .select('*')
      .eq('id', breachId)
      .single()

    if (!breach) return NextResponse.json({ error: 'Breach not found' }, { status: 404 })

    const report = await draftBreachReport(breach)
    return NextResponse.json({ report })
  } catch (err) {
    console.error('Breach report error:', err)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
