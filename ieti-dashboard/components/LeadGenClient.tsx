'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CloudRain, Droplets, MapPin, Phone, Mail, Send, Eye, MousePointer,
  CalendarCheck, Users, ChevronDown, ChevronUp,
  Filter
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import StatCard from '@/components/StatCard'
import Badge from '@/components/Badge'
import { supabase, FLOOD_EVENTS_TABLE, LEADS_TABLE } from '@/lib/supabase'
import type { FloodEvent, Lead } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const severityColor: Record<string, string> = {
  Extreme: 'bg-red-100 text-red-700',
  Severe: 'bg-orange-100 text-orange-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Minor: 'bg-blue-100 text-blue-600',
  Unknown: 'bg-slate-100 text-slate-600',
}

const gaugeColor: Record<string, string> = {
  major_flood: 'bg-red-100 text-red-700',
  moderate_flood: 'bg-orange-100 text-orange-700',
  minor_flood: 'bg-yellow-100 text-yellow-700',
  normal: 'bg-green-100 text-green-700',
}

const statusColor: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-600',
  delivered: 'bg-sky-100 text-sky-700',
  opened: 'bg-indigo-100 text-indigo-700',
  clicked: 'bg-purple-100 text-purple-700',
  replied: 'bg-violet-100 text-violet-700',
  booked: 'bg-emerald-100 text-emerald-700',
  opted_out: 'bg-red-100 text-red-600',
  none: 'bg-slate-100 text-slate-500',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function LeadGenClient() {
  const [events, setEvents] = useState<FloodEvent[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<'overview' | 'events' | 'leads'>('overview')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [leadFilter, setLeadFilter] = useState<'all' | 'flood_radar'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const [eventsRes, leadsRes] = await Promise.all([
      supabase.from(FLOOD_EVENTS_TABLE).select('*').order('processed_at', { ascending: false }).limit(100),
      supabase.from(LEADS_TABLE).select('*').order('created_at', { ascending: false }).limit(500),
    ])
    if (eventsRes.data) setEvents(eventsRes.data as FloodEvent[])
    if (leadsRes.data) setLeads(leadsRes.data as Lead[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime subscriptions
  useEffect(() => {
    const evtSub = supabase.channel('flood-events-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: FLOOD_EVENTS_TABLE }, () => fetchData())
      .subscribe()
    const leadSub = supabase.channel('leads-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: LEADS_TABLE }, () => fetchData())
      .subscribe()
    return () => { evtSub.unsubscribe(); leadSub.unsubscribe() }
  }, [fetchData])

  // Stats
  const totalLeads = leads.length
  const smsSent = leads.filter(l => l.sms_status === 'sent' || l.sms_status === 'delivered').length
  const emailSent = leads.filter(l => l.email_status === 'sent' || l.email_status === 'delivered').length
  const booked = leads.filter(l => l.response_status === 'booked').length
  const opened = leads.filter(l => ['opened', 'clicked', 'replied', 'booked'].includes(l.response_status)).length
  const floodLeads = leads.filter(l => l.source === 'flood_radar').length

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    if (leadFilter !== 'all' && l.source !== leadFilter) return false
    if (statusFilter !== 'all' && l.response_status !== statusFilter) return false
    return true
  })

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#3B5323] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Lead Generation"
        subtitle={`${events.length} events · ${totalLeads} leads generated`}
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin space-y-4 md:space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Flood Events" value={events.length} icon={CloudRain}
            iconColor="text-blue-600" iconBg="bg-blue-50"
            subtitle={events.length > 0 ? `Latest: ${timeAgo(events[0].processed_at)}` : 'Monitoring...'} />
          <StatCard title="Leads Generated" value={totalLeads} icon={Users}
            iconColor="text-[#3B5323]" iconBg="bg-green-50"
            subtitle={`${floodLeads} flood leads generated`} />
          <StatCard title="Outreach Sent" value={smsSent + emailSent} icon={Send}
            iconColor="text-indigo-600" iconBg="bg-indigo-50"
            subtitle={`${smsSent} SMS · ${emailSent} email`} />
          <StatCard title="Bookings" value={booked} icon={CalendarCheck}
            iconColor="text-emerald-600" iconBg="bg-emerald-50"
            subtitle={opened > 0 ? `${opened} engaged · ${booked} booked` : 'Awaiting responses'} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-0">
          {(['overview', 'events', 'leads'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                tab === t ? 'border-[#3B5323] text-[#1e2a1e]' : 'border-transparent text-slate-400 hover:text-slate-600'
              )}>
              {t === 'overview' ? '📊 Overview' : t === 'events' ? `🌊 Events (${events.length})` : `👥 Leads (${totalLeads})`}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Recent Flood Events */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-[#1e2a1e]">Recent Flood Events</h3>
                </div>
                <button onClick={() => setTab('events')} className="text-xs text-[#3B5323] font-medium hover:underline">View all →</button>
              </div>
              <div className="divide-y divide-slate-50">
                {events.length === 0 ? (
                  <div className="p-8 text-center">
                    <CloudRain size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No flood events detected yet</p>
                    <p className="text-xs text-slate-300 mt-1">Monitoring Madison WI + Nashville TN every 15 min</p>
                  </div>
                ) : events.slice(0, 5).map(evt => (
                  <div key={evt.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e2a1e] truncate">{evt.event_type}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{evt.headline}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge label={evt.severity || 'Unknown'} className={severityColor[evt.severity] || severityColor.Unknown} />
                        {evt.rainfall_inches && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {evt.rainfall_inches}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {evt.affected_counties?.[0] || 'Unknown'}</span>
                      {evt.fema_flood_zone && <span>Zone {evt.fema_flood_zone}</span>}
                      {evt.gauge_status && (
                        <Badge label={evt.gauge_status.replace('_', ' ')} className={cn('text-[10px] py-0', gaugeColor[evt.gauge_status] || gaugeColor.normal)} />
                      )}
                      <span>{timeAgo(evt.processed_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#3B5323]" />
                  <h3 className="text-sm font-semibold text-[#1e2a1e]">Recent Leads</h3>
                </div>
                <button onClick={() => setTab('leads')} className="text-xs text-[#3B5323] font-medium hover:underline">View all →</button>
              </div>
              <div className="divide-y divide-slate-50">
                {leads.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users size={32} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No leads generated yet</p>
                    <p className="text-xs text-slate-300 mt-1">Leads appear when a flood event triggers property lookups</p>
                  </div>
                ) : leads.slice(0, 8).map(lead => (
                  <div key={lead.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#3B5323]/10 flex items-center justify-center shrink-0">
                          <Droplets size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1e2a1e] truncate">{lead.owner_name || 'Unknown Owner'}</p>
                          <p className="text-[11px] text-slate-400 truncate">{lead.property_address}, {lead.property_zip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge label={lead.response_status} className={statusColor[lead.response_status] || statusColor.none} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1e2a1e] mb-4">Outreach Pipeline</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Generated', count: totalLeads, icon: Users, color: 'text-slate-600 bg-slate-50' },
                  { label: 'Sent', count: smsSent + emailSent, icon: Send, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Delivered', count: leads.filter(l => l.response_status === 'delivered').length, icon: Send, color: 'text-sky-600 bg-sky-50' },
                  { label: 'Opened', count: leads.filter(l => l.response_status === 'opened').length, icon: Eye, color: 'text-indigo-600 bg-indigo-50' },
                  { label: 'Clicked', count: leads.filter(l => l.response_status === 'clicked').length, icon: MousePointer, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Replied', count: leads.filter(l => l.response_status === 'replied').length, icon: Phone, color: 'text-violet-600 bg-violet-50' },
                  { label: 'Booked', count: booked, icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50' },
                ].map(step => (
                  <div key={step.label} className={cn('rounded-lg p-3 text-center', step.color)}>
                    <step.icon size={18} className="mx-auto mb-1" />
                    <p className="text-lg font-bold">{step.count}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Events */}
        {tab === 'events' && (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <CloudRain size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No flood events detected</p>
                <p className="text-sm text-slate-400 mt-1">The system monitors NOAA weather alerts for Madison WI and Nashville TN every 15 minutes.</p>
                <p className="text-xs text-slate-300 mt-3">When a Flood Warning, Flash Flood Warning, or Flood Watch is issued,<br />it will appear here with rainfall data, FEMA zone info, and river gauge levels.</p>
              </div>
            ) : events.map(evt => (
              <div key={evt.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedEvent(expandedEvent === evt.id ? null : evt.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <CloudRain size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1e2a1e] truncate">{evt.event_type}</p>
                    <p className="text-xs text-slate-400 truncate">{evt.headline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge label={evt.severity || 'Unknown'} className={severityColor[evt.severity] || severityColor.Unknown} />
                    {evt.rainfall_inches && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        <Droplets size={10} className="inline mr-1" />{evt.rainfall_inches}&quot;
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{timeAgo(evt.processed_at)}</span>
                    {expandedEvent === evt.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>
                {expandedEvent === evt.id && (
                  <div className="px-5 pb-5 border-t border-slate-50 pt-4 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                        <p className="text-sm text-slate-700">{evt.affected_counties?.join(', ') || 'Unknown'}</p>
                        {evt.fema_flood_zone && <p className="text-xs text-slate-500">FEMA Zone: <span className="font-medium">{evt.fema_flood_zone}</span></p>}
                        {evt.coordinates && <p className="text-xs text-slate-400">{evt.coordinates.lat?.toFixed(4)}, {evt.coordinates.lon?.toFixed(4)}</p>}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gauges & Data</p>
                        {evt.gauge_level_ft && <p className="text-sm text-slate-700">River Level: <span className="font-bold">{evt.gauge_level_ft} ft</span></p>}
                        {evt.gauge_status && <Badge label={evt.gauge_status.replace(/_/g, ' ')} className={cn(gaugeColor[evt.gauge_status] || gaugeColor.normal)} />}
                        <p className="text-xs text-slate-400">Station: {evt.gauge_station_id || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lead Impact</p>
                        <p className="text-sm text-slate-700">Leads Generated: <span className="font-bold text-[#3B5323]">{evt.leads_generated}</span></p>
                        <p className="text-sm text-slate-700">Outreach Sent: <span className="font-bold text-indigo-600">{evt.outreach_sent}</span></p>
                        <p className="text-xs text-slate-400">
                          {evt.start_time ? `Started: ${new Date(evt.start_time).toLocaleString()}` : ''}
                        </p>
                      </div>
                    </div>
                    {evt.description && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Alert Description</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                      </div>
                    )}
                    {evt.instruction && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">NWS Instructions</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{evt.instruction}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB: Leads */}
        {tab === 'leads' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter size={12} />
                <span className="font-medium">Source:</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'flood_radar'] as const).map(f => (
                  <button key={f} onClick={() => setLeadFilter(f)}
                    className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize',
                      leadFilter === f ? 'bg-[#3B5323] text-white border-[#3B5323]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    )}>
                    {f === 'all' ? 'All' : '🌊 Flood Radar'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:ml-3">
                <span className="font-medium">Status:</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'pending', 'delivered', 'opened', 'clicked', 'booked', 'opted_out'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={cn('px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize',
                      statusFilter === s ? 'bg-[#3B5323] text-white border-[#3B5323]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead count */}
            <p className="text-xs text-slate-400">{filteredLeads.length} leads</p>

            {/* Lead List */}
            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Users size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No leads yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Leads are generated automatically when flood events are detected and matched with property owners.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-3">Owner</div>
                  <div className="col-span-3">Property</div>
                  <div className="col-span-1">Source</div>
                  <div className="col-span-1">Zone</div>
                  <div className="col-span-2">Outreach</div>
                  <div className="col-span-2">Status</div>
                </div>
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="md:grid md:grid-cols-12 md:gap-2 md:items-center space-y-2 md:space-y-0">
                      {/* Owner */}
                      <div className="col-span-3 min-w-0">
                        <p className="text-sm font-medium text-[#1e2a1e] truncate">{lead.owner_name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lead.owner_phone && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <Phone size={9} /> {lead.owner_phone}
                            </span>
                          )}
                          {lead.owner_email && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <Mail size={9} /> {lead.owner_email.substring(0, 20)}...
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Property */}
                      <div className="col-span-3 min-w-0">
                        <p className="text-xs text-slate-600 truncate">{lead.property_address || 'N/A'}</p>
                        <p className="text-[11px] text-slate-400">{lead.property_city}, {lead.property_state} {lead.property_zip}</p>
                      </div>
                      {/* Source */}
                      <div className="col-span-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          🌊 Flood
                        </span>
                      </div>
                      {/* Zone */}
                      <div className="col-span-1">
                        <span className="text-xs text-slate-500">{lead.flood_zone || '—'}</span>
                      </div>
                      {/* Outreach */}
                      <div className="col-span-2 flex items-center gap-1.5">
                        {lead.sms_sent_at && (
                          <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-medium">SMS ✓</span>
                        )}
                        {lead.email_sent_at && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Email ✓</span>
                        )}
                        {!lead.sms_sent_at && !lead.email_sent_at && (
                          <span className="text-[10px] text-slate-400">Pending</span>
                        )}
                      </div>
                      {/* Status */}
                      <div className="col-span-2 flex items-center justify-between">
                        <Badge label={lead.response_status} className={statusColor[lead.response_status] || statusColor.none} />
                        <span className="text-[10px] text-slate-400">{timeAgo(lead.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
