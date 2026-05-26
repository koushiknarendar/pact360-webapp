'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS } from '@/lib/plans'
import { CheckCircle, Shield, Star } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  contact_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  company_name: z.string().min(2, 'Company name required'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

type PlanKey = 'starter' | 'growth' | 'business'

const PLAN_HIGHLIGHTS: Record<PlanKey, { for: string; highlight: string }> = {
  starter:  { for: 'Small businesses, startups', highlight: 'Most popular for SMBs' },
  growth:   { for: 'Growing companies 50–200 employees', highlight: 'Best value' },
  business: { for: 'Mid-market 200–1000 employees', highlight: 'Full compliance suite' },
}

type PaidPlan = { name: string; price_inr: number; setup_fee_inr: number; founding_price_inr: number; features: readonly string[]; max_requests: number; max_dpos: number }

function getPlanPrice(key: PlanKey): number {
  const p = PLANS[key] as PaidPlan
  return p.founding_price_inr ?? p.price_inr
}

function getPlanSetup(key: PlanKey): number {
  return (PLANS[key] as PaidPlan).setup_fee_inr ?? 0
}

export default function GetStartedPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('growth')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)

    const res = await fetch('/api/payments/create-demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, plan: selectedPlan }),
    })

    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(`/get-started/checkout?id=${json.id}&plan=${selectedPlan}`)
  }

  const plans = Object.entries(PLANS).filter(([key]) => key !== 'enterprise') as [PlanKey, (typeof PLANS)[PlanKey]][]

  return (
    <div className="min-h-screen bg-[#0D0F14]">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-bold text-white tracking-tight">PACT360</div>
        <p className="text-zinc-500 text-sm">India&apos;s Privacy Compliance OS</p>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <Badge variant="outline" className="border-[#2A9D8F]/40 text-[#2A9D8F] mb-4">
            <Star className="h-3 w-3 mr-1" />
            Founding Member Pricing — First 100 Clients
          </Badge>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Full-circle DPDP compliance.<br />
            <span className="text-[#2A9D8F]">Start in 48 hours.</span>
          </h1>
          <p className="text-zinc-400 mt-4 text-lg max-w-xl mx-auto">
            Consent management, rights request tracking, breach response, training, and audit-ready evidence — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Plan selection */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-white font-semibold text-lg mb-2">Choose your plan</h2>
            {plans.map(([key, plan]) => {
              const planKey = key as PlanKey
              const highlights = PLAN_HIGHLIGHTS[planKey]
              const founderPrice = 'founding_price_inr' in plan ? plan.founding_price_inr : null
              const regularPrice = plan.price_inr
              const isSelected = selectedPlan === planKey

              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2A9D8F] bg-[#2A9D8F]/5'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                  }`}
                  onClick={() => setSelectedPlan(planKey)}
                >
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#2A9D8F] bg-[#2A9D8F]' : 'border-zinc-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold">{plan.name}</p>
                            {key === 'growth' && (
                              <Badge variant="outline" className="border-[#D4A843]/40 text-[#D4A843] text-xs">
                                Best value
                              </Badge>
                            )}
                          </div>
                          <p className="text-zinc-500 text-xs mt-0.5">{highlights.for}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {plan.features.slice(0, 4).map(f => (
                              <span key={f} className="text-xs text-zinc-400 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-teal-500 shrink-0" />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {founderPrice && (
                          <p className="text-zinc-500 text-xs line-through">₹{regularPrice?.toLocaleString()}/yr</p>
                        )}
                        <p className="text-white text-xl font-bold">
                          ₹{(founderPrice ?? regularPrice)?.toLocaleString()}
                        </p>
                        <p className="text-zinc-500 text-xs">per year</p>
                        {'setup_fee_inr' in plan && plan.setup_fee_inr && (
                          <p className="text-zinc-600 text-xs">+ ₹{plan.setup_fee_inr.toLocaleString()} setup</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Enterprise */}
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Enterprise</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Unlimited everything · Dedicated DPO · SLA guarantee</p>
                  </div>
                  <a
                    href="mailto:hello@pact360.in?subject=Enterprise Inquiry"
                    className="text-[#2A9D8F] text-sm hover:underline"
                  >
                    Talk to us →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-base">Your details</CardTitle>
                <p className="text-zinc-500 text-xs">We&apos;ll set up your account after payment</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs">Full name *</Label>
                    <Input
                      {...register('contact_name')}
                      placeholder="Priya Sharma"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                    />
                    {errors.contact_name && (
                      <p className="text-red-400 text-xs">{errors.contact_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs">Work email *</Label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="priya@company.in"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs">Company name *</Label>
                    <Input
                      {...register('company_name')}
                      placeholder="Acme Technologies Pvt Ltd"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                    />
                    {errors.company_name && (
                      <p className="text-red-400 text-xs">{errors.company_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-xs">Phone (optional)</Label>
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="+91 9876543210"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9 text-sm"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-zinc-800 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">{PLANS[selectedPlan].name} plan (founding)</span>
                      <span className="text-white">₹{getPlanPrice(selectedPlan).toLocaleString()}</span>
                    </div>
                    {getPlanSetup(selectedPlan) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">One-time setup fee</span>
                        <span className="text-white">₹{getPlanSetup(selectedPlan).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-700 pt-1 flex justify-between text-sm font-semibold">
                      <span className="text-zinc-300">Total today</span>
                      <span className="text-white">
                        ₹{(getPlanPrice(selectedPlan) + getPlanSetup(selectedPlan)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C23B22] hover:bg-[#a8321d] text-white h-11"
                  >
                    {loading ? 'Processing...' : 'Proceed to payment →'}
                  </Button>

                  <div className="flex items-center gap-2 justify-center">
                    <Shield className="h-3 w-3 text-zinc-500" />
                    <p className="text-zinc-500 text-xs">Secured by Cashfree Payments</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
