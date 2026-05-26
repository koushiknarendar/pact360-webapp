'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Mail } from 'lucide-react'
import { PLANS } from '@/lib/plans'

type PlanKey = 'starter' | 'growth' | 'business'

function SuccessInner() {
  const params = useSearchParams()
  const plan = (params.get('plan') ?? 'growth') as PlanKey
  const selectedPlan = PLANS[plan]

  return (
    <div className="min-h-screen bg-[#0D0F14] flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="text-lg font-bold text-white tracking-tight">PACT360</div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-[#2A9D8F]" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">Payment successful!</h1>
            <p className="text-zinc-400 mt-2">
              Welcome to PACT360 {selectedPlan.name}. You&apos;re now a founding member.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#2A9D8F] shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-medium">Check your email</p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  We&apos;ve sent you a setup link to create your password and access your compliance workspace. It may take a minute to arrive.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-zinc-500 text-sm">
              Your account is being provisioned. Once set up, you&apos;ll be able to:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                Generate your AI-powered privacy notice
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                Set up your public rights request portal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                Deploy employee DPDP training
              </li>
            </ul>
          </div>

          <p className="text-zinc-600 text-xs">
            Need help? Email us at{' '}
            <a href="mailto:hello@pact360.in" className="text-[#2A9D8F] hover:underline">
              hello@pact360.in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0F14]" />}>
      <SuccessInner />
    </Suspense>
  )
}
