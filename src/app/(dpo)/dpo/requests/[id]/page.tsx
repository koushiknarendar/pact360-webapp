import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RequestDetail } from '@/components/fiduciary/request-detail'

export default async function DpoRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dpoRecord } = await supabase
    .from('dpos')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!dpoRecord) redirect('/dpo')

  const { data: request } = await supabase
    .from('data_principal_requests')
    .select('*')
    .eq('id', id)
    .eq('assigned_dpo_id', dpoRecord.id)
    .single()

  if (!request) notFound()

  return (
    <div>
      <div className="px-8 pt-6 pb-0">
        <a href="/dpo" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
          ← Back to dashboard
        </a>
      </div>
      <RequestDetail request={request} />
    </div>
  )
}
