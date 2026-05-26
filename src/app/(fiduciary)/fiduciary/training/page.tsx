import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { NewTrainingSessionButton } from '@/components/fiduciary/new-training-session-button'
import { Users, Trophy, Link as LinkIcon } from 'lucide-react'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('*, training_completions(count)')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  const { count: totalCompletions } = await supabase
    .from('module_completions')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">DPDP Training</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Send employees on the 5-module DPDP awareness programme
          </p>
        </div>
        <NewTrainingSessionButton orgId={org.id} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{sessions?.length ?? 0}</div>
                <div className="text-xs text-zinc-400">Training Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-[#D4A843]" />
              <div>
                <div className="text-2xl font-bold text-white">{totalCompletions ?? 0}</div>
                <div className="text-xs text-zinc-400">Module Completions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {!sessions || sessions.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No training sessions yet.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Create a session and send the link to your employees. No login required.
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map(session => {
            const trainingUrl = `${appUrl}/train/${session.public_token}`
            return (
              <Card key={session.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{session.title}</p>
                        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 capitalize">
                          {session.mode}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          session.status === 'completed'
                            ? 'border-teal-500/30 text-teal-400'
                            : 'border-yellow-500/30 text-yellow-400'
                        }`}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <LinkIcon className="h-3 w-3 text-zinc-500" />
                        <code className="text-[#2A9D8F] text-xs truncate max-w-xs">{trainingUrl}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(trainingUrl)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 ml-1"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500">
                      <p>{formatDate(session.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
