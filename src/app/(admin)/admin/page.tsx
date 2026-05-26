import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FileText, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { count: orgCount },
    { count: dpoCount },
    { count: requestCount },
    { count: breachCount },
  ] = await Promise.all([
    supabase.from('organisations').select('*', { count: 'exact', head: true }),
    supabase.from('dpos').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('data_principal_requests').select('*', { count: 'exact', head: true }),
    supabase.from('data_breaches').select('*', { count: 'exact', head: true }).not('status', 'eq', 'closed'),
  ])

  const stats = [
    { icon: Building2, label: 'Organisations', value: orgCount ?? 0, color: 'text-blue-400' },
    { icon: Users, label: 'Approved DPOs', value: dpoCount ?? 0, color: 'text-teal-400' },
    { icon: FileText, label: 'Total Requests', value: requestCount ?? 0, color: 'text-purple-400' },
    { icon: AlertTriangle, label: 'Active Breaches', value: breachCount ?? 0, color: 'text-orange-400' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">PACT360 admin dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-400">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
