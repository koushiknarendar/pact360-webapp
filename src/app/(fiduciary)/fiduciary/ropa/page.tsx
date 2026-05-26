import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { NewActivityButton } from '@/components/fiduciary/new-activity-button'
import { Users, Globe, Baby } from 'lucide-react'

export default async function RopaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: activities } = await supabase
    .from('processing_activities')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Record of Processing Activities</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Maintain a complete register of all personal data processing activities (RoPA)
          </p>
        </div>
        <NewActivityButton orgId={org.id} />
      </div>

      <div className="space-y-3">
        {!activities || activities.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No processing activities recorded yet.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Add every activity where your organisation collects or processes personal data.
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map(activity => (
            <Card key={activity.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{activity.name}</p>
                      {activity.involves_children && (
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                          <Baby className="h-3 w-3 mr-1" />Children
                        </Badge>
                      )}
                      {activity.cross_border_transfer && (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          <Globe className="h-3 w-3 mr-1" />Cross-border
                        </Badge>
                      )}
                      <Badge variant="outline" className={activity.is_active ? 'border-teal-500/30 text-teal-400' : 'border-zinc-700 text-zinc-500'}>
                        {activity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-zinc-400 text-sm">{activity.purpose}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activity.data_categories.map((cat: string) => (
                        <span key={cat} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <p className="capitalize">{activity.lawful_basis.replace('_', ' ')}</p>
                    <p className="mt-0.5">Retention: {activity.retention_period}</p>
                    {activity.last_reviewed_at && (
                      <p className="mt-0.5">Reviewed {formatDate(activity.last_reviewed_at)}</p>
                    )}
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
