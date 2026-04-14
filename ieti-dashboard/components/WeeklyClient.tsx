'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Printer } from 'lucide-react'
import TopBar from '@/components/TopBar'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatPhone, getConcernLabel } from '@/lib/utils'

export default function WeeklyClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCalls = useCallback(async () => {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    const { data } = await supabase
      .from(IETI_TABLE)
      .select('*')
      .gte('received_at', since.toISOString())
      .order('received_at', { ascending: false })
    if (data) setCalls(data as CallLog[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const total = calls.length
  const high = calls.filter(c => c.lead_score === 'high')
  const urgent = calls.filter(c => c.urgency_flag !== 'routine').length
  const intakeDone = calls.filter(c => c.intake_collected).length
  const avgDur = total > 0 ? Math.round(calls.reduce((s, c) => s + (c.call_duration_seconds || 0), 0) / total) : 0

  const svcMap: Record<string, number> = {}
  calls.forEach(c => { const s = c.concern_type || 'unknown'; svcMap[s] = (svcMap[s] || 0) + 1 })
  const topServices = Object.entries(svcMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Weekly Report" subtitle="Last 7 days performance summary" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#3B5323] text-white rounded-lg hover:bg-[#4a6830] transition-colors">
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>

        {/* Report card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-[#1e2a1e] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Indoor Environmental Testing Inc.</h2>
                <p className="text-[#8B7D3C] text-sm">Weekly QC Report — AI Receptionist</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Week ending</p>
                <p className="text-sm text-white font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-3xl font-bold text-white">{total}</p>
                <p className="text-xs text-slate-400">Total Calls</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{high.length}</p>
                <p className="text-xs text-slate-400">High-Intent Leads</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#8B7D3C]">{intakeDone > 0 && total > 0 ? Math.round(intakeDone / total * 100) : 0}%</p>
                <p className="text-xs text-slate-400">Intake Rate</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-[#1e2a1e]">{avgDur}s</p>
                <p className="text-xs text-slate-500">Avg Duration</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{urgent}</p>
                <p className="text-xs text-slate-500">Urgent Flags</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-[#1e2a1e]">{calls.filter(c => c.wants_human).length}</p>
                <p className="text-xs text-slate-500">Human Requests</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-[#1e2a1e]">{calls.filter(c => c.after_hours).length}</p>
                <p className="text-xs text-slate-500">After Hours</p>
              </div>
            </div>

            {/* Top concerns */}
            <div>
              <h3 className="text-sm font-semibold text-[#1e2a1e] mb-3">Top Inspection Requests</h3>
              <div className="space-y-2">
                {topServices.map(([svc, count]) => (
                  <div key={svc} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{getConcernLabel(svc)}</span>
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-intent leads table */}
            {high.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#1e2a1e] mb-3">High-Intent Leads (Call Back)</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Concern</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {high.map(call => (
                        <tr key={call.id}>
                          <td className="px-4 py-2 font-medium text-[#1e2a1e]">{call.caller_name || 'Unknown'}</td>
                          <td className="px-4 py-2 text-slate-600">{formatPhone(call.caller_phone)}</td>
                          <td className="px-4 py-2 text-slate-600">{getConcernLabel(call.concern_type)}</td>
                          <td className="px-4 py-2 text-right">
                            <a href={`tel:${call.caller_phone}`}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[#3B5323] text-white rounded-lg hover:bg-[#4a6830]">
                              <Phone size={10} /> Call
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
