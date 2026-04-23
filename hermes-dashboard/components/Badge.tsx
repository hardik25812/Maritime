'use client'

import { cn, getStatusColor } from '@/lib/utils'

interface BadgeProps {
  status: string
  label?: string
  className?: string
}

export default function Badge({ status, label, className }: BadgeProps) {
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', getStatusColor(status), className)}>
      {displayLabel}
    </span>
  )
}
