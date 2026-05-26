import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { TrainingPortal } from '@/components/training-portal'

export default async function TrainingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('training_sessions')
    .select('*, organisations(id, name, public_token)')
    .eq('public_token', token)
    .single()

  if (!session) notFound()

  return (
    <div className="min-h-screen bg-[#0D0F14]">
      <TrainingPortal session={session} orgId={session.organisations?.id} orgName={session.organisations?.name ?? ''} />
    </div>
  )
}
