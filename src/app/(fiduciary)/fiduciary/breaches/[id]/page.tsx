import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BreachDetail } from '@/components/fiduciary/breach-detail'

export default async function BreachDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: breach } = await supabase
    .from('data_breaches')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single()

  if (!breach) notFound()

  return <BreachDetail breach={breach} />
}
