'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link2, FileText, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'

type KBSource = {
  source_id: string
  type: 'url' | 'text' | 'document'
  url?: string
  title?: string
  filename?: string
  file_url?: string
  file_size?: number
}

type KBState = {
  kb_id: string
  kb_name: string
  status: string
  attached_to_dorothy: boolean
  sources: KBSource[]
  errors: string[]
}

export default function KnowledgeSourcesSection() {
  const [state, setState] = useState<KBState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/knowledge-sources', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setState(json as KBState)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const addSource = async () => {
    setAdding(true)
    setError(null)
    try {
      const body = mode === 'url' ? { type: 'url', url } : { type: 'text', title, text }
      const res = await fetch('/api/knowledge-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add')
      setUrl(''); setTitle(''); setText('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setAdding(false)
    }
  }

  const removeSource = async (sourceId: string) => {
    if (!confirm('Remove this source from Dorothy\'s knowledge base?')) return
    setDeletingId(sourceId)
    setError(null)
    try {
      const res = await fetch(`/api/knowledge-sources?source_id=${encodeURIComponent(sourceId)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setDeletingId(null)
    }
  }

  const canAdd =
    mode === 'url'
      ? /^https?:\/\/.+/i.test(url)
      : title.trim().length > 0 && text.trim().length >= 10

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <header className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-[#4A90D9]" />
          <h3 className="text-sm font-semibold text-slate-900">Extra Knowledge — Links, Docs &amp; Snippets</h3>
        </div>
        {state && (
          <div className="flex items-center gap-2 text-xs">
            {state.attached_to_dorothy ? (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Live with Dorothy
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <AlertCircle size={11} /> Not attached
              </span>
            )}
            <span className="text-slate-500">status: {state.status}</span>
          </div>
        )}
      </header>

      <div className="p-5 space-y-5">
        <p className="text-xs text-slate-600 leading-relaxed">
          Add your website, pricing sheets, procedure FAQs, or policies. Dorothy will use these during calls to answer questions more accurately.
          URLs get crawled automatically. Text snippets are indexed instantly.
        </p>

        {/* Add form */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'url' ? 'bg-[#4A90D9] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Link2 size={12} /> Website / Link
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'text' ? 'bg-[#4A90D9] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText size={12} /> Text Snippet
            </button>
          </div>

          {mode === 'url' ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sfsbi.com/procedures/gastric-sleeve"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/30 focus:border-[#4A90D9]"
            />
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g. Post-op recovery FAQ)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/30 focus:border-[#4A90D9]"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the content Dorothy should know. Minimum 10 characters."
                rows={6}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/30 focus:border-[#4A90D9]"
              />
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={addSource}
              disabled={!canAdd || adding}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#4A90D9] hover:bg-[#3d7dbf] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {adding ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : <><Plus size={14} /> Add to Knowledge Base</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Sources list */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
            <Loader2 className="animate-spin mr-2" size={14} /> Loading sources…
          </div>
        ) : state && state.sources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No sources yet. Add your website or key policy docs above.
          </div>
        ) : state && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              {state.sources.length} source{state.sources.length === 1 ? '' : 's'}
            </div>
            {state.sources.map((s) => (
              <div key={s.source_id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
                <div className="shrink-0 mt-0.5">
                  {s.type === 'url' ? <Link2 size={15} className="text-[#4A90D9]" /> : <FileText size={15} className="text-[#4A90D9]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {s.title || s.filename || s.url || s.source_id}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="uppercase font-semibold text-[10px] tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">{s.type}</span>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#4A90D9] hover:underline truncate">
                        {s.url} <ExternalLink size={10} />
                      </a>
                    )}
                    {s.file_url && !s.url && (
                      <a href={s.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#4A90D9] hover:underline">
                        View document <ExternalLink size={10} />
                      </a>
                    )}
                    {s.file_size && <span>{(s.file_size / 1024).toFixed(1)} KB</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeSource(s.source_id)}
                  disabled={deletingId === s.source_id}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                  title="Remove source"
                >
                  {deletingId === s.source_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
