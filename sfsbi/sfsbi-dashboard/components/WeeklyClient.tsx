'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Download, Send } from 'lucide-react'
import TopBar from '@/components/TopBar'
import { supabase } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { getServiceLabel } from '@/lib/utils'

export default function WeeklyClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const fetchCalls = useCallback(async () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .gte('received_at', cutoff)
      .order('received_at', { ascending: false })
    if (data) setCalls(data as CallLog[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const total = calls.length
  const high = calls.filter(c => c.lead_score === 'high').length
  const med = calls.filter(c => c.lead_score === 'medium').length
  const low = calls.filter(c => c.lead_score === 'low').length
  const urgent = calls.filter(c => c.urgency_flag !== 'routine').length
  const intake = calls.filter(c => c.intake_collected).length
  const human = calls.filter(c => c.wants_human).length
  const afterHours = calls.filter(c => c.after_hours).length
  const spanish = calls.filter(c => c.language_used === 'spanish' || c.language_used === 'both').length
  const insDisq = calls.filter(c => c.call_outcome === 'insurance_disqualified').length
  const spam = calls.filter(c => c.call_outcome === 'spam').length
  const avgDur = total > 0
    ? Math.round(calls.reduce((s, c) => s + (c.call_duration_seconds || 0), 0) / total)
    : 0

  const svcMap: Record<string, number> = {}
  calls.forEach(c => { const s = c.service_interest || 'unknown'; svcMap[s] = (svcMap[s] || 0) + 1 })
  const topServices = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const triggerN8nReport = async () => {
    setSending(true)
    try {
      await fetch('https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggered_by: 'dashboard', week_of: weekOf }),
      })
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (_) {}
    setSending(false)
  }

  const exportPdf = () => {
    window.print()
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Weekly QC Report" subtitle={`Week ending ${weekOf}`} />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

        {/* Report card */}
        <div className="max-w-2xl mx-auto space-y-5" id="weekly-report-print">

          {/* Header */}
          <div className="bg-[#1e2a3a] rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img src="/sfsbi-logo.webp" alt="SFSBI" className="h-10 object-contain brightness-0 invert" />
            </div>
            <h1 className="text-xl font-bold">Weekly AI Receptionist Report</h1>
            <p className="text-slate-300 text-sm mt-1">Week ending {weekOf}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-slate-300 mt-0.5">Total Calls</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[#4CAF50]">{high}</p>
                <p className="text-xs text-slate-300 mt-0.5">High-Intent Leads</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{total > 0 ? Math.round(intake / total * 100) : 0}%</p>
                <p className="text-xs text-slate-300 mt-0.5">Intake Rate</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <Section title="📞 Call Volume">
              <Row label="Total calls handled" value={total} />
              <Row label="Intake collected" value={`${intake} / ${total}`} highlight={intake > 0} />
              <Row label="Avg call duration" value={`${avgDur}s`} />
              <Row label="Spam filtered" value={spam} />
              <Row label="After-hours captured" value={afterHours} />
            </Section>

            <Section title="🎯 Lead Quality">
              <Row label="High-intent" value={high} highlight={high > 0} color="text-emerald-600" />
              <Row label="Medium" value={med} color="text-amber-600" />
              <Row label="Low / info only" value={low} />
              <Row label="Insurance disqualified" value={insDisq} />
            </Section>

            <Section title="⚡ Flags">
              <Row label="Urgent escalations" value={urgent} highlight={urgent > 0} color="text-red-500" />
              <Row label="Human handoff requested" value={human} />
              <Row label="Spanish / bilingual calls" value={spanish} />
            </Section>

            <Section title="🏥 Top Service Interests">
              {topServices.length === 0 ? (
                <p className="text-sm text-slate-400">No data</p>
              ) : topServices.map(([svc, count]) => (
                <Row key={svc} label={getServiceLabel(svc)} value={count} />
              ))}
            </Section>
          </div>

          {/* High-intent leads table */}
          {high > 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1e2a3a] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                High-Intent Leads — Action Required
              </h3>
              <div className="space-y-2">
                {calls.filter(c => c.lead_score === 'high').map(call => (
                  <div key={call.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1e2a3a]">{call.caller_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{call.caller_phone} · {getServiceLabel(call.service_interest)}</p>
                    </div>
                    <a
                      href={`tel:${call.caller_phone}`}
                      className="px-3 py-1.5 bg-[#4CAF50] text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Call Back
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={triggerN8nReport}
              disabled={sending || sent}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                sent
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#4A90D9] text-white hover:bg-[#3a7bc8]'
              } disabled:opacity-70`}
            >
              <Send size={15} />
              {sent ? 'Email Sent ✓' : sending ? 'Sending...' : 'Email Report to Sheena'}
            </button>
            <button
              onClick={exportPdf}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={15} />
              Print / Save PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1e2a3a] mb-2">{title}</h3>
      <div className="space-y-1.5 pl-2">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight, color }: {
  label: string; value: string | number; highlight?: boolean; color?: string
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? (color || 'text-[#4A90D9]') : color || 'text-[#1e2a3a]'}`}>
        {value}
      </span>
    </div>
  )
}
