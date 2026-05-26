'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataBreach, BreachStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime, breachStatusLabel } from '@/lib/utils'
import { AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

const severityColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('OVERDUE')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const isOverdue = timeLeft === 'OVERDUE'
  const diff = new Date(deadline).getTime() - Date.now()
  const isUrgent = diff > 0 && diff < 12 * 3600000

  return (
    <div className={`text-3xl font-bold font-mono tabular-nums ${isOverdue ? 'text-red-500' : isUrgent ? 'text-red-400' : 'text-orange-400'}`}>
      {timeLeft}
    </div>
  )
}

export function BreachDetail({ breach }: { breach: DataBreach }) {
  const router = useRouter()
  const [status, setStatus] = useState<BreachStatus>(breach.status)
  const [rootCause, setRootCause] = useState(breach.root_cause ?? '')
  const [remediationSteps, setRemediationSteps] = useState(breach.remediation_steps ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const updates: Partial<DataBreach> = { status, root_cause: rootCause, remediation_steps: remediationSteps }

    if (status === 'contained' && !breach.contained_at) {
      updates.contained_at = new Date().toISOString()
    }
    if (status === 'notified_dpb' && !breach.dpb_notified_at) {
      updates.dpb_notified_at = new Date().toISOString()
    }
    if (status === 'notified_principals' && !breach.principals_notified_at) {
      updates.principals_notified_at = new Date().toISOString()
    }

    const { error } = await supabase.from('data_breaches').update(updates).eq('id', breach.id)

    if (error) {
      toast.error('Failed to update breach')
    } else {
      toast.success('Breach updated')
      router.refresh()
    }
    setSaving(false)
  }

  const dpbHoursLeft = breach.dpb_notification_deadline
    ? Math.ceil((new Date(breach.dpb_notification_deadline).getTime() - Date.now()) / 3600000)
    : null

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-500">{breach.breach_number}</span>
            <Badge variant="outline" className={severityColors[breach.severity]}>
              {breach.severity.toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">{breach.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">Detected {formatDateTime(breach.detected_at)}</p>
        </div>
      </div>

      {/* DPB Countdown — most urgent element */}
      {breach.dpb_notification_deadline && !['notified_dpb', 'notified_principals', 'closed'].includes(breach.status) && (
        <Card className="bg-red-950/40 border-red-500/40">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <p className="text-red-400 text-sm font-medium">DPB Notification Deadline</p>
                </div>
                <p className="text-zinc-400 text-xs">
                  Data Protection Board must be notified by{' '}
                  {formatDateTime(breach.dpb_notification_deadline)}
                </p>
              </div>
              <div className="text-right">
                <CountdownTimer deadline={breach.dpb_notification_deadline} />
                <p className="text-zinc-500 text-xs mt-1">remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Principals notification */}
      {breach.principals_notification_deadline && !['notified_principals', 'closed'].includes(breach.status) && (
        <Card className="bg-orange-950/30 border-orange-500/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Principals Notification Deadline
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Notify affected individuals by {formatDateTime(breach.principals_notification_deadline)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Breach Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Description</p>
              <p className="text-zinc-300 text-sm mt-0.5">{breach.description}</p>
            </div>
            {breach.estimated_principals_affected && (
              <div>
                <p className="text-xs text-zinc-500">Estimated individuals affected</p>
                <p className="text-white text-sm font-bold">{breach.estimated_principals_affected.toLocaleString()}</p>
              </div>
            )}
            {breach.data_categories_affected && breach.data_categories_affected.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Data categories affected</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {breach.data_categories_affected.map(cat => (
                    <Badge key={cat} variant="outline" className="text-xs border-zinc-700 text-zinc-400">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Detected', value: breach.detected_at },
              { label: 'Contained', value: breach.contained_at },
              { label: 'DPB Notified', value: breach.dpb_notified_at },
              { label: 'Principals Notified', value: breach.principals_notified_at },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-zinc-500">{item.label}</span>
                <span className={item.value ? 'text-teal-400' : 'text-zinc-700'}>
                  {item.value ? formatDateTime(item.value) : 'Pending'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Update status */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Update Breach Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as BreachStatus)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {(['detected', 'contained', 'notified_dpb', 'notified_principals', 'closed'] as BreachStatus[]).map(s => (
                  <SelectItem key={s} value={s} className="text-zinc-300">{breachStatusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Root cause</Label>
            <Textarea
              value={rootCause}
              onChange={e => setRootCause(e.target.value)}
              placeholder="What caused the breach?"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Remediation steps</Label>
            <Textarea
              value={remediationSteps}
              onChange={e => setRemediationSteps(e.target.value)}
              placeholder="Steps taken or planned to prevent recurrence..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
