import { NextRequest, NextResponse } from 'next/server'

const RETELL_API_KEY = process.env.RETELL_API_KEY!
const LLM_ID = 'llm_cab07a332ad0ee72450127f9ec95'
const KB_ID = 'knowledge_base_594d967344859d75'

async function retell(method: string, path: string, body?: unknown) {
  const res = await fetch(`https://api.retellai.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const text = await res.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { ok: res.ok, status: res.status, data }
}

type KBSource = {
  source_id: string
  type: 'url' | 'text' | 'document'
  url?: string
  title?: string
  filename?: string
  file_url?: string
  file_size?: number
  auto_refresh_interval?: string
}

// GET — list current sources on the SFSBI knowledge base + attachment status
export async function GET() {
  const [kbRes, llmRes] = await Promise.all([
    retell('GET', `/get-knowledge-base/${KB_ID}`),
    retell('GET', `/get-retell-llm/${LLM_ID}`),
  ])
  if (!kbRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch knowledge base', details: kbRes.data }, { status: 500 })
  }
  const kb = kbRes.data as {
    knowledge_base_id: string
    knowledge_base_name: string
    knowledge_base_sources: KBSource[]
    status: string
    error_messages?: string[]
  }
  const llm = (llmRes.ok ? llmRes.data : {}) as { knowledge_base_ids?: string[] }
  const attached = (llm.knowledge_base_ids ?? []).includes(KB_ID)
  return NextResponse.json({
    kb_id: kb.knowledge_base_id,
    kb_name: kb.knowledge_base_name,
    status: kb.status,
    attached_to_dorothy: attached,
    sources: kb.knowledge_base_sources ?? [],
    errors: kb.error_messages ?? [],
  })
}

// POST — add a new source (url OR text snippet)
// body: { type: 'url', url: 'https://...' }  OR  { type: 'text', title: '...', text: '...' }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { type, url, title, text } = body as {
    type?: 'url' | 'text'
    url?: string
    title?: string
    text?: string
  }

  let payload: Record<string, unknown>
  if (type === 'url') {
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'url must start with http(s)://' }, { status: 400 })
    }
    payload = { knowledge_base_urls: [url] }
  } else if (type === 'text') {
    if (!title || !text || text.trim().length < 10) {
      return NextResponse.json({ error: 'title and text (min 10 chars) required' }, { status: 400 })
    }
    payload = { knowledge_base_texts: [{ title, text }] }
  } else {
    return NextResponse.json({ error: "type must be 'url' or 'text'" }, { status: 400 })
  }

  const res = await retell('POST', `/add-knowledge-base-sources/${KB_ID}`, payload)
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to add source', details: res.data }, { status: 500 })
  }

  // Ensure KB is attached to Dorothy's LLM (idempotent)
  const llmRes = await retell('GET', `/get-retell-llm/${LLM_ID}`)
  if (llmRes.ok) {
    const llm = llmRes.data as { knowledge_base_ids?: string[] }
    const ids = new Set(llm.knowledge_base_ids ?? [])
    if (!ids.has(KB_ID)) {
      ids.add(KB_ID)
      await retell('PATCH', `/update-retell-llm/${LLM_ID}`, { knowledge_base_ids: Array.from(ids) })
    }
  }

  return NextResponse.json({ ok: true, data: res.data })
}

// DELETE — remove a source by source_id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sourceId = searchParams.get('source_id')
  if (!sourceId) {
    return NextResponse.json({ error: 'source_id query param required' }, { status: 400 })
  }
  const res = await retell('DELETE', `/delete-knowledge-base-source/${KB_ID}/source/${sourceId}`)
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to delete source', details: res.data }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
