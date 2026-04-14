'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import TopBar from '@/components/TopBar'
import CallRow from '@/components/CallRow'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const PER_PAGE = 20

export default function CallsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [leadFilter, setLeadFilter] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from(IETI_TABLE)
      .select('*')
      .order('received_at', { ascending: false })
      .limit(500)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const filtered = calls.filter(c => {
    if (leadFilter !== 'all' && c.lead_score !== leadFilter) return false
    if (urgencyFilter !== 'all' && c.urgency_flag !== urgencyFilter) return false
    if (typeFilter !== 'all' && c.call_type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (c.caller_name || '').toLowerCase().includes(q) ||
        (c.caller_phone || '').includes(q) ||
        (c.concern_type || '').toLowerCase().includes(q) ||
        (c.property_address || '').toLowerCase().includes(q) ||
        (c.call_summary || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Concern', 'Address', 'Lead Score', 'Urgency', 'Date', 'Summary']
    const rows = filtered.map(c => [
      c.caller_name, c.caller_phone, c.concern_type, c.property_address,
      c.lead_score, c.urgency_flag, c.received_at, c.call_summary?.replace(/,/g, ';')
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ieti-calls-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Call Logs" subtitle={`${filtered.length} of ${calls.length} calls`} onRefresh={() => fetchCalls(true)} refreshing={refreshing} />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search name, phone, concern, address..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5323]/30 focus:border-[#3B5323]"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'high', 'medium', 'low'].map(v => (
              <button key={v} onClick={() => { setLeadFilter(v); setPage(0) }}
                className={cn('px-3 py-1.5 text-xs rounded-full border font-medium capitalize transition-colors',
                  leadFilter === v ? 'bg-[#3B5323] text-white border-[#3B5323]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}>{v}</button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {['all', 'routine', 'urgent', 'emergency'].map(v => (
              <button key={v} onClick={() => { setUrgencyFilter(v); setPage(0) }}
                className={cn('px-3 py-1.5 text-xs rounded-full border font-medium capitalize transition-colors',
                  urgencyFilter === v ? 'bg-[#8B7D3C] text-white border-[#8B7D3C]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}>{v}</button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { v: 'all', label: 'All Types' },
              { v: 'new_inquiry', label: 'New Inquiry' },
              { v: 'missed_call', label: 'Missed' },
              { v: 'after_hours', label: 'After Hours' },
              { v: 'urgent_callback', label: 'Urgent CB' },
              { v: 'post_inspection_review', label: 'Review Req' },
            ].map(({ v, label }) => (
              <button key={v} onClick={() => { setTypeFilter(v); setPage(0) }}
                className={cn('px-3 py-1.5 text-xs rounded-full border font-medium transition-colors',
                  typeFilter === v ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}>{label}</button>
            ))}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={13} /> CSV
          </button>
        </div>

        {paged.map(call => <CallRow key={call.id} call={call} />)}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <p className="text-sm text-slate-400">No calls match your filters.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-600">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
