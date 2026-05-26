'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { generateSlug } from '@/lib/utils'
import { toast } from 'sonner'
import { Building2, User, Shield, ChevronRight, CheckCircle } from 'lucide-react'

const STEPS = ['Organisation', 'Grievance Officer', 'Data Fiduciary Type', 'Complete']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [orgData, setOrgData] = useState({
    name: '',
    industry: 'saas',
    size: '11-50',
    website: '',
    gstin: '',
    cin: '',
  })

  const [grievanceOfficer, setGrievanceOfficer] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [isSDF, setIsSDF] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = generateSlug(orgData.name)

    const { error } = await supabase.from('organisations').insert({
      owner_id: user.id,
      name: orgData.name,
      industry: orgData.industry,
      size: orgData.size,
      website: orgData.website || undefined,
      gstin: orgData.gstin || undefined,
      cin: orgData.cin || undefined,
      grievance_officer_name: grievanceOfficer.name,
      grievance_officer_email: grievanceOfficer.email,
      grievance_officer_phone: grievanceOfficer.phone || undefined,
      is_significant_data_fiduciary: isSDF,
      slug,
      onboarded_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Failed to create organisation')
      setLoading(false)
      return
    }

    toast.success('Organisation set up successfully')
    router.push('/fiduciary')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0D0F14] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white">Set up your DPDP compliance workspace</h1>
          <p className="text-zinc-400 text-sm mt-2">This takes about 3 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < step ? 'bg-teal-500 text-white' :
                i === step ? 'bg-[#C23B22] text-white' :
                'bg-zinc-800 text-zinc-500'
              }`}>
                {i < step ? <CheckCircle className="h-3 w-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-teal-500' : 'bg-zinc-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Organisation */}
        {step === 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organisation details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Organisation name *</Label>
                <Input
                  value={orgData.name}
                  onChange={e => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Acme Technologies Pvt Ltd"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Industry</Label>
                  <Select value={orgData.industry} onValueChange={v => v && setOrgData(prev => ({ ...prev, industry: v }))}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {['fintech', 'healthtech', 'edtech', 'ecommerce', 'saas', 'media', 'telecom', 'banking', 'insurance', 'other'].map(s => (
                        <SelectItem key={s} value={s} className="text-zinc-300 capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Organisation size</Label>
                  <Select value={orgData.size} onValueChange={v => v && setOrgData(prev => ({ ...prev, size: v }))}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => (
                        <SelectItem key={s} value={s} className="text-zinc-300">{s} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Website</Label>
                <Input
                  value={orgData.website}
                  onChange={e => setOrgData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://acme.in"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">GSTIN (optional)</Label>
                  <Input
                    value={orgData.gstin}
                    onChange={e => setOrgData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="22AAAAA0000A1Z5"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">CIN (optional)</Label>
                  <Input
                    value={orgData.cin}
                    onChange={e => setOrgData(prev => ({ ...prev, cin: e.target.value }))}
                    placeholder="U72200MH2020PTC123456"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={() => setStep(1)}
                disabled={!orgData.name}
                className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white"
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Grievance Officer */}
        {step === 1 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Grievance Officer
              </CardTitle>
              <p className="text-zinc-400 text-xs mt-1">
                Required by DPDP Act Section 13. This person receives and handles rights requests.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Name *</Label>
                <Input
                  value={grievanceOfficer.name}
                  onChange={e => setGrievanceOfficer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Priya Sharma"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Email address *</Label>
                <Input
                  value={grievanceOfficer.email}
                  onChange={e => setGrievanceOfficer(prev => ({ ...prev, email: e.target.value }))}
                  type="email"
                  placeholder="privacy@acme.in"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Phone (optional)</Label>
                <Input
                  value={grievanceOfficer.phone}
                  onChange={e => setGrievanceOfficer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(0)} variant="outline" className="border-zinc-700 text-zinc-300">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!grievanceOfficer.name || !grievanceOfficer.email}
                  className="flex-1 bg-[#C23B22] hover:bg-[#a8321d] text-white"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: SDF */}
        {step === 2 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Significant Data Fiduciary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Under DPDP Act Section 10, the Government may designate organisations as Significant Data Fiduciaries (SDFs) based on the volume and sensitivity of data processed. SDFs have additional obligations.
              </p>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <p className="text-zinc-300 text-sm font-medium">Additional SDF obligations:</p>
                <ul className="text-zinc-400 text-xs space-y-1">
                  <li>• Appoint a Data Protection Officer resident in India</li>
                  <li>• Conduct Data Protection Impact Assessments (DPIA)</li>
                  <li>• Maintain algorithmic accountability</li>
                  <li>• Periodic audits by independent auditor</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={isSDF}
                  onCheckedChange={v => setIsSDF(v as boolean)}
                  className="mt-0.5 border-zinc-600"
                />
                <div>
                  <p className="text-zinc-300 text-sm font-medium">Our organisation has been designated as a Significant Data Fiduciary</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Select if you have received official designation from the Government of India</p>
                </div>
              </label>
              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="border-zinc-700 text-zinc-300">
                  Back
                </Button>
                <Button
                  onClick={() => { setStep(3); handleComplete() }}
                  disabled={loading}
                  className="flex-1 bg-[#C23B22] hover:bg-[#a8321d] text-white"
                >
                  {loading ? 'Setting up...' : 'Complete setup'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-12 w-12 text-teal-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Setting up your workspace...</h2>
              <p className="text-zinc-400 text-sm mt-2">Redirecting to your dashboard</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
