'use client'

import { Bell, RefreshCw } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export default function TopBar({ title, subtitle, onRefresh, refreshing }: Props) {
  return (
    <div className="flex items-center justify-between pl-14 pr-4 md:px-6 py-4 bg-white border-b border-slate-100 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-[#1e2a1e]">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#3B5323] flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
          <div className="text-xs">
            <p className="font-medium text-[#1e2a1e]">Martine Davis</p>
            <p className="text-slate-400">Lead Inspector</p>
          </div>
        </div>
      </div>
    </div>
  )
}
