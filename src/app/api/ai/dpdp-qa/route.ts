import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { answerDPDPQuestion } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question } = await request.json()
    if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 })

    const answer = await answerDPDPQuestion(question)
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('DPDP QA error:', err)
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 })
  }
}
