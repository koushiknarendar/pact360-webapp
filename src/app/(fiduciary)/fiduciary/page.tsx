import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { complianceScoreColor, complianceStatusLabel, getDaysRemaining, formatDate } from '@/lib/utils'
import { AlertTriangle, FileText, Shield, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default async function FiduciaryDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  // Parallel data fetching
  const [
    { count: openRequests },
    { count: overdueRequests },
    { data: activeBreaches },
    { count: totalConsents },
    { count: trainingCount },
  ] = await Promise.all([
    supabase.from('data_principal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .not('status', 'in', '("resolved","rejected")'),
    supabase.from('data_principal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .lt('deadline_at', new Date().toISOString())
      .not('status', 'in', '("resolved","rejected")'),
    supabase.from('data_breaches')
      .select('id, title, severity, status, dpb_notification_deadline, detected_at')
      .eq('org_id', org.id)
      .not('status', 'in', '("closed")'),
    supabase.from('consents')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .eq('status', 'active'),
    supabase.from('module_completions')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id),
  ])

  const score = org.compliance_score ?? 0
  const scoreColor = complianceScoreColor(score)

  const actionItems: { text: string; href: string; done: boolean }[] = [
    {
      text: 'Add grievance officer details',
      href: '/fiduciary/settings',
      done: !!org.grievance_officer_email,
    },
    {
      text: 'Publish your privacy notice',
      href: '/fiduciary/notices',
      done: false, // checked server-side below
    },
    {
      text: 'Add a processing activity to RoPA',
      href: '/fiduciary/ropa',
      done: false,
    },
    {
      text: 'Complete employee DPDP training',
      href: '/fiduciary/training',
      done: (trainingCount ?? 0) >= 5,
    },
    {
      text: 'Resolve all overdue rights requests',
      href: '/fiduciary/requests',
      done: (overdueRequests ?? 0) === 0,
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{org.name}</h1>
        <p className="text-zinc-400 text-sm mt-1">DPDP Compliance Dashboard</p>
      </div>

      {/* Compliance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center">
            <div className={`text-7xl font-bold tabular-nums ${scoreColor}`}>{score}</div>
            <div className="text-zinc-400 text-sm mt-2">PACT Score</div>
            <Badge
              className={`mt-3 ${
                score < 50
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : score < 76
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
              }`}
              variant="outline"
            >
              {complianceStatusLabel(org.compliance_status)}
            </Badge>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{openRequests ?? 0}</div>
                  <div className="text-xs text-zinc-400">Open Rights Requests</div>
                </div>
              </div>
              {(overdueRequests ?? 0) > 0 && (
                <p className="text-xs text-red-400 mt-2">{overdueRequests} overdue</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{activeBreaches?.length ?? 0}</div>
                  <div className="text-xs text-zinc-400">Active Breaches</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-teal-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{totalConsents ?? 0}</div>
                  <div className="text-xs text-zinc-400">Active Consents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{trainingCount ?? 0}</div>
                  <div className="text-xs text-zinc-400">Training Completions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Breaches — urgent section */}
      {activeBreaches && activeBreaches.length > 0 && (
        <Card className="bg-red-950/30 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Active Data Breaches — Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeBreaches.map(breach => {
              const hoursLeft = breach.dpb_notification_deadline
                ? Math.max(0, Math.ceil((new Date(breach.dpb_notification_deadline).getTime() - Date.now()) / 3600000))
                : null
              return (
                <Link
                  key={breach.id}
                  href={`/fiduciary/breaches/${breach.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 hover:bg-red-900/30 transition-colors"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{breach.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Detected {formatDate(breach.detected_at)}
                    </p>
                  </div>
                  {hoursLeft !== null && (
                    <div className="text-right">
                      <div className={`text-sm font-bold ${hoursLeft < 12 ? 'text-red-400' : 'text-orange-400'}`}>
                        {hoursLeft}h
                      </div>
                      <div className="text-xs text-zinc-500">DPB deadline</div>
                    </div>
                  )}
                </Link>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
                )}
                <span className={`text-sm ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {item.text}
                </span>
              </div>
              {!item.done && (
                <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                  Pending
                </Badge>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
