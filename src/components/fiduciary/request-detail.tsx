'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataPrincipalRequest, RequestStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatDateTime, getDaysRemaining, requestTypeLabel, requestStatusLabel } from '@/lib/utils'
import { Clock, AlertCircle, User, Mail, Phone, FileText } from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  acknowledged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  rejected: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function RequestDetail({ request }: { request: DataPrincipalRequest }) {
  const router = useRouter()
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [resolutionNotes, setResolutionNotes] = useState(request.resolution_notes ?? '')
  const [saving, setSaving] = useState(false)

  const daysLeft = request.deadline_at ? getDaysRemaining(request.deadline_at) : null
  const isOverdue = daysLeft !== null && daysLeft < 0 && !['resolved', 'rejected'].includes(request.status)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const updates: Partial<DataPrincipalRequest> = { status, resolution_notes: resolutionNotes }

    if (status === 'acknowledged' && !request.acknowledged_at) {
      updates.acknowledged_at = new Date().toISOString()
    }
    if (status === 'resolved' && !request.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('data_principal_requests')
      .update(updates)
      .eq('id', request.id)

    if (error) {
      toast.error('Failed to update request')
    } else {
      toast.success('Request updated')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-500">{request.request_number}</span>
            <Badge variant="outline" className={statusColors[request.status]}>
              {requestStatusLabel(request.status)}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">{requestTypeLabel(request.request_type)}</h1>
          <p className="text-zinc-400 text-sm mt-1">Submitted {formatDateTime(request.submitted_at)}</p>
        </div>
        {daysLeft !== null && !['resolved', 'rejected'].includes(request.status) && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isOverdue ? 'bg-red-500/20 text-red-400' : daysLeft <= 7 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Principal */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Data Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-white font-medium">{request.principal_name}</p>
            </div>
            {request.principal_email && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Mail className="h-3 w-3" />
                {request.principal_email}
              </div>
            )}
            {request.principal_phone && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Phone className="h-3 w-3" />
                {request.principal_phone}
              </div>
            )}
            {request.principal_id_type && (
              <div className="text-zinc-500 text-xs">
                ID: {request.principal_id_type.toUpperCase()} ending {request.principal_id_last4}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Type</p>
              <p className="text-white text-sm">{requestTypeLabel(request.request_type)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Priority</p>
              <p className="text-white text-sm capitalize">{request.priority}</p>
            </div>
            {request.deadline_at && (
              <div>
                <p className="text-xs text-zinc-500">Statutory Deadline</p>
                <p className="text-white text-sm">{formatDate(request.deadline_at)}</p>
              </div>
            )}
            {request.data_categories && request.data_categories.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Data Categories</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.data_categories.map(cat => (
                    <Badge key={cat} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Request Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-300 text-sm leading-relaxed">{request.description}</p>
        </CardContent>
      </Card>

      {/* Status Management */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as RequestStatus)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {(['submitted', 'acknowledged', 'in_review', 'resolved', 'rejected', 'escalated'] as RequestStatus[]).map(s => (
                  <SelectItem key={s} value={s} className="text-zinc-300">
                    {requestStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Resolution notes</Label>
            <Textarea
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="Document the actions taken to resolve this request..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#C23B22] hover:bg-[#a8321d] text-white"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
