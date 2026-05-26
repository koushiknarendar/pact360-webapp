import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function FiduciaryLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'fiduciary') redirect(`/${profile?.role ?? 'login'}`)

  const { data: org } = await supabase
    .from('organisations')
    .select('name')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-[#0D0F14]">
      <Sidebar role="fiduciary" orgName={org?.name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
