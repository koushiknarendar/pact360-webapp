'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function NewTrainingSessionButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('DPDP Awareness Training')
  const [mode, setMode] = useState('online')

  async function handleCreate() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('training_sessions').insert({
      org_id: orgId,
      title,
      mode,
      status: 'pending',
    })

    if (error) {
      toast.error('Failed to create session')
    } else {
      toast.success('Training session created. Share the link with your employees.')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        <Plus className="h-4 w-4 mr-2" />
        New Session
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create Training Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">
            A training link will be generated. Share it with employees — no account needed.
          </p>
          <div className="space-y-2">
            <Label className="text-zinc-300">Session title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Mode</Label>
            <Select value={mode} onValueChange={v => v && setMode(v)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="online" className="text-zinc-300">Online (self-paced)</SelectItem>
                <SelectItem value="in_person" className="text-zinc-300">In-person</SelectItem>
                <SelectItem value="hybrid" className="text-zinc-300">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={loading || !title} className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white">
            {loading ? 'Creating...' : 'Create session'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
