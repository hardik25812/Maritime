'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, Clock, Mic, User, Languages } from 'lucide-react'
import Badge from './Badge'
import AudioPlayer from './AudioPlayer'
import {
  formatDate, formatDuration, formatPhone,
  getLeadScoreColor, getUrgencyColor, getSentimentColor,
  getServiceLabel, cn
} from '@/lib/utils'
import type { CallLog } from '@/lib/supabase'

export default function CallRow({ call }: { call: CallLog }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-100 rounded-xl bg-white mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#4A90D9]/10 flex items-center justify-center shrink-0">
          <User size={16} className="text-[#4A90D9]" />
        </div>

        {/* Name + phone */}
        <div className="w-44 shrink-0">
          <p className="text-sm font-semibold text-[#1e2a3a] truncate">
            {call.caller_name || 'Unknown Caller'}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Phone size={10} />
            {formatPhone(call.caller_phone)}
          </p>
        </div>

        {/* Service */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700 truncate">
            {getServiceLabel(call.service_interest)}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{formatDate(call.received_at)}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            label={call.lead_score || 'medium'}
            className={getLeadScoreColor(call.lead_score)}
          />
          {call.urgency_flag !== 'routine' && (
            <Badge
              label={call.urgency_flag}
              className={getUrgencyColor(call.urgency_flag)}
            />
          )}
          {call.language_used === 'spanish' || call.language_used === 'both' ? (
            <Badge label="ES" className="text-violet-600 bg-violet-50 border-violet-200" />
          ) : null}
        </div>

        {/* Duration */}
        <div className="w-16 text-right shrink-0">
          <p className="text-xs font-medium text-slate-600 flex items-center justify-end gap-1">
            <Clock size={10} />
            {formatDuration(call.call_duration_seconds)}
          </p>
        </div>

        {/* Expand */}
        <div className="w-5 shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-4">
            {/* Left */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Call Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {call.call_summary || 'No summary available.'}
                </p>
              </div>
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
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">Requested Human</span>
                )}
                {call.bmi_mentioned && (
                  <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full">
                    BMI: {call.bmi_mentioned}
                  </span>
                )}
                {call.how_heard && (
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full">
                    Heard via: {call.how_heard}
                  </span>
                )}
              </div>
            </div>

            {/* Right */}
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
                  <p className="text-slate-400 text-[10px] uppercase tracking-wide">Language</p>
                  <p className="text-slate-700 font-medium mt-0.5 capitalize">{call.language_used}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
