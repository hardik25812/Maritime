'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Phone, Calendar, TrendingUp } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Badge from '@/components/Badge'
import { supabase } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDate, formatPhone, getLeadScoreColor, getServiceLabel } from '@/lib/utils'

const TABS = ['high', 'medium', 'low'] as const

export default function LeadsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'high' | 'medium' | 'low'>('high')

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .eq('intake_collected', true)
      .order('received_at', { ascending: false })
      .limit(300)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const filtered = calls.filter(c => c.lead_score === tab)

  const counts = {
    high: calls.filter(c => c.lead_score === 'high').length,
    medium: calls.filter(c => c.lead_score === 'medium').length,
    low: calls.filter(c => c.lead_score === 'low').length,
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Lead Tracker"
        subtitle="Intake-collected leads sorted by quality"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-5">

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-1.5 flex gap-1 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? t === 'high' ? 'bg-emerald-500 text-white shadow-sm'
                  : t === 'medium' ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-400 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'high' && <Star size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Lead cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
            <TrendingUp size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No {tab}-intent leads with completed intake.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filtered.map(call => (
              <LeadCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LeadCard({ call }: { call: CallLog }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1e2a3a]">{call.caller_name || 'Unknown'}</p>
            <Badge label={call.lead_score} className={getLeadScoreColor(call.lead_score)} />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone size={10} />{formatPhone(call.caller_phone)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-medium text-[#4A90D9]">{getServiceLabel(call.service_interest)}</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
            <Calendar size={9} />{formatDate(call.received_at)}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
        {call.call_summary || 'No summary available.'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {call.language_used !== 'english' && (
            <span className="px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-full text-[10px] font-medium">
              {call.language_used === 'spanish' ? '🇪🇸 Spanish' : '🌐 Bilingual'}
            </span>
          )}
          {call.after_hours && (
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-medium">
              After Hours
            </span>
          )}
          {call.bmi_mentioned && (
            <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[10px] font-medium">
              BMI: {call.bmi_mentioned}
            </span>
          )}
        </div>
        <a
          href={`tel:${call.caller_phone}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4CAF50] text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
        >
          <Phone size={11} />
          Call Back
        </a>
      </div>
    </div>
  )
}
