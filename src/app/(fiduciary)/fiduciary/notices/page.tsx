import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { NoticeActions } from '@/components/fiduciary/notice-actions'

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  archived: 'bg-zinc-800 text-zinc-600 border-zinc-700',
}

export default async function NoticesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organisations')
    .select('id, name, industry, size, grievance_officer_name, grievance_officer_email')
    .eq('owner_id', user.id)
    .single()

  if (!org) redirect('/onboarding')

  const { data: notices } = await supabase
    .from('privacy_notices')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Privacy Notices</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your DPDP-compliant privacy notice versions
          </p>
        </div>
        <NoticeActions orgId={org.id} org={org} />
      </div>

      <div className="space-y-3">
        {!notices || notices.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-zinc-400">No privacy notices yet.</p>
              <p className="text-zinc-500 text-sm mt-1">
                Use AI to generate a DPDP-compliant notice from your organisation profile and processing activities.
              </p>
            </CardContent>
          </Card>
        ) : (
          notices.map(notice => (
            <Card key={notice.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-white text-sm">{notice.title}</CardTitle>
                    <span className="text-xs text-zinc-500 font-mono">{notice.version}</span>
                    <Badge variant="outline" className={statusColors[notice.status]}>
                      {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500">{formatDate(notice.created_at)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm line-clamp-3">{notice.content.substring(0, 200)}...</p>
                {notice.status === 'draft' && (
                  <NoticePublishButton noticeId={notice.id} />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function NoticePublishButton({ noticeId }: { noticeId: string }) {
  return (
    <form action={async () => {
      'use server'
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase.from('privacy_notices')
        .update({ status: 'active', published_at: new Date().toISOString() })
        .eq('id', noticeId)
    }}>
      <button type="submit" className="mt-3 text-xs text-[#2A9D8F] hover:underline">
        Publish this notice →
      </button>
    </form>
  )
}
