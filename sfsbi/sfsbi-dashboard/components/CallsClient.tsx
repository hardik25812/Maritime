'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, X, Download } from 'lucide-react'
import CallRow from '@/components/CallRow'
import TopBar from '@/components/TopBar'
import { supabase, SFSBI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'

const LEAD_OPTS = ['all', 'high', 'medium', 'low']
const URGENCY_OPTS = ['all', 'routine', 'urgent', 'emergency']
const LANG_OPTS = ['all', 'english', 'spanish', 'both']

export default function CallsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [filtered, setFiltered] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [lead, setLead] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [lang, setLang] = useState('all')
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from(SFSBI_TABLE)
      .select('*')
      .order('received_at', { ascending: false })
      .limit(500)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  useEffect(() => {
    let f = [...calls]
    if (search) {
      const q = search.toLowerCase()
      f = f.filter(c =>
        (c.caller_name || '').toLowerCase().includes(q) ||
        (c.caller_phone || '').includes(q) ||
        (c.service_interest || '').includes(q) ||
        (c.call_summary || '').toLowerCase().includes(q)
      )
    }
    if (lead !== 'all') f = f.filter(c => c.lead_score === lead)
    if (urgency !== 'all') f = f.filter(c => c.urgency_flag === urgency)
    if (lang !== 'all') f = f.filter(c => c.language_used === lang)
    setFiltered(f)
    setPage(0)
  }, [calls, search, lead, urgency, lang])

  const exportCsv = () => {
    const headers = ['Date','Name','Phone','Service','Lead','Urgency','Intake','Duration','Outcome','Summary']
    const rows = filtered.map(c => [
      c.received_at, c.caller_name, c.caller_phone, c.service_interest,
      c.lead_score, c.urgency_flag, c.intake_collected, c.call_duration_seconds,
      c.call_outcome, `"${(c.call_summary || '').replace(/"/g, '""')}"`
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `sfsbi-calls-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const hasFilters = search || lead !== 'all' || urgency !== 'all' || lang !== 'all'

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Call Logs"
        subtitle={`${filtered.length} calls${hasFilters ? ' (filtered)' : ''}`}
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, service, summary..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/30 focus:border-[#4A90D9]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Lead filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-slate-400" />
            {LEAD_OPTS.map(opt => (
              <button
                key={opt}
                onClick={() => setLead(opt)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  lead === opt
                    ? 'bg-[#4A90D9] text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt === 'all' ? 'All Leads' : opt}
              </button>
            ))}
          </div>

          {/* Urgency filter */}
          <div className="flex items-center gap-1.5">
            {URGENCY_OPTS.filter(o => o !== 'all').map(opt => (
              <button
                key={opt}
                onClick={() => setUrgency(urgency === opt ? 'all' : opt)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  urgency === opt
                    ? opt === 'emergency' ? 'bg-red-500 text-white'
                    : opt === 'urgent' ? 'bg-orange-500 text-white'
                    : 'bg-slate-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-1.5">
            {LANG_OPTS.filter(o => o !== 'all').map(opt => (
              <button
                key={opt}
                onClick={() => setLang(lang === opt ? 'all' : opt)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  lang === opt
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt === 'english' ? 'EN' : opt === 'spanish' ? 'ES' : 'Bilingual'}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={exportCsv}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A90D9] border border-[#4A90D9]/30 rounded-lg hover:bg-[#4A90D9]/5 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {/* Call list */}
        <div>
          {paginated.map(call => <CallRow key={call.id} call={call} />)}
          {paginated.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
              <Search size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No calls match your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === i ? 'bg-[#4A90D9] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
