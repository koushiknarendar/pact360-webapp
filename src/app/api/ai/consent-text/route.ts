import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateConsentText } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { purpose, dataCategories, orgName } = await request.json()
    if (!purpose || !dataCategories) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const text = await generateConsentText(purpose, dataCategories, orgName)
    return NextResponse.json({ text })
  } catch (err) {
    console.error('Consent text error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
