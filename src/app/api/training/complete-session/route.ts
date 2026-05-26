import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, participantName, participantEmail } = await request.json()

    const supabase = createAdminClient()

    await supabase.from('training_completions').insert({
      training_session_id: sessionId,
      employee_name: participantName,
      employee_email: participantEmail,
      completed_at: new Date().toISOString(),
    })

    await supabase.from('training_sessions')
      .update({ status: 'completed', conducted_at: new Date().toISOString() })
      .eq('id', sessionId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Session completion error:', err)
    return NextResponse.json({ error: 'Failed to record session completion' }, { status: 500 })
  }
}
