import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dpiaGuidance } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { activityId } = await request.json()

    const { data: activity } = await supabase
      .from('processing_activities')
      .select('*')
      .eq('id', activityId)
      .single()

    if (!activity) return NextResponse.json({ error: 'Activity not found' }, { status: 404 })

    const guidance = await dpiaGuidance(activity)
    return NextResponse.json({ guidance })
  } catch (err) {
    console.error('DPIA error:', err)
    return NextResponse.json({ error: 'DPIA generation failed' }, { status: 500 })
  }
}
