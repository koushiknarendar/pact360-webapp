import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ConsentActions } from '@/components/fiduciary/consent-actions'

const statusColors: Record<string, string> = {
  active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  withdrawn: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default async function ConsentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: consents } = await supabase
    .from('consents')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Consent Register</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Record of all personal data consents collected from Data Principals
          </p>
        </div>
        <ConsentActions orgId={org.id} />
      </div>

      <div className="space-y-3">
        {!consents || consents.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No consent records yet.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Record consents received from your customers and users.
              </p>
            </CardContent>
          </Card>
        ) : (
          consents.map(consent => (
            <Card key={consent.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={statusColors[consent.status]}>
                        {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-white text-sm font-medium">{consent.purpose}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {consent.principal_email ?? consent.principal_phone ?? 'Anonymous'}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Data: {consent.data_categories.join(', ')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    {consent.consented_at && <p>Consented {formatDate(consent.consented_at)}</p>}
                    {consent.expires_at && <p>Expires {formatDate(consent.expires_at)}</p>}
                    {consent.withdrawn_at && <p className="text-red-400">Withdrawn {formatDate(consent.withdrawn_at)}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
