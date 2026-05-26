import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DpoActions } from '@/components/admin/dpo-actions'
import { formatDate } from '@/lib/utils'
import { User, Star } from 'lucide-react'

const statusBadge: Record<string, string> = {
  pending:  'border-yellow-500/40 text-yellow-400',
  approved: 'border-teal-500/40 text-teal-400',
  rejected: 'border-red-500/40 text-red-400',
}

export default async function AdminDposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dpos } = await supabase
    .from('dpos')
    .select(`
      id, status, availability, rating, cases_handled, specializations, created_at,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })

  const pending  = dpos?.filter(d => d.status === 'pending') ?? []
  const approved = dpos?.filter(d => d.status === 'approved') ?? []
  const rejected = dpos?.filter(d => d.status === 'rejected') ?? []

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">DPO Management</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {pending.length} pending · {approved.length} approved · {rejected.length} rejected
        </p>
      </div>

      {/* Pending — shown first and prominently */}
      {pending.length > 0 && (
        <Card className="bg-zinc-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Pending Review ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DpoTable dpos={pending} />
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">All DPOs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!dpos || dpos.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">No DPO applications yet.</div>
          ) : (
            <DpoTable dpos={dpos} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type DpoRow = {
  id: string
  status: string
  availability: boolean
  rating: number | null
  cases_handled: number
  specializations: string[] | null
  created_at: string
  profiles: { full_name: string | null; email: string | null }[] | null
}

function DpoTable({ dpos }: { dpos: DpoRow[] }) {
  return (
    <div className="divide-y divide-zinc-800">
      {dpos.map(dpo => {
        const profile = Array.isArray(dpo.profiles) ? dpo.profiles[0] : dpo.profiles
        return (
          <div key={dpo.id} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium">{profile?.full_name ?? '—'}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{profile?.email ?? '—'}</p>
                {dpo.specializations && dpo.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dpo.specializations.slice(0, 3).map(s => (
                      <Badge key={s} variant="outline" className="text-xs border-zinc-700 text-zinc-400 py-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right text-xs text-zinc-500">
                <p>Applied {formatDate(dpo.created_at)}</p>
                <p className="mt-0.5">{dpo.cases_handled} cases</p>
                {dpo.rating != null && (
                  <p className="flex items-center justify-end gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400">{dpo.rating.toFixed(1)}</span>
                  </p>
                )}
              </div>

              <div>
                <Badge variant="outline" className={`text-xs ${statusBadge[dpo.status]}`}>
                  {dpo.status}
                </Badge>
              </div>

              <DpoActions dpoId={dpo.id} currentStatus={dpo.status} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
