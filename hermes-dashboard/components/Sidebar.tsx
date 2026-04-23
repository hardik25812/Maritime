'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, Search, DollarSign, Star, ShoppingCart,
  FileText, Mail, Clock, Shield, Settings, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Morning Brief', icon: LayoutDashboard },
  { href: '/agents', label: 'Agent Team', icon: Shield },
  { href: '/seo', label: 'SEO Report', icon: Search },
  { href: '/revenue', label: 'Revenue Recovery', icon: DollarSign },
  { href: '/reviews', label: 'Review Pipeline', icon: Star },
  { href: '/milestones', label: 'Milestone Agent', icon: Clock },
  { href: '/mailchimp', label: 'MailChimp Attribution', icon: Mail },
  { href: '/content', label: 'Content Queue', icon: FileText },
  { href: '/carts', label: 'Cart Abandonment', icon: ShoppingCart },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#111827] text-white flex flex-col">
      {/* Logo + Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/artneedlepoint-logo.png"
            alt="Art Needlepoint"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">HERMES</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Operations Command</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Art Needlepoint Company</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all duration-150 group',
                isActive
                  ? 'bg-[#2c5f2e] text-white font-medium shadow-lg shadow-green-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} className={cn(isActive ? 'text-emerald-300' : 'text-gray-500 group-hover:text-gray-300')} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-emerald-300" />}
            </Link>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 agent-active" />
          <span className="text-xs text-gray-400">5 agents online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#2c5f2e] flex items-center justify-center text-[10px] font-bold">D</div>
          <div>
            <p className="text-xs text-gray-300">Doreen</p>
            <p className="text-[10px] text-gray-500">Owner · Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
