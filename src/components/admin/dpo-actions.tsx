'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

interface DpoActionsProps {
  dpoId: string
  currentStatus: string
}

export function DpoActions({ dpoId, currentStatus }: DpoActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function updateStatus(status: 'approved' | 'rejected') {
    setLoading(status === 'approved' ? 'approve' : 'reject')
    const supabase = createClient()
    const { error } = await supabase
      .from('dpos')
      .update({ status })
      .eq('id', dpoId)

    if (error) {
      toast.error('Failed to update DPO status')
    } else {
      toast.success(`DPO ${status}`)
      router.refresh()
    }
    setLoading(null)
  }

  if (currentStatus === 'approved') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-teal-400 text-xs font-medium flex items-center gap-1">
          <Check className="h-3 w-3" /> Approved
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-zinc-700 text-zinc-400 hover:border-red-500/40 hover:text-red-400"
          disabled={!!loading}
          onClick={() => updateStatus('rejected')}
        >
          Revoke
        </Button>
      </div>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-xs font-medium flex items-center gap-1">
          <X className="h-3 w-3" /> Rejected
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-zinc-700 text-zinc-400 hover:border-teal-500/40 hover:text-teal-400"
          disabled={!!loading}
          onClick={() => updateStatus('approved')}
        >
          Approve
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white"
        disabled={!!loading}
        onClick={() => updateStatus('approved')}
      >
        {loading === 'approve' ? '...' : <><Check className="h-3 w-3 mr-1" />Approve</>}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-zinc-700 text-zinc-400 hover:border-red-500/40 hover:text-red-400"
        disabled={!!loading}
        onClick={() => updateStatus('rejected')}
      >
        {loading === 'reject' ? '...' : <><X className="h-3 w-3 mr-1" />Reject</>}
      </Button>
    </div>
  )
}
