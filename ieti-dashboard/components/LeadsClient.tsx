'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, MapPin, Star } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Badge from '@/components/Badge'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDate, formatPhone, getLeadScoreColor, getConcernLabel, cn } from '@/lib/utils'

export default function LeadsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'high' | 'medium' | 'low'>('high')

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from(IETI_TABLE)
      .select('*')
      .eq('intake_collected', true)
      .order('received_at', { ascending: false })
      .limit(200)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const high = calls.filter(c => c.lead_score === 'high')
  const medium = calls.filter(c => c.lead_score === 'medium')
  const low = calls.filter(c => c.lead_score === 'low')
  const current = tab === 'high' ? high : tab === 'medium' ? medium : low

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Lead Tracker" subtitle="Calls with intake collected" onRefresh={() => fetchCalls(true)} refreshing={refreshing} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin space-y-4">
        <div className="flex gap-2">
          {([['high', high.length], ['medium', medium.length], ['low', low.length]] as const).map(([t, count]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-4 py-2 text-sm font-medium rounded-lg border capitalize transition-colors',
                tab === t ? 'bg-[#3B5323] text-white border-[#3B5323]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}>
              {t} <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20">{count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {current.map(call => (
            <div key={call.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1e2a1e]">{call.caller_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {formatPhone(call.caller_phone)}
                  </p>
                </div>
                <Badge label={call.lead_score} className={getLeadScoreColor(call.lead_score)} />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-medium">{getConcernLabel(call.concern_type)}</span>
                <span className="text-slate-400 ml-2">{formatDate(call.received_at)}</span>
              </div>
              {call.property_address && call.property_address !== 'not provided' && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} className="text-[#3B5323] mt-0.5 shrink-0" />
                  <span>{call.property_address}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 line-clamp-2">{call.call_summary}</p>
              <a href={`tel:${call.caller_phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#3B5323] text-white rounded-lg hover:bg-[#4a6830] transition-colors">
                <Phone size={12} /> Call Back
              </a>
            </div>
          ))}
        </div>

        {current.length === 0 && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <Star size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No {tab}-intent leads yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
