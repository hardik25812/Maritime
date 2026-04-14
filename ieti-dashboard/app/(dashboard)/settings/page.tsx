'use client'

import { ExternalLink, Phone, Database, Webhook, Shield } from 'lucide-react'
import TopBar from '@/components/TopBar'

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Settings" subtitle="System configuration and integrations" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">

        {/* Agent Status */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4 flex items-center gap-2">
            <Shield size={16} className="text-[#3B5323]" /> Retell AI Agent
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Agent ID</p>
              <p className="text-sm font-mono text-slate-700 mt-0.5">agent_afd4a14f40260369e259646da9</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Voice</p>
              <p className="text-sm text-slate-700 mt-0.5">Rachel (Professional)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Webhook</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">n8n.srv1546601.hstgr.cloud/webhook/iet-retell-call-ended</p>
            </div>
          </div>
          <div className="mt-4">
            <a href="https://beta.retellai.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#3B5323] bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <ExternalLink size={12} /> Open Retell Dashboard
            </a>
          </div>
        </div>

        {/* Twilio */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4 flex items-center gap-2">
            <Phone size={16} className="text-blue-500" /> Twilio SMS
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Phone Number</p>
              <p className="text-sm text-slate-700 mt-0.5">+1 (305) 600-0625</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">SMS Status</p>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">Active</p>
            </div>
          </div>
        </div>

        {/* n8n Workflows */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4 flex items-center gap-2">
            <Webhook size={16} className="text-orange-500" /> n8n Workflows
          </h2>
          <div className="space-y-3">
            {[
              { name: 'WF1 — Retell Call Ended Handler', status: 'Active', id: 'HsnIoXjYMdPh3OaQ' },
              { name: 'WF2 — Missed Call Auto-SMS', status: 'Active', id: 'TWIq7D53cTZgOsGc' },
              { name: 'WF3 — Urgent Callback Escalation', status: 'Active', id: 'PD2HnkjdhWF3xTYZ' },
              { name: 'WF4 — Post-Inspection Review Request', status: 'Active', id: 'VqGw7r2xMaPsN4Jf' },
            ].map(wf => (
              <div key={wf.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1e2a1e]">{wf.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{wf.id}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                  {wf.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="https://n8n.srv1546601.hstgr.cloud" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
              <ExternalLink size={12} /> Open n8n Dashboard
            </a>
          </div>
        </div>

        {/* Supabase */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[#1e2a1e] mb-4 flex items-center gap-2">
            <Database size={16} className="text-emerald-500" /> Supabase Database
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Project</p>
              <p className="text-sm text-slate-700 mt-0.5">xoxpslsbnkxcthdmfbwn</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Table</p>
              <p className="text-sm font-mono text-slate-700 mt-0.5">call_logs</p>
            </div>
          </div>
          <div className="mt-4">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
              <ExternalLink size={12} /> Open Supabase Dashboard
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
