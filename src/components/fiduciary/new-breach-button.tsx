'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  detected_at: z.string(),
  estimated_principals_affected: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewBreachButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium', detected_at: new Date().toISOString().slice(0, 16) },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('data_breaches').insert({
      org_id: orgId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      detected_at: new Date(data.detected_at).toISOString(),
      estimated_principals_affected: data.estimated_principals_affected
        ? parseInt(data.estimated_principals_affected)
        : undefined,
    })

    if (error) {
      toast.error('Failed to report breach')
    } else {
      toast.success('Breach reported. 72-hour DPB notification clock has started.')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        <Plus className="h-4 w-4 mr-2" />
        Report Breach
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Data Breach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-xs font-medium">
              The 72-hour DPB notification window starts from the time of detection you enter below.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Breach title *</Label>
            <Input {...register('title')} placeholder="e.g. Customer database exposed" className="bg-zinc-800 border-zinc-700 text-white" />
            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Description *</Label>
            <Textarea {...register('description')} placeholder="What happened? How was it discovered?" className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]" />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Severity *</Label>
              <Select defaultValue="medium" onValueChange={v => v && setValue('severity', v as 'low' | 'medium' | 'high' | 'critical')}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="low" className="text-zinc-300">Low</SelectItem>
                  <SelectItem value="medium" className="text-zinc-300">Medium</SelectItem>
                  <SelectItem value="high" className="text-zinc-300">High</SelectItem>
                  <SelectItem value="critical" className="text-zinc-300">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Estimated individuals affected</Label>
              <Input {...register('estimated_principals_affected')} type="number" placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">When was it detected? *</Label>
            <Input {...register('detected_at')} type="datetime-local" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white">
            {loading ? 'Reporting...' : 'Report breach — start clock'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>

  )
}
