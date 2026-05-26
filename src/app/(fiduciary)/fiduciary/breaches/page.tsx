import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getHoursRemaining, breachStatusLabel } from '@/lib/utils'
import { AlertTriangle, Clock } from 'lucide-react'
import { NewBreachButton } from '@/components/fiduciary/new-breach-button'

const severityColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const statusColors: Record<string, string> = {
  detected: 'bg-red-500/20 text-red-400 border-red-500/30',
  contained: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  notified_dpb: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  notified_principals: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  closed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

export default async function BreachesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: breaches } = await supabase
    .from('data_breaches')
    .select('*')
    .eq('org_id', org.id)
    .order('detected_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Breaches</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track and manage data breach incidents. DPB must be notified within 72 hours of detection.
          </p>
        </div>
        <NewBreachButton orgId={org.id} />
      </div>

      <div className="space-y-3">
        {!breaches || breaches.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No breach incidents recorded.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Report a breach immediately when detected — the 72-hour DPB notification clock starts then.
              </p>
            </CardContent>
          </Card>
        ) : (
          breaches.map(breach => {
            const hoursLeft = breach.dpb_notification_deadline && breach.status === 'detected'
              ? getHoursRemaining(breach.dpb_notification_deadline)
              : null
            const isUrgent = hoursLeft !== null && hoursLeft <= 24
            const isOverdue = hoursLeft !== null && hoursLeft <= 0

            return (
              <Link key={breach.id} href={`/fiduciary/breaches/${breach.id}`}>
                <Card className={`bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer ${isUrgent ? 'border-red-500/50' : ''}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-zinc-500">{breach.breach_number}</span>
                          <Badge variant="outline" className={severityColors[breach.severity]}>
                            {breach.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={statusColors[breach.status]}>
                            {breachStatusLabel(breach.status)}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium">{breach.title}</p>
                        <p className="text-zinc-400 text-xs truncate mt-0.5">{breach.description}</p>
                        <p className="text-zinc-500 text-xs mt-1">Detected {formatDate(breach.detected_at)}</p>
                      </div>
                      {hoursLeft !== null && !isOverdue && (
                        <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${isUrgent ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                          <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-400' : 'text-orange-400'}`} />
                          <span className={`text-lg font-bold tabular-nums ${isUrgent ? 'text-red-400' : 'text-orange-400'}`}>
                            {hoursLeft}h
                          </span>
                          <span className="text-xs text-zinc-500">DPB</span>
                        </div>
                      )}
                      {isOverdue && breach.status === 'detected' && (
                        <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-red-600/20">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span className="text-xs text-red-400 font-bold mt-1">OVERDUE</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
