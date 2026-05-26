import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { orgId, sessionId, moduleId, participantName, participantEmail, score, xpEarned } = await request.json()

    const supabase = createAdminClient()

    await supabase.from('module_completions').insert({
      org_id: orgId,
      module_id: moduleId,
      participant_name: participantName,
      participant_email: participantEmail,
      score,
      xp_earned: xpEarned,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Module completion error:', err)
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
  }
}
