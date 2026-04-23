'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PhoneCall,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Settings,
  Activity,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'

const nav = [
  { href: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/calls',      label: 'Call Logs',    icon: PhoneCall },
  { href: '/leads',      label: 'Lead Tracker', icon: TrendingUp },
  { href: '/urgent',     label: 'Urgent Flags', icon: AlertTriangle },
  { href: '/analytics',  label: 'Analytics',    icon: Activity },
  { href: '/knowledge',  label: 'Knowledge Base', icon: BookOpen },
  { href: '/weekly',     label: 'Weekly Report',icon: Calendar },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-[#1e2a3a] flex flex-col shadow-xl shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Image
          src="/sfsbi-logo.webp"
          alt="South Florida Surgery & Bariatric Institute"
          width={180}
          height={48}
          className="w-full object-contain brightness-0 invert"
          priority
        />
        <p className="text-[10px] text-slate-400 mt-2 text-center tracking-widest uppercase">
          AI Receptionist Dashboard
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#4A90D9] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        <div className="mt-3 px-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
            <span className="text-[11px] text-slate-400">Agent Live</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">agent_dfd95700637dad9769ebf4fa24</p>
        </div>
      </div>
    </aside>
  )
}
