'use client'

import TopBar from '@/components/TopBar'
import { Settings, Link, Key, Shield, Webhook, ExternalLink } from 'lucide-react'

export default function SettingsClient() {
  const workflows = [
    { id: 'nfmXFaTvWLUacMwc', name: 'WF1A: Backlog Review Converter', agent: 'ECHO', status: 'validated' },
    { id: 'HuszM9AZ49V0RIXd', name: 'WF1B: Send Approved Emails', agent: 'ECHO', status: 'validated' },
    { id: 'TVPkvfpVSy1DQbRS', name: 'WF2: Live Sentiment Router', agent: 'IRIS', status: 'validated' },
    { id: 'ifY4WDfJjWZiHr6t', name: 'WF3: Cart Abandonment Recovery', agent: 'ATLAS', status: 'validated' },
  ]

  const credentials = [
    { type: 'OpenAI API', key: 'openAiApi', workflows: 'WF1A, WF2', status: 'configure' },
    { type: 'Google Sheets OAuth2', key: 'googleSheetsOAuth2Api', workflows: 'WF1A, WF1B, WF2, WF3', status: 'configure' },
    { type: 'SMTP', key: 'smtp', workflows: 'WF1A, WF1B, WF2, WF3', status: 'configure' },
    { type: 'WooCommerce API', key: 'wooCommerceApi', workflows: 'WF3', status: 'configure' },
  ]

  const placeholders = [
    { key: 'REPLACE_WITH_GOOGLE_SHEET_ID', desc: 'Art Needlepoint Google Sheet ID', workflows: 'WF1A, WF1B, WF2, WF3' },
    { key: 'REPLACE_WITH_DOREEN_EMAIL', desc: "Doreen's email address", workflows: 'WF1A, WF2' },
    { key: 'REPLACE_WITH_FROM_EMAIL', desc: 'Sending email address', workflows: 'WF1B, WF3' },
    { key: 'REPLACE_WITH_WOOCOMMERCE_DOMAIN', desc: 'WooCommerce domain (artneedlepoint.com)', workflows: 'WF3' },
  ]

  const sheetTabs = [
    { name: 'Backlog', columns: 'customer_name, customer_email, product_name, testimonial_text, approval_status', usedBy: 'WF1A (read), WF2 (write)' },
    { name: 'Approval Queue', columns: 'customer_name, customer_email, product_name, testimonial_text, email_subject, email_body, approval_status, generated_at', usedBy: 'WF1A (write), WF1B (read)' },
    { name: 'Sentiment Log', columns: 'received_at, customer_name, customer_email, product_name, score, sentiment, issue_type, outcome, reasoning', usedBy: 'WF2 (write)' },
    { name: 'Cart Abandonment', columns: 'abandoned_at, customer_name, customer_email, items, cart_total, item_count, outcome, completed_at', usedBy: 'WF3 (write)' },
  ]

  return (
    <div>
      <TopBar title="Settings" subtitle="System configuration, n8n workflow IDs, and setup checklist" />

      <div className="p-6 space-y-6">
        {/* n8n Workflows */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Webhook size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">n8n Workflow IDs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {workflows.map(wf => (
              <div key={wf.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{wf.name}</p>
                  <p className="text-xs text-gray-400">Agent: {wf.agent}</p>
                </div>
                <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono text-gray-600">{wf.id}</code>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{wf.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Key size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Required Credentials</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {credentials.map(cred => (
              <div key={cred.key} className="flex items-center gap-4 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{cred.type}</p>
                  <p className="text-xs text-gray-400">Used in: {cred.workflows}</p>
                </div>
                <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono text-gray-600">{cred.key}</code>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⚠️ {cred.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Link size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Placeholders to Replace</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {placeholders.map(p => (
              <div key={p.key} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1">
                  <code className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono">{p.key}</code>
                  <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                </div>
                <span className="text-xs text-gray-400">{p.workflows}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Google Sheet Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ExternalLink size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Required Google Sheet Tabs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tab Name</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Columns</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Used By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sheetTabs.map(tab => (
                  <tr key={tab.name} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">{tab.name}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 font-mono max-w-[400px]">{tab.columns}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{tab.usedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Rules */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-red-500" />
            <h2 className="text-sm font-semibold text-gray-700">Security Rules</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">🚨</span>
              <p>Flag any new pages with author <code className="text-red-600 bg-red-50 px-1 rounded">andevtemp</code> immediately — treat as security alert</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <p>279 casino spam posts injected during hack — {261} removed, {18} remaining</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <p>SCOUT agent scans daily for new injections and index coverage changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
