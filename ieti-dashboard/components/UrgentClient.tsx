'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Phone, UserCheck, MapPin, PhoneMissed, Clock } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Badge from '@/components/Badge'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDate, formatPhone, getUrgencyColor, getConcernLabel } from '@/lib/utils'

export default function UrgentClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from(IETI_TABLE)
      .select('*')
      .order('received_at', { ascending: false })
      .limit(200)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchCalls()
    const channel = supabase
      .channel('ieti_urgent_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: IETI_TABLE },
        (payload) => setCalls(prev => [payload.new as CallLog, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCalls])

  const urgentCalls = calls.filter(c => c.urgency_flag === 'urgent' || c.urgency_flag === 'emergency')
  const humanCalls = calls.filter(c => c.wants_human && c.call_type !== 'urgent_callback')
  const missedCalls = calls.filter(c => c.call_type === 'missed_call' || c.call_type === 'after_hours')

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Urgent Flags" subtitle={`${urgentCalls.length + humanCalls.length + missedCalls.length} items need attention`} onRefresh={() => fetchCalls(true)} refreshing={refreshing} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin space-y-5 md:space-y-6">

        {(urgentCalls.length > 0 || missedCalls.length > 0) && (
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{urgentCalls.length}</p>
              <p className="text-xs text-red-700 mt-0.5">Urgent / Emergency</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{missedCalls.length}</p>
              <p className="text-xs text-amber-700 mt-0.5">Missed Calls</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{humanCalls.length}</p>
              <p className="text-xs text-blue-700 mt-0.5">Requested Martine</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Urgent / Emergency
          </h2>
          {urgentCalls.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-sm text-slate-400">No urgent calls. All clear.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentCalls.map(call => (
                <div key={call.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#1e2a1e]">{call.caller_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{formatDate(call.received_at)}</p>
                    </div>
                    <Badge label={call.urgency_flag} className={getUrgencyColor(call.urgency_flag)} size="md" />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{getConcernLabel(call.concern_type)}</p>
                  {call.property_address && call.property_address !== 'not provided' && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin size={11} className="text-[#3B5323]" /> {call.property_address}
                    </p>
                  )}
                  <p className="text-sm text-slate-700 mb-3">{call.call_summary}</p>
                  <a href={`tel:${call.caller_phone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <Phone size={12} /> Call {formatPhone(call.caller_phone)}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-3 flex items-center gap-2">
            <PhoneMissed size={16} className="text-amber-500" /> Missed Calls
          </h2>
          {missedCalls.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-sm text-slate-400">No missed calls.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {missedCalls.map(call => (
                <div key={call.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    {call.call_type === 'after_hours'
                      ? <Clock size={14} className="text-amber-600" />
                      : <PhoneMissed size={14} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1e2a1e] text-sm">{call.caller_phone || 'Unknown number'}</p>
                    <p className="text-xs text-slate-400">{formatDate(call.received_at)}{call.call_type === 'after_hours' ? ' · After hours' : ''}</p>
                  </div>
                  {call.caller_phone && (
                    <a href={`tel:${call.caller_phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shrink-0">
                      <Phone size={11} /> Call Back
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-3 flex items-center gap-2">
            <UserCheck size={16} className="text-blue-500" /> Requested Martine Directly
          </h2>
          {humanCalls.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-sm text-slate-400">No human handoff requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {humanCalls.map(call => (
                <div key={call.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-[#1e2a1e] text-sm">{call.caller_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{formatDate(call.received_at)} — {getConcernLabel(call.concern_type)}</p>
                  </div>
                  <a href={`tel:${call.caller_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Phone size={11} /> {formatPhone(call.caller_phone)}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
