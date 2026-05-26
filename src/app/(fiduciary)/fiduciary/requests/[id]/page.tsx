import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RequestDetail } from '@/components/fiduciary/request-detail'

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: request } = await supabase
    .from('data_principal_requests')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single()

  if (!request) notFound()

  return <RequestDetail request={request} />
}
