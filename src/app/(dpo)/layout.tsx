import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DpoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'dpo') redirect(`/${profile?.role ?? 'login'}`)

  return (
    <div className="flex min-h-screen bg-[#0D0F14]">
      <Sidebar role="dpo" orgName={profile?.full_name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
