import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getDaysRemaining, requestTypeLabel, requestStatusLabel } from '@/lib/utils'
import { Clock, AlertCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  acknowledged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  rejected: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const priorityColors: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: requests } = await supabase
    .from('data_principal_requests')
    .select('*')
    .eq('org_id', org.id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rights Requests</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Data Principal requests submitted to your organisation
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {!requests || requests.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No rights requests yet.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Share your public portal link so Data Principals can submit requests.
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map(req => {
            const daysLeft = req.deadline_at ? getDaysRemaining(req.deadline_at) : null
            const isOverdue = daysLeft !== null && daysLeft < 0 && !['resolved', 'rejected'].includes(req.status)
            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && !['resolved', 'rejected'].includes(req.status)

            return (
              <Link key={req.id} href={`/fiduciary/requests/${req.id}`}>
                <Card className={`bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer ${isOverdue ? 'border-red-500/50' : ''}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-zinc-500">{req.request_number}</span>
                          <Badge variant="outline" className={statusColors[req.status]}>
                            {requestStatusLabel(req.status)}
                          </Badge>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                            {requestTypeLabel(req.request_type)}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium mt-1">{req.principal_name}</p>
                        <p className="text-zinc-400 text-xs truncate mt-0.5">{req.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {daysLeft !== null && !['resolved', 'rejected'].includes(req.status) && (
                          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : isUrgent ? 'text-orange-400' : 'text-zinc-400'}`}>
                            {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </div>
                        )}
                        <p className="text-zinc-500 text-xs mt-1">{formatDate(req.submitted_at)}</p>
                        <p className={`text-xs font-medium mt-0.5 ${priorityColors[req.priority]}`}>
                          {req.priority.toUpperCase()}
                        </p>
                      </div>
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
