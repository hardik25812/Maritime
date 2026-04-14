'use client'

import TopBar from '@/components/TopBar'
import { ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const AGENT_ID = 'agent_dfd95700637dad9769ebf4fa24'
const LLM_ID   = 'llm_41fd8635ff94a1bb1f241f788ae0'
const WF1_ID   = 'y2W0q5h4WIG0tBTh'
const WF2_ID   = '4ZdkoKrWd5tG0cIF'
const WF3_ID   = 'nnAZYMRIJzbEs5aV'
const WEBHOOK  = 'https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended'

function CopyField({ label, value, href }: { label: string; value: string; href?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-mono text-slate-700 mt-0.5 break-all">{value}</p>
      </div>
      <div className="flex gap-2 shrink-0 ml-4">
        {href && (
          <a href={href} target="_blank" rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4A90D9] hover:bg-blue-50 transition-colors">
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={copy}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#4A90D9] hover:bg-blue-50 transition-colors">
          {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Settings" subtitle="IDs, webhooks, and configuration reference" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-2xl space-y-5">

          {/* Retell */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-3">Retell AI</h2>
            <CopyField label="Agent ID" value={AGENT_ID} href="https://app.retellai.com" />
            <CopyField label="LLM ID" value={LLM_ID} />
            <CopyField label="Webhook URL" value={WEBHOOK} />
          </div>

          {/* n8n */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-3">n8n Workflows</h2>
            <CopyField label="WF1 — Post-Call Handler" value={WF1_ID} href="https://n8n.srv1546601.hstgr.cloud" />
            <CopyField label="WF2 — Urgent Escalation" value={WF2_ID} href="https://n8n.srv1546601.hstgr.cloud" />
            <CopyField label="WF3 — Weekly QC Report" value={WF3_ID} href="https://n8n.srv1546601.hstgr.cloud" />
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-[#1e2a3a] mb-3">Setup Checklist</h2>
            <div className="space-y-2">
              {[
                { label: 'Supabase project created + schema applied', done: false },
                { label: 'NEXT_PUBLIC_SUPABASE_URL set in .env.local', done: false },
                { label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY set in .env.local', done: false },
                { label: 'Google Sheet ID replaced in WF1 + WF3', done: false },
                { label: 'Twilio credentials filled in WF1 + WF2', done: false },
                { label: 'Sheena phone number filled in WF1 + WF2', done: false },
                { label: 'Phone number purchased + assigned to Retell agent', done: false },
                { label: 'Knowledge base uploaded in Retell dashboard', done: false },
                { label: 'All 3 n8n workflows activated', done: false },
                { label: '5 test calls completed per skill.md checklist', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className={`w-4 h-4 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {done && <CheckCircle size={10} className="text-white" />}
                  </div>
                  <span className={`text-sm ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
