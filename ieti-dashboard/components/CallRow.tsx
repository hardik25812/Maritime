'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, Clock, User, MapPin } from 'lucide-react'
import Badge from './Badge'
import AudioPlayer from './AudioPlayer'
import {
  formatDate, formatDuration, formatPhone,
  getLeadScoreColor, getUrgencyColor, getSentimentColor,
  getConcernLabel, cn
} from '@/lib/utils'
import type { CallLog } from '@/lib/supabase'

export default function CallRow({ call }: { call: CallLog }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-100 rounded-xl bg-white mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 md:px-4 py-3 flex items-center gap-2 md:gap-3"
      >
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#3B5323]/10 flex items-center justify-center shrink-0">
          <User size={15} className="text-[#3B5323]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1e2a1e] truncate">
            {call.caller_name || 'Unknown Caller'}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Phone size={10} />
            {formatPhone(call.caller_phone)}
          </p>
        </div>

        <div className="hidden sm:block flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700 truncate">
            {getConcernLabel(call.concern_type)}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{formatDate(call.received_at)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Badge
            label={call.lead_score || 'medium'}
            className={getLeadScoreColor(call.lead_score)}
          />
          {call.urgency_flag !== 'routine' && (
            <Badge
              label={call.urgency_flag}
              className={cn(getUrgencyColor(call.urgency_flag), 'hidden sm:inline-flex')}
            />
          )}
        </div>

        <div className="hidden md:block w-14 text-right shrink-0">
          <p className="text-xs font-medium text-slate-600 flex items-center justify-end gap-1">
            <Clock size={10} />
            {formatDuration(call.call_duration_seconds)}
          </p>
        </div>

        <div className="w-4 shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Call Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {call.call_summary || 'No summary available.'}
                </p>
              </div>
              {call.property_address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin size={12} className="text-[#3B5323] mt-0.5 shrink-0" />
                  <span>{call.property_address}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-slate-600">Outcome:</span>
                  {call.call_outcome?.replace(/_/g, ' ') || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-slate-600">Sentiment:</span>
                  <span className={getSentimentColor(call.user_sentiment)}>
                    {call.user_sentiment || '—'}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-slate-600">Intake:</span>
                  <span className={call.intake_collected ? 'text-emerald-600' : 'text-red-500'}>
                    {call.intake_collected ? 'Collected ✓' : 'Not collected'}
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {call.after_hours && (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">After Hours</span>
                )}
                {call.wants_human && (
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">Requested Martine</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Recording</p>
                <AudioPlayer url={call.recording_url} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg border border-slate-100 p-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Call ID</p>
                  <p className="text-slate-600 font-mono text-[11px] truncate mt-0.5">{call.call_id}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-100 p-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Type</p>
                  <p className="text-slate-700 font-medium mt-0.5 capitalize">{call.call_type?.replace(/_/g, ' ') || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
