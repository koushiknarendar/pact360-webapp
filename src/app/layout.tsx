import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PACT360 — India\'s Privacy Compliance OS',
  description: 'Full-circle DPDP compliance for Indian organisations. Consent management, rights requests, breach tracking, and audit-ready evidence.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-full bg-[#0D0F14] text-white antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
