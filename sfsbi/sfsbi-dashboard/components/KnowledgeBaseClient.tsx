'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Save, RotateCcw, Check, AlertTriangle, Loader2 } from 'lucide-react'
import TopBar from '@/components/TopBar'
import KnowledgeSourcesSection from '@/components/KnowledgeSourcesSection'

type KBData = {
  prompt: string
  begin_message: string
  tools: { name?: string; type?: string; description?: string }[]
  agent: {
    name?: string
    voice_id?: string
    voice_model?: string
    language?: string
    voice_speed?: number
    interruption_sensitivity?: number
    backchannel_frequency?: number
    backchannel_words?: string[]
  }
}

export default function KnowledgeBaseClient() {
  const [data, setData] = useState<KBData | null>(null)
  const [prompt, setPrompt] = useState('')
  const [beginMsg, setBeginMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/knowledge-base', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json as KBData)
      setPrompt(json.prompt)
      setBeginMsg(json.begin_message)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const dirty = data ? (prompt !== data.prompt || beginMsg !== data.begin_message) : false

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, begin_message: beginMsg }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      setData({ ...(data as KBData), prompt: json.prompt, begin_message: json.begin_message })
      setSavedAt(new Date().toLocaleTimeString())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const revert = () => {
    if (!data) return
    setPrompt(data.prompt)
    setBeginMsg(data.begin_message)
    setError(null)
    setSavedAt(null)
  }

  const promptWords = prompt.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Knowledge Base" subtitle="What Dorothy knows & how she responds — edit live" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f7fafc]">
        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-900 leading-relaxed">
            <strong>You&apos;re editing Dorothy&apos;s live brain.</strong> Changes save directly to the Retell LLM powering every incoming call. Test with a quick call after saving. The system blocks saves that contain dollar amounts — Dorothy never quotes pricing.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 className="animate-spin mr-2" size={18} />
            Loading Dorothy&apos;s knowledge base…
          </div>
        ) : data && (
          <>
            {/* Agent info cards */}
            <div className="grid grid-cols-4 gap-4">
              <InfoCard label="Agent" value={data.agent.name ?? 'Dorothy'} />
              <InfoCard label="Voice" value={data.agent.voice_id ?? '—'} />
              <InfoCard label="Model" value={data.agent.voice_model ?? '—'} />
              <InfoCard label="Speed" value={data.agent.voice_speed ? String(data.agent.voice_speed) : '—'} />
            </div>

            {/* Begin message */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <header className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                <BookOpen size={16} className="text-[#4A90D9]" />
                <h3 className="text-sm font-semibold text-slate-900">Opening Line</h3>
                <span className="text-xs text-slate-500 ml-2">First words Dorothy says when she picks up.</span>
              </header>
              <textarea
                value={beginMsg}
                onChange={(e) => setBeginMsg(e.target.value)}
                className="w-full px-5 py-4 text-sm text-slate-900 resize-y min-h-[70px] focus:outline-none"
                placeholder="e.g. Thanks for calling South Florida Surgery, Bariatric and Cosmetic Institute. This is Dorothy. How can I help you today?"
              />
            </section>

            {/* System prompt */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <header className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#4A90D9]" />
                  <h3 className="text-sm font-semibold text-slate-900">System Prompt — Dorothy&apos;s Brain</h3>
                </div>
                <div className="text-xs text-slate-500">
                  {promptWords.toLocaleString()} words · {prompt.length.toLocaleString()} chars
                </div>
              </header>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                spellCheck={false}
                className="w-full px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-900 resize-y min-h-[600px] focus:outline-none"
              />
            </section>

            {/* Extra knowledge sources (URLs, text snippets) */}
            <KnowledgeSourcesSection />

            {/* Tools */}
            {data.tools.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <header className="px-5 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Connected Tools</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Actions Dorothy can perform during a call.</p>
                </header>
                <div className="p-5 space-y-3">
                  {data.tools.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#4A90D9] text-white shrink-0">{t.type}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div className="h-6" />
      </div>

      {/* Sticky save bar */}
      {!loading && data && (
        <div className="border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            {savedAt && !dirty && (
              <><Check size={14} className="text-[#4CAF50]" /> Saved at {savedAt} — Dorothy is live with new instructions.</>
            )}
            {dirty && <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Unsaved changes</>}
            {!dirty && !savedAt && <>No changes.</>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={revert}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} /> Revert
            </button>
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#4A90D9] hover:bg-[#3d7dbf] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save & Deploy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-1 truncate" title={value}>{value}</div>
    </div>
  )
}
