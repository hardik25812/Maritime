'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Phone, User, Clock, ChevronRight } from 'lucide-react'
import TopBar from '@/components/TopBar'
import { supabase } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDate, formatPhone, formatDuration, getServiceLabel, getUrgencyColor } from '@/lib/utils'
import Badge from '@/components/Badge'

export default function UrgentClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .in('urgency_flag', ['urgent', 'emergency'])
      .order('received_at', { ascending: false })
      .limit(100)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchCalls()
    const channel = supabase
      .channel('urgent_calls')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_logs' },
        (payload) => {
          const c = payload.new as CallLog
          if (c.urgency_flag !== 'routine') setCalls(prev => [c, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCalls])

  // Also include wants_human calls
  const humanCalls = calls.filter(c => c.wants_human)
  const urgentCalls = calls.filter(c => c.urgency_flag !== 'routine')

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Urgent Flags"
        subtitle={`${urgentCalls.length} urgent calls requiring follow-up`}
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">

        {/* Banner */}
        {urgentCalls.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {urgentCalls.length} call{urgentCalls.length !== 1 ? 's' : ''} flagged as urgent
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                These callers need immediate follow-up from Sheena or Dr. Valladares.
              </p>
            </div>
          </div>
        )}

        {/* Urgent calls */}
        <section>
          <h2 className="text-sm font-semibold text-[#1e2a3a] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Urgent / Emergency Calls
          </h2>
          {urgentCalls.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
              <AlertTriangle size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No urgent calls. All clear.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {urgentCalls.map(call => (
                <UrgentCard key={call.id} call={call} />
              ))}
            </div>
          )}
        </section>

        {/* Human handoff */}
        <section>
          <h2 className="text-sm font-semibold text-[#1e2a3a] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Requested Human / Sheena
          </h2>
          {humanCalls.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
              <p className="text-sm text-slate-400">No human handoff requests.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {humanCalls.map(call => (
                <UrgentCard key={call.id} call={call} variant="human" />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function UrgentCard({ call, variant = 'urgent' }: { call: CallLog; variant?: 'urgent' | 'human' }) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = variant === 'human' ? 'border-blue-200' : call.urgency_flag === 'emergency' ? 'border-red-300' : 'border-orange-200'
  const bgColor = variant === 'human' ? 'bg-blue-50/30' : call.urgency_flag === 'emergency' ? 'bg-red-50/30' : 'bg-orange-50/30'

  return (
    <div className={`border ${borderColor} ${bgColor} rounded-xl bg-white overflow-hidden shadow-sm`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          variant === 'human' ? 'bg-blue-100' : call.urgency_flag === 'emergency' ? 'bg-red-100' : 'bg-orange-100'
        }`}>
          {variant === 'human'
            ? <User size={18} className="text-blue-600" />
            : <AlertTriangle size={18} className={call.urgency_flag === 'emergency' ? 'text-red-600' : 'text-orange-600'} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#1e2a3a]">{call.caller_name || 'Unknown Caller'}</p>
            <Badge
              label={variant === 'human' ? 'Wants Sheena' : call.urgency_flag}
              className={variant === 'human' ? 'text-blue-600 bg-blue-50 border-blue-200' : getUrgencyColor(call.urgency_flag)}
            />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Phone size={10} />{formatPhone(call.caller_phone)}
            </span>
            <span className="text-xs text-slate-400">{getServiceLabel(call.service_interest)}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={10} />{formatDate(call.received_at)}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-700 leading-relaxed">{call.call_summary || 'No summary.'}</p>
          <div className="mt-3 flex gap-3">
            <a
              href={`tel:${call.caller_phone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4CAF50] text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone size={13} />
              Call Back Now
            </a>
            <span className="text-xs text-slate-400 self-center">
              Duration: {formatDuration(call.call_duration_seconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
