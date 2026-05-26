'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle } from 'lucide-react'

const DATA_CATEGORIES = [
  'Contact information (name, email, phone)',
  'Identity documents (Aadhaar, PAN, Passport)',
  'Financial information (bank account, UPI, transactions)',
  'Health and medical records',
  'Location and GPS data',
  'Browsing and usage history',
  'Biometric data (fingerprint, face)',
  'Employment and income records',
  'Preferences and behavioural data',
  'Other personal data',
]

const schema = z.object({
  principal_name: z.string().min(2, 'Name is required'),
  principal_email: z.string().email('Valid email required'),
  principal_phone: z.string().optional(),
  request_type: z.enum(['access', 'correction', 'erasure', 'grievance', 'nomination', 'withdrawal_of_consent']),
  description: z.string().min(20, 'Please describe your request in at least 20 characters'),
  principal_id_type: z.string().optional(),
  principal_id_last4: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const REQUEST_TYPES = [
  { value: 'access', label: 'Access my data', desc: 'Find out what personal data you hold about me' },
  { value: 'correction', label: 'Correct my data', desc: 'Fix inaccurate or outdated information' },
  { value: 'erasure', label: 'Delete my data', desc: 'Remove my personal data from your records' },
  { value: 'withdrawal_of_consent', label: 'Withdraw consent', desc: 'Stop processing my data for a specific purpose' },
  { value: 'grievance', label: 'Raise a grievance', desc: 'Report a concern about how my data is handled' },
  { value: 'nomination', label: 'Nominate someone', desc: 'Authorise someone to exercise rights on my behalf' },
]

export function PublicRightsForm({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const requestType = watch('request_type')

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')

    const res = await fetch('/api/public-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, org_id: orgId, data_categories: selectedCategories }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setSubmitted(json.request_number)
    setLoading(false)
  }

  if (submitted) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle className="h-12 w-12 text-teal-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Request Submitted</h2>
          <p className="text-zinc-400 mt-2 text-sm">Your reference number is:</p>
          <p className="text-2xl font-mono font-bold text-[#2A9D8F] mt-2">{submitted}</p>
          <p className="text-zinc-500 text-sm mt-4 max-w-sm mx-auto">
            {orgName} will acknowledge your request and respond within 30 days as required by the DPDP Act.
            You will receive a confirmation at the email address you provided.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Request Type */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">What would you like to request?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {REQUEST_TYPES.map(type => (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                requestType === type.value
                  ? 'border-[#2A9D8F] bg-[#2A9D8F]/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <input
                type="radio"
                {...register('request_type')}
                value={type.value}
                className="mt-0.5 accent-[#2A9D8F]"
              />
              <div>
                <p className="text-white text-sm font-medium">{type.label}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{type.desc}</p>
              </div>
            </label>
          ))}
          {errors.request_type && (
            <p className="text-red-400 text-xs">{errors.request_type.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Your details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Full name *</Label>
            <Input
              {...register('principal_name')}
              placeholder="Arjun Mehta"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            {errors.principal_name && <p className="text-red-400 text-xs">{errors.principal_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email address *</Label>
              <Input
                {...register('principal_email')}
                type="email"
                placeholder="arjun@email.com"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {errors.principal_email && <p className="text-red-400 text-xs">{errors.principal_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone (optional)</Label>
              <Input
                {...register('principal_phone')}
                type="tel"
                placeholder="+91 9876543210"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">ID type (optional)</Label>
              <Input
                {...register('principal_id_type')}
                placeholder="Aadhaar / PAN / Passport"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Last 4 digits of ID</Label>
              <Input
                {...register('principal_id_last4')}
                placeholder="1234"
                maxLength={4}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Categories */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Which data is this about? (optional)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DATA_CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                className="border-zinc-600"
              />
              <span className="text-zinc-300 text-sm">{cat}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Describe your request *</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('description')}
            placeholder="Please describe your request in detail. For example: 'I would like to know what personal data you hold about me in connection with my purchase on 12 March 2024.'"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </CardContent>
      </Card>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white h-12 text-base"
      >
        {loading ? 'Submitting...' : 'Submit request'}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        Your request will be processed under the Digital Personal Data Protection Act, 2023.
        {orgName} is required to respond within 30 days.
      </p>
    </form>
  )
}
