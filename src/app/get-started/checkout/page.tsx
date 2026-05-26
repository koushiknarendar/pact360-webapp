'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Loader2 } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { toast } from 'sonner'

type PlanKey = 'starter' | 'growth' | 'business'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cashfree: any
  }
}

function CheckoutInner() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const plan = (params.get('plan') ?? 'growth') as PlanKey

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const cashfreeRef = useRef<unknown>(null)

  const selectedPlan = PLANS[plan] as {
    name: string
    price_inr: number
    setup_fee_inr: number
    founding_price_inr: number
    features: readonly string[]
    max_requests: number
    max_dpos: number
  }
  const planPrice = selectedPlan.founding_price_inr ?? selectedPlan.price_inr
  const setupFee = selectedPlan.setup_fee_inr ?? 0
  const total = (planPrice ?? 0) + (setupFee ?? 0)

  useEffect(() => {
    if (!id || !plan) return
    fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demo_request_id: id, plan }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.payment_session_id) {
          setSessionId(data.payment_session_id)
          setOrderId(data.order_id)
        } else {
          toast.error(data.error ?? 'Failed to create order')
        }
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setLoading(false))
  }, [id, plan])

  useEffect(() => {
    if (!sdkReady || !sessionId) return
    const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'sandbox' ? 'sandbox' : 'production'
    cashfreeRef.current = new window.Cashfree({ mode })
  }, [sdkReady, sessionId])

  function handlePay() {
    if (!cashfreeRef.current || !sessionId || !orderId) return
    setLaunching(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(cashfreeRef.current as any).checkout({
      paymentSessionId: sessionId,
      redirectTarget: '_self',
    })
  }

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onReady={() => setSdkReady(true)}
      />

      <div className="min-h-screen bg-[#0D0F14] flex flex-col">
        <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="text-lg font-bold text-white tracking-tight">PACT360</div>
          <p className="text-zinc-500 text-sm">Secure checkout</p>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Complete your order</h1>
              <p className="text-zinc-400 text-sm mt-1">You&apos;re one step away from DPDP compliance.</p>
            </div>

            {/* Order summary */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-5 pb-5 space-y-3">
                <p className="text-white font-semibold">{selectedPlan.name} Plan — Founding Member</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Annual subscription</span>
                    <span className="text-white">₹{planPrice?.toLocaleString()}</span>
                  </div>
                  {setupFee ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">One-time setup fee</span>
                      <span className="text-white">₹{setupFee.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="border-t border-zinc-700 pt-2 flex justify-between font-semibold">
                    <span className="text-zinc-200">Total today</span>
                    <span className="text-white text-lg">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={loading || !sessionId || !sdkReady || launching}
              className="w-full bg-[#C23B22] hover:bg-[#a8321d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading || !sessionId ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Preparing checkout...</>
              ) : launching ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</>
              ) : (
                `Pay ₹${total.toLocaleString()} →`
              )}
            </button>

            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-3 w-3 text-zinc-500" />
              <p className="text-zinc-500 text-xs">Secured by Cashfree Payments · 256-bit SSL</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0F14]" />}>
      <CheckoutInner />
    </Suspense>
  )
}
