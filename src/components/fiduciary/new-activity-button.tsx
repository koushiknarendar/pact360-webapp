'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const schema = z.object({
  name: z.string().min(3),
  purpose: z.string().min(10),
  lawful_basis: z.enum(['consent', 'legitimate_use']),
  retention_period: z.string().min(2),
  involves_children: z.boolean(),
  cross_border_transfer: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function NewActivityButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataCategories, setDataCategories] = useState('')
  const [dataSubjects, setDataSubjects] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lawful_basis: 'consent', involves_children: false, cross_border_transfer: false },
  })

  const involvesChildren = watch('involves_children')
  const crossBorder = watch('cross_border_transfer')

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('processing_activities').insert({
      org_id: orgId,
      ...data,
      data_categories: dataCategories.split(',').map(c => c.trim()).filter(Boolean),
      data_subjects: dataSubjects.split(',').map(s => s.trim()).filter(Boolean),
    })

    if (error) {
      toast.error('Failed to add activity')
    } else {
      toast.success('Processing activity added to RoPA')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add Activity
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Processing Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Activity name *</Label>
            <Input {...register('name')} placeholder="e.g. User Registration" className="bg-zinc-800 border-zinc-700 text-white" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Purpose *</Label>
            <Input {...register('purpose')} placeholder="e.g. To create and manage user accounts" className="bg-zinc-800 border-zinc-700 text-white" />
            {errors.purpose && <p className="text-red-400 text-xs">{errors.purpose.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Data categories (comma-separated) *</Label>
            <Input value={dataCategories} onChange={e => setDataCategories(e.target.value)} placeholder="Name, Email, Phone" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Data subjects (comma-separated) *</Label>
            <Input value={dataSubjects} onChange={e => setDataSubjects(e.target.value)} placeholder="Customers, Employees" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Lawful basis</Label>
              <Select defaultValue="consent" onValueChange={v => v && setValue('lawful_basis', v as 'consent' | 'legitimate_use')}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="consent" className="text-zinc-300">Consent</SelectItem>
                  <SelectItem value="legitimate_use" className="text-zinc-300">Legitimate Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Retention period *</Label>
              <Input {...register('retention_period')} placeholder="e.g. 2 years" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={involvesChildren}
                onCheckedChange={v => setValue('involves_children', v as boolean)}
                className="border-zinc-600"
              />
              <span className="text-zinc-300 text-sm">Involves children&apos;s data</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={crossBorder}
                onCheckedChange={v => setValue('cross_border_transfer', v as boolean)}
                className="border-zinc-600"
              />
              <span className="text-zinc-300 text-sm">Cross-border transfer</span>
            </label>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white">
            {loading ? 'Adding...' : 'Add to RoPA'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
