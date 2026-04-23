import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'delighted': return 'text-emerald-600 bg-emerald-50'
    case 'satisfied': return 'text-blue-600 bg-blue-50'
    case 'neutral': return 'text-gray-600 bg-gray-50'
    case 'frustrated': return 'text-amber-600 bg-amber-50'
    case 'angry': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'scheduled': case 'sent': return 'bg-blue-100 text-blue-700'
    case 'recovered': case 'approved': case 'published': case 'reviewed': case 'positive': case 'finished': return 'bg-emerald-100 text-emerald-700'
    case 'expired': case 'rejected': return 'bg-red-100 text-red-700'
    case 'awaiting_doreen': case 'pending_doreen': return 'bg-amber-100 text-amber-700'
    case 'stuck': return 'bg-orange-100 text-orange-700'
    case 'no_response': case 'recheck': return 'bg-gray-100 text-gray-600'
    case 'detected': return 'bg-red-100 text-red-700'
    case 'removed': case 'flagged': return 'bg-emerald-100 text-emerald-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function getPositionChangeIcon(change: number): string {
  if (change > 0) return '↑'
  if (change < 0) return '↓'
  return '—'
}

export function getPositionChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-400'
}

export function getCategoryTimeline(category: string): string {
  switch (category) {
    case 'small': return '3 weeks'
    case 'medium': return '8 weeks'
    case 'large': return '16 weeks'
    default: return 'TBD'
  }
}
