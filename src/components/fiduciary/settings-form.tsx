'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Organisation } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export function SettingsForm({ org }: { org: Organisation }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: org.name,
    website: org.website ?? '',
    gstin: org.gstin ?? '',
    cin: org.cin ?? '',
    registered_address: org.registered_address ?? '',
    grievance_officer_name: org.grievance_officer_name ?? '',
    grievance_officer_email: org.grievance_officer_email ?? '',
    grievance_officer_phone: org.grievance_officer_phone ?? '',
    is_significant_data_fiduciary: org.is_significant_data_fiduciary,
  })

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('organisations').update(form).eq('id', org.id)
    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Organisation Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your organisation details and compliance configuration</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Organisation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Organisation name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Website</Label>
            <Input value={form.website} onChange={e => set('website', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">GSTIN</Label>
              <Input value={form.gstin} onChange={e => set('gstin', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">CIN</Label>
              <Input value={form.cin} onChange={e => set('cin', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Registered address</Label>
            <Input value={form.registered_address} onChange={e => set('registered_address', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={form.is_significant_data_fiduciary}
              onCheckedChange={v => set('is_significant_data_fiduciary', v as boolean)}
              className="border-zinc-600"
            />
            <span className="text-zinc-300 text-sm">Designated as Significant Data Fiduciary (SDF)</span>
          </label>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Grievance Officer</CardTitle>
          <p className="text-zinc-400 text-xs mt-0.5">Required under DPDP Act Section 13. This person handles all Data Principal requests.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Name</Label>
            <Input value={form.grievance_officer_name} onChange={e => set('grievance_officer_name', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input value={form.grievance_officer_email} onChange={e => set('grievance_officer_email', e.target.value)} type="email" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone</Label>
              <Input value={form.grievance_officer_phone} onChange={e => set('grievance_officer_phone', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="bg-[#C23B22] hover:bg-[#a8321d] text-white">
        {loading ? 'Saving...' : 'Save settings'}
      </Button>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Public Portal Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Rights Request Portal</p>
            <code className="text-[#2A9D8F] text-xs bg-zinc-800 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL}/rights/{org.public_token}
            </code>
          </div>
          {org.slug && (
            <div>
              <p className="text-zinc-500 text-xs mb-1">Subdomain Portal</p>
              <code className="text-[#2A9D8F] text-xs bg-zinc-800 px-2 py-1 rounded">
                https://{org.slug}.pact360.in/rights
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
