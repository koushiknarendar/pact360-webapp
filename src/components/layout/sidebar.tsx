'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Shield,
  Database,
  BookOpen,
  Users,
  FolderOpen,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const fiduciaryNav: NavItem[] = [
  { href: '/fiduciary', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fiduciary/requests', label: 'Rights Requests', icon: FileText },
  { href: '/fiduciary/breaches', label: 'Data Breaches', icon: AlertTriangle },
  { href: '/fiduciary/consents', label: 'Consent Register', icon: Shield },
  { href: '/fiduciary/ropa', label: 'Processing Activities', icon: Database },
  { href: '/fiduciary/notices', label: 'Privacy Notices', icon: BookOpen },
  { href: '/fiduciary/training', label: 'Training', icon: Users },
  { href: '/fiduciary/dpos', label: 'DPO Network', icon: Users },
  { href: '/fiduciary/documents', label: 'Documents', icon: FolderOpen },
  { href: '/fiduciary/ai', label: 'AI Tools', icon: Sparkles },
  { href: '/fiduciary/billing', label: 'Billing', icon: CreditCard },
  { href: '/fiduciary/settings', label: 'Settings', icon: Settings },
]

const dpoNav: NavItem[] = [
  { href: '/dpo', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dpo/requests', label: 'Assigned Requests', icon: FileText },
  { href: '/dpo/breaches', label: 'Breach Cases', icon: AlertTriangle },
  { href: '/dpo/setup', label: 'My Profile', icon: Settings },
]

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/organisations', label: 'Organisations', icon: Database },
  { href: '/admin/dpos', label: 'DPO Management', icon: Users },
  { href: '/admin/requests', label: 'Rights Requests', icon: FileText },
  { href: '/admin/breaches', label: 'Breach Oversight', icon: AlertTriangle },
  { href: '/admin/matching', label: 'DPO Matching', icon: ChevronRight },
]

interface SidebarProps {
  role: 'fiduciary' | 'dpo' | 'admin'
  orgName?: string
}

export function Sidebar({ role, orgName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = role === 'fiduciary' ? fiduciaryNav : role === 'dpo' ? dpoNav : adminNav

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-800">
        <div className="text-lg font-bold text-white tracking-tight">PACT360</div>
        {orgName && (
          <div className="text-xs text-zinc-400 mt-1 truncate">{orgName}</div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {nav.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#C23B22]/20 text-[#C23B22] font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
