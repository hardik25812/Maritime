import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
}

export default function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor = 'text-[#3B5323]',
  iconBg = 'bg-green-50',
  trend, className,
}: Props) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-100 shadow-sm p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 text-2xl md:text-3xl font-bold text-[#1e2a1e]">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-1.5 text-xs font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>
          <Icon size={22} className={iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
