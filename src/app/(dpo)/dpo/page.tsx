import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, requestTypeLabel, requestStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { FileText, AlertTriangle, Clock } from 'lucide-react'

export default async function DpoDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dpoRecord } = await supabase
    .from('dpos')
    .select('id, status, availability, rating, cases_handled')
    .eq('profile_id', user.id)
    .single()

  const { data: assignedRequests } = await supabase
    .from('data_principal_requests')
    .select('*, organisations(name)')
    .eq('assigned_dpo_id', dpoRecord?.id ?? '')
    .not('status', 'in', '("resolved","rejected")')
    .order('deadline_at', { ascending: true })
    .limit(10)

  const { data: assignedBreaches } = await supabase
    .from('data_breaches')
    .select('*, organisations(name)')
    .eq('assigned_dpo_id', dpoRecord?.id ?? '')
    .not('status', 'in', '("closed")')
    .order('detected_at', { ascending: false })

  if (!dpoRecord || dpoRecord.status === 'pending') {
    return (
      <div className="p-8">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-white font-bold">Account Under Review</h2>
            <p className="text-zinc-400 text-sm mt-2">
              Your DPO profile is pending approval. We&apos;ll notify you once it&apos;s approved.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">DPO Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Your assigned requests and breach cases</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={dpoRecord.availability ? 'border-teal-500/30 text-teal-400' : 'border-zinc-700 text-zinc-400'}>
            {dpoRecord.availability ? 'Available' : 'Unavailable'}
          </Badge>
          <span className="text-zinc-400 text-sm">{dpoRecord.cases_handled} cases handled</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{assignedRequests?.length ?? 0}</div>
                <div className="text-xs text-zinc-400">Open Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{assignedBreaches?.length ?? 0}</div>
                <div className="text-xs text-zinc-400">Active Breaches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Assigned Rights Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!assignedRequests || assignedRequests.length === 0 ? (
            <p className="text-zinc-500 text-sm">No requests assigned yet.</p>
          ) : (
            assignedRequests.map(req => (
              <Link key={req.id} href={`/dpo/requests/${req.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors">
                  <div>
                    <p className="text-white text-sm">{req.principal_name}</p>
                    <p className="text-zinc-400 text-xs">{requestTypeLabel(req.request_type)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {requestStatusLabel(req.status)}
                    </Badge>
                    {req.deadline_at && (
                      <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {formatDate(req.deadline_at)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
