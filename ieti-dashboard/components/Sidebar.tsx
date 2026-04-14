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
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'

const nav = [
  { href: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/calls',      label: 'Call Logs',    icon: PhoneCall },
  { href: '/leads',      label: 'Lead Tracker', icon: TrendingUp },
  { href: '/urgent',     label: 'Urgent Flags', icon: AlertTriangle },
  { href: '/analytics',  label: 'Analytics',    icon: Activity },
  { href: '/weekly',     label: 'Weekly Report', icon: Calendar },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <aside className="w-64 min-h-screen bg-[#1e2a1e] flex flex-col shadow-xl shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/ieti-logo.webp" alt="IETI" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Indoor Environmental</p>
              <p className="text-[10px] text-[#8B7D3C] font-medium">Testing Inc.</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center tracking-widest uppercase">
          Inspector Dashboard
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href)) || (href === '/' && path === '/dashboard')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#3B5323] text-white shadow-sm'
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
          onClick={() => setOpen(false)}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-400">Agent Live</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">agent_afd4a14f40260369e259646da9</p>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#1e2a1e] text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>
    </>
  )
}
