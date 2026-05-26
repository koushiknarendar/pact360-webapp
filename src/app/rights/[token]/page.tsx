import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PublicRightsForm } from '@/components/public-rights-form'

export default async function PublicRightsPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organisations')
    .select('id, name, grievance_officer_name')
    .eq('public_token', token)
    .single()

  if (!org) notFound()

  return (
    <div className="min-h-screen bg-[#0D0F14] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Data Principal Rights Portal</p>
          <h1 className="text-3xl font-bold text-white">{org.name}</h1>
          <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
            Under the Digital Personal Data Protection Act, 2023, you have the right to access,
            correct, or erase your personal data. Submit your request below and we will respond
            within 30 days.
          </p>
        </div>
        <PublicRightsForm orgId={org.id} orgName={org.name} />
      </div>
    </div>
  )
}
