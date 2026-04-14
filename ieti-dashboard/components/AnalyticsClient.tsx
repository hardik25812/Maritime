'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import TopBar from '@/components/TopBar'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDateShort, getConcernLabel, cn } from '@/lib/utils'

const GREEN = '#3B5323'
const GOLD = '#8B7D3C'
const EMERALD = '#059669'
const AMBER = '#F59E0B'
const RED = '#EF4444'
const GRAY = '#8C8C8C'
const BLUE = '#3B82F6'

export default function AnalyticsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [range, setRange] = useState(30)

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

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  const filtered = calls.filter(c => new Date(c.received_at) >= cutoff)

  // Daily volume line chart
  const dayMap: Record<string, number> = {}
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[formatDateShort(d.toISOString())] = 0
  }
  filtered.forEach(c => {
    const label = formatDateShort(c.received_at)
    if (label in dayMap) dayMap[label]++
  })
  const dailyData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  // Lead quality pie
  const leadPie = [
    { name: 'High', value: filtered.filter(c => c.lead_score === 'high').length, color: EMERALD },
    { name: 'Medium', value: filtered.filter(c => c.lead_score === 'medium').length, color: AMBER },
    { name: 'Low', value: filtered.filter(c => c.lead_score === 'low').length, color: GRAY },
  ]

  // Concern type bar
  const svcMap: Record<string, number> = {}
  filtered.forEach(c => { const s = c.concern_type || 'unknown'; svcMap[s] = (svcMap[s] || 0) + 1 })
  const svcData = Object.entries(svcMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, v]) => ({ name: getConcernLabel(k), value: v }))

  // Sentiment pie
  const sentMap: Record<string, number> = {}
  filtered.forEach(c => { const s = (c.user_sentiment || 'unknown').toLowerCase(); sentMap[s] = (sentMap[s] || 0) + 1 })
  const sentData = Object.entries(sentMap).map(([k, v]) => ({ name: k, value: v }))
  const sentColors = ['#059669', '#3B82F6', '#F59E0B', '#EF4444', '#8C8C8C']

  // Outcome counts
  const outcomeMap: Record<string, number> = {}
  filtered.forEach(c => { const o = (c.call_outcome || 'unknown').replace(/_/g, ' '); outcomeMap[o] = (outcomeMap[o] || 0) + 1 })
  const outcomeData = Object.entries(outcomeMap).sort((a, b) => b[1] - a[1])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Analytics" subtitle={`${filtered.length} calls in last ${range} days`} onRefresh={() => fetchCalls(true)} refreshing={refreshing} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin space-y-4 md:space-y-6">

        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={cn('px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                range === d ? 'bg-[#3B5323] text-white border-[#3B5323]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}>{d} days</button>
          ))}
        </div>

        {/* Daily volume */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Daily Call Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} name="Calls" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lead pie */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Lead Quality</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {leadPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment pie */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Caller Sentiment</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {sentData.map((_, i) => <Cell key={i} fill={sentColors[i % sentColors.length]} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service bar */}
        {svcData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Top Inspection Types</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={svcData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Outcomes table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Call Outcomes</h2>
          <div className="space-y-2">
            {outcomeData.map(([outcome, count]) => (
              <div key={outcome} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 capitalize">{outcome}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B5323] rounded-full" style={{ width: `${(count / filtered.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
