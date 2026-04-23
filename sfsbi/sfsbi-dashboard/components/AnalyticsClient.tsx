'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts'
import TopBar from '@/components/TopBar'
import { supabase, SFSBI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDateShort, getServiceLabel } from '@/lib/utils'

const BLUE = '#4A90D9'
const GREEN = '#4CAF50'
const AMBER = '#F59E0B'
const RED = '#EF4444'
const VIOLET = '#8B5CF6'
const GRAY = '#94a3b8'

export default function AnalyticsClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [range, setRange] = useState<7 | 30 | 90>(30)

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

  const cutoff = new Date(Date.now() - range * 24 * 60 * 60 * 1000)
  const inRange = calls.filter(c => new Date(c.received_at) >= cutoff)

  // Daily volume
  const dayMap: Record<string, number> = {}
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dayMap[formatDateShort(d.toISOString())] = 0
  }
  inRange.forEach(c => {
    const label = formatDateShort(c.received_at)
    if (label in dayMap) dayMap[label]++
  })
  const volumeData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  // Lead score over time (weekly buckets)
  const weekBuckets: Record<string, { high: number; medium: number; low: number }> = {}
  inRange.forEach(c => {
    const d = new Date(c.received_at)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = formatDateShort(weekStart.toISOString())
    if (!weekBuckets[key]) weekBuckets[key] = { high: 0, medium: 0, low: 0 }
    const score = c.lead_score as 'high' | 'medium' | 'low'
    if (score in weekBuckets[key]) weekBuckets[key][score]++
  })
  const leadTrendData = Object.entries(weekBuckets).map(([week, v]) => ({ week, ...v }))

  // Outcome breakdown
  const outcomeCounts: Record<string, number> = {}
  inRange.forEach(c => {
    const o = c.call_outcome || 'unknown'
    outcomeCounts[o] = (outcomeCounts[o] || 0) + 1
  })
  const outcomeData = Object.entries(outcomeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))

  // Language breakdown
  const langData = [
    { name: 'English', value: inRange.filter(c => c.language_used === 'english').length, color: BLUE },
    { name: 'Spanish', value: inRange.filter(c => c.language_used === 'spanish').length, color: VIOLET },
    { name: 'Bilingual', value: inRange.filter(c => c.language_used === 'both').length, color: GREEN },
  ].filter(d => d.value > 0)

  // Top services
  const svcMap: Record<string, number> = {}
  inRange.forEach(c => { const s = c.service_interest || 'unknown'; svcMap[s] = (svcMap[s] || 0) + 1 })
  const svcData = Object.entries(svcMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, v]) => ({ name: getServiceLabel(k), value: v }))

  // Sentiment
  const sentimentData = [
    { name: 'Positive', value: inRange.filter(c => (c.user_sentiment || '').toLowerCase() === 'positive').length, color: GREEN },
    { name: 'Neutral', value: inRange.filter(c => (c.user_sentiment || '').toLowerCase() === 'neutral').length, color: AMBER },
    { name: 'Negative', value: inRange.filter(c => (c.user_sentiment || '').toLowerCase() === 'negative').length, color: RED },
  ].filter(d => d.value > 0)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Analytics"
        subtitle={`${inRange.length} calls in last ${range} days`}
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-5">

        {/* Range selector */}
        <div className="flex gap-2">
          {([7, 30, 90] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-[#4A90D9] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>

        {/* Volume trend */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#1e2a3a] mb-4">Daily Call Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="count" stroke={BLUE} strokeWidth={2.5} dot={false} name="Calls" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead trend + Language */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-4">Lead Quality by Week</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadTrendData} barSize={16}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="high" fill={GREEN} radius={[2,2,0,0]} name="High" />
                <Bar dataKey="medium" fill={AMBER} radius={[2,2,0,0]} name="Medium" />
                <Bar dataKey="low" fill={GRAY} radius={[2,2,0,0]} name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-4">Language Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={langData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                  {langData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services + Sentiment */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-4">Service Interest Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={svcData} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill={BLUE} radius={[0,4,4,0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-4">Caller Sentiment</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Outcome table */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Call Outcomes</h3>
              <div className="space-y-1">
                {outcomeData.slice(0, 5).map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 capitalize">{name}</span>
                    <span className="font-semibold text-[#1e2a3a]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
