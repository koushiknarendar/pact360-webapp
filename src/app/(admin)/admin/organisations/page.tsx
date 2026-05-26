import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Building2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const planColors: Record<string, string> = {
  starter:  'border-zinc-600 text-zinc-300',
  growth:   'border-teal-500/40 text-teal-400',
  business: 'border-blue-500/40 text-blue-400',
  enterprise: 'border-amber-500/40 text-amber-400',
}

const statusIcon = {
  compliant:    <CheckCircle className="h-3.5 w-3.5 text-teal-400" />,
  in_progress:  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />,
  at_risk:      <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />,
  not_started:  <XCircle className="h-3.5 w-3.5 text-zinc-500" />,
}

export default async function AdminOrganisationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgs } = await supabase
    .from('organisations')
    .select(`
      id, name, slug, subscription_plan, is_founding_member,
      compliance_score, compliance_status, created_at,
      subscriptions ( status, renews_at )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organisations</h1>
          <p className="text-zinc-400 text-sm mt-1">{orgs?.length ?? 0} registered organisations</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">All Organisations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!orgs || orgs.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">No organisations yet.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {orgs.map(org => {
                const sub = Array.isArray(org.subscriptions) ? org.subscriptions[0] : org.subscriptions
                const score = org.compliance_score ?? 0
                const scoreColor = score >= 70 ? 'text-teal-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'

                return (
                  <div key={org.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate">{org.name}</p>
                          {org.is_founding_member && (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs shrink-0">Founding</Badge>
                          )}
                        </div>
                        <p className="text-zinc-500 text-xs mt-0.5">{org.slug} · Joined {formatDate(org.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <Badge variant="outline" className={`text-xs ${planColors[org.subscription_plan ?? 'starter']}`}>
                          {org.subscription_plan ?? 'starter'}
                        </Badge>
                        {sub && (
                          <p className="text-zinc-500 text-xs mt-1">
                            Renews {sub.renews_at ? formatDate(sub.renews_at) : '—'}
                          </p>
                        )}
                      </div>

                      <div className="text-right w-24">
                        <div className="flex items-center justify-end gap-1.5">
                          {statusIcon[org.compliance_status as keyof typeof statusIcon] ?? statusIcon.not_started}
                          <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
                          <span className="text-zinc-600 text-xs">/100</span>
                        </div>
                        <p className="text-zinc-500 text-xs mt-0.5 capitalize">
                          {(org.compliance_status ?? 'not_started').replace('_', ' ')}
                        </p>
                      </div>

                      <div className="w-20 text-right">
                        <Badge
                          variant="outline"
                          className={sub?.status === 'active'
                            ? 'border-teal-500/30 text-teal-400 text-xs'
                            : 'border-zinc-700 text-zinc-500 text-xs'}
                        >
                          {sub?.status ?? 'no sub'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
