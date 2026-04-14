'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PhoneCall, TrendingUp, AlertTriangle, Clock,
  Users, MapPin, CheckCircle, UserCheck
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import StatCard from '@/components/StatCard'
import CallRow from '@/components/CallRow'
import TopBar from '@/components/TopBar'
import { supabase, IETI_TABLE } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'
import { formatDateShort, getConcernLabel } from '@/lib/utils'

const GREEN = '#3B5323'
const GOLD = '#8B7D3C'
const EMERALD = '#059669'
const AMBER = '#F59E0B'
const RED = '#EF4444'
const GRAY = '#8C8C8C'

export default function DashboardClient() {
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
      .channel('ieti_call_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: IETI_TABLE },
        (payload) => setCalls(prev => [payload.new as CallLog, ...prev])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCalls])

  const total = calls.length
  const high = calls.filter(c => c.lead_score === 'high').length
  const urgent = calls.filter(c => c.urgency_flag !== 'routine').length
  const intakeDone = calls.filter(c => c.intake_collected).length
  const avgDur = total > 0
    ? Math.round(calls.reduce((s, c) => s + (c.call_duration_seconds || 0), 0) / total)
    : 0
  const withAddress = calls.filter(c => c.property_address && c.property_address !== 'not provided').length
  const humanRequests = calls.filter(c => c.wants_human).length
  const newInquiries = calls.filter(c => c.call_type === 'new_inquiry').length

  const leadPie = [
    { name: 'High', value: high, color: EMERALD },
    { name: 'Medium', value: calls.filter(c => c.lead_score === 'medium').length, color: AMBER },
    { name: 'Low', value: calls.filter(c => c.lead_score === 'low').length, color: GRAY },
  ]

  const svcMap: Record<string, number> = {}
  calls.forEach(c => { const s = c.concern_type || 'unknown'; svcMap[s] = (svcMap[s] || 0) + 1 })
  const svcData = Object.entries(svcMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([k, v]) => ({ name: getConcernLabel(k), value: v }))

  const dayMap: Record<string, number> = {}
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    dayMap[formatDateShort(d.toISOString())] = 0
  }
  calls.forEach(c => {
    const label = formatDateShort(c.received_at)
    if (label in dayMap) dayMap[label]++
  })
  const dayData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  const recent = calls.slice(0, 8)

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Dashboard"
        subtitle="Indoor Environmental Testing Inc. — Inspector Command Center"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Calls"
            value={total}
            subtitle="All time"
            icon={PhoneCall}
            iconColor="text-[#3B5323]"
            iconBg="bg-green-50"
          />
          <StatCard
            title="High-Intent Leads"
            value={high}
            subtitle={`${total > 0 ? Math.round(high / total * 100) : 0}% of all calls`}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Urgent Flags"
            value={urgent}
            subtitle="Need immediate follow-up"
            icon={AlertTriangle}
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
          />
          <StatCard
            title="Intake Rate"
            value={`${total > 0 ? Math.round(intakeDone / total * 100) : 0}%`}
            subtitle={`${intakeDone} of ${total} calls`}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-green-50"
          />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Avg Call Duration"
            value={`${avgDur}s`}
            icon={Clock}
            iconColor="text-[#8B7D3C]"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Properties Logged"
            value={withAddress}
            subtitle="With address captured"
            icon={MapPin}
            iconColor="text-[#3B5323]"
            iconBg="bg-green-50"
          />
          <StatCard
            title="New Inquiries"
            value={newInquiries}
            icon={Users}
            iconColor="text-[#3B5323]"
            iconBg="bg-green-50"
          />
          <StatCard
            title="Requested Martine"
            value={humanRequests}
            subtitle="Human handoff requests"
            icon={UserCheck}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Calls — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData} barSize={28}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill={GREEN} radius={[4, 4, 0, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Lead Quality</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {leadPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>}
                />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {svcData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4">Top Inspection Types</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={svcData} barSize={32} layout="horizontal">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1e2a1e]">Recent Calls</h2>
            <a href="/calls" className="text-xs text-[#3B5323] hover:underline font-medium">View all →</a>
          </div>
          {recent.map(call => <CallRow key={call.id} call={call} />)}
          {recent.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
              <PhoneCall size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No calls yet. Calls will appear here in real-time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
