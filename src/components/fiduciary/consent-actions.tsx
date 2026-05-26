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
  principal_email: z.string().email().optional().or(z.literal('')),
  purpose: z.string().min(3),
  purpose_description: z.string().min(10),
  consent_text: z.string().min(10),
  lawful_basis: z.enum(['consent', 'legitimate_use']),
})

type FormData = z.infer<typeof schema>

export function ConsentActions({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lawful_basis: 'consent' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('consents').insert({
      org_id: orgId,
      principal_email: data.principal_email || undefined,
      purpose: data.purpose,
      purpose_description: data.purpose_description,
      consent_text: data.consent_text,
      lawful_basis: data.lawful_basis,
      data_categories: categories.split(',').map(c => c.trim()).filter(Boolean),
      status: 'active',
      consented_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Failed to record consent')
    } else {
      toast.success('Consent recorded')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        <Plus className="h-4 w-4 mr-2" />
        Record Consent
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Consent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Data Principal email</Label>
            <Input {...register('principal_email')} type="email" placeholder="user@email.com" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Purpose *</Label>
            <Input {...register('purpose')} placeholder="e.g. Marketing communications" className="bg-zinc-800 border-zinc-700 text-white" />
            {errors.purpose && <p className="text-red-400 text-xs">{errors.purpose.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Purpose description *</Label>
            <Textarea {...register('purpose_description')} placeholder="Describe how you will use this data..." className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Data categories (comma-separated) *</Label>
            <Input value={categories} onChange={e => setCategories(e.target.value)} placeholder="Email, Name, Phone" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
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
            <Label className="text-zinc-300">Consent text shown to user *</Label>
            <Textarea {...register('consent_text')} placeholder="The exact consent text the user agreed to..." className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white">
            {loading ? 'Recording...' : 'Record consent'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
