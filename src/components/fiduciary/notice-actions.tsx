'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Sparkles, Loader2 } from 'lucide-react'

interface NoticeActionsProps {
  orgId: string
  org: Record<string, unknown>
}

export function NoticeActions({ orgId, org }: NoticeActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [title, setTitle] = useState('Privacy Notice')
  const [version, setVersion] = useState('v1.0')

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/privacy-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      })
      const data = await res.json()
      if (data.content) {
        setGeneratedContent(data.content)
        toast.success('Privacy notice generated')
      } else {
        toast.error('Generation failed')
      }
    } catch {
      toast.error('Failed to generate notice')
    }
    setGenerating(false)
  }

  async function handleSave() {
    if (!generatedContent && !title) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('privacy_notices').insert({
      org_id: orgId,
      version,
      title,
      content: generatedContent,
      status: 'draft',
      created_by: user?.id,
    })

    if (error) {
      toast.error('Failed to save notice')
    } else {
      toast.success('Notice saved as draft')
      setOpen(false)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        <Plus className="h-4 w-4 mr-2" />
        New Notice
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Privacy Notice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Notice title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Version</Label>
              <Input value={version} onChange={e => setVersion(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="outline"
            className="w-full border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#2A9D8F]/10"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating with AI...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate with AI from your RoPA</>
            )}
          </Button>

          <div className="space-y-2">
            <Label className="text-zinc-300">Notice content</Label>
            <Textarea
              value={generatedContent}
              onChange={e => setGeneratedContent(e.target.value)}
              placeholder="AI-generated content will appear here. You can edit before saving."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[300px] font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !generatedContent}
            className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white"
          >
            {saving ? 'Saving...' : 'Save as draft'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
