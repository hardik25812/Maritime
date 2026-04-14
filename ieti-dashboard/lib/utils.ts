import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function formatPhone(phone: string): string {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getLeadScoreColor(score: string): string {
  switch (score) {
    case 'high': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'low': return 'text-slate-500 bg-slate-50 border-slate-200'
    default: return 'text-slate-500 bg-slate-50 border-slate-200'
  }
}

export function getUrgencyColor(flag: string): string {
  switch (flag) {
    case 'emergency': return 'text-red-700 bg-red-50 border-red-200'
    case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200'
    default: return 'text-slate-500 bg-slate-50 border-slate-200'
  }
}

export function getSentimentColor(sentiment: string): string {
  const s = (sentiment || '').toLowerCase()
  if (s === 'positive') return 'text-emerald-600'
  if (s === 'negative' || s === 'worried') return 'text-red-500'
  return 'text-slate-500'
}

export function getConcernLabel(key: string): string {
  const map: Record<string, string> = {
    mold_inspection: 'Mold Inspection',
    mold_testing: 'Mold Testing',
    air_quality: 'Air Quality Testing',
    iaq_testing: 'IAQ Testing',
    emf_testing: 'EMF Testing',
    asbestos_testing: 'Asbestos Testing',
    lead_testing: 'Lead Testing',
    water_testing: 'Water Testing',
    radon_testing: 'Radon Testing',
    chemical_testing: 'Chemical Testing',
    commercial_inspection: 'Commercial Inspection',
    residential_inspection: 'Residential Inspection',
    real_estate_inspection: 'Real Estate Inspection',
    post_remediation: 'Post-Remediation Verification',
    general_inquiry: 'General Inquiry',
    unknown: 'Unknown',
    not_specified: 'Not Specified',
  }
  return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
