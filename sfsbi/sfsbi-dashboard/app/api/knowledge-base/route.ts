import { NextRequest, NextResponse } from 'next/server'

const RETELL_API_KEY = process.env.RETELL_API_KEY!
const LLM_ID = 'llm_cab07a332ad0ee72450127f9ec95'
const AGENT_ID = 'agent_dfd95700637dad9769ebf4fa24'

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

export async function GET() {
  const [llmRes, agentRes] = await Promise.all([
    retell('GET', `/get-retell-llm/${LLM_ID}`),
    retell('GET', `/get-agent/${AGENT_ID}`),
  ])
  if (!llmRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch LLM', details: llmRes.data }, { status: 500 })
  }
  const llm = llmRes.data as { general_prompt?: string; general_tools?: unknown[]; begin_message?: string }
  const agent = (agentRes.ok ? agentRes.data : {}) as {
    agent_name?: string
    voice_id?: string
    voice_model?: string
    language?: string
    voice_speed?: number
    interruption_sensitivity?: number
    backchannel_frequency?: number
    backchannel_words?: string[]
  }
  return NextResponse.json({
    prompt: llm.general_prompt ?? '',
    begin_message: llm.begin_message ?? '',
    tools: (llm.general_tools ?? []).map((t: unknown) => {
      const tool = t as { name?: string; type?: string; description?: string }
      return { name: tool.name, type: tool.type, description: tool.description }
    }),
    agent: {
      name: agent.agent_name,
      voice_id: agent.voice_id,
      voice_model: agent.voice_model,
      language: agent.language,
      voice_speed: agent.voice_speed,
      interruption_sensitivity: agent.interruption_sensitivity,
      backchannel_frequency: agent.backchannel_frequency,
      backchannel_words: agent.backchannel_words,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { prompt, begin_message } = body as { prompt?: string; begin_message?: string }
  if (typeof prompt !== 'string' || prompt.length < 50) {
    return NextResponse.json({ error: 'prompt must be a non-trivial string' }, { status: 400 })
  }
  // Safety: refuse to save if pricing tokens slip in
  if (/\$\s?\d/.test(prompt)) {
    return NextResponse.json({ error: 'Prompt contains a dollar amount. Dorothy must not quote pricing. Remove and retry.' }, { status: 400 })
  }
  const payload: Record<string, unknown> = { general_prompt: prompt }
  if (typeof begin_message === 'string') payload.begin_message = begin_message

  const res = await retell('PATCH', `/update-retell-llm/${LLM_ID}`, payload)
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to update LLM', details: res.data }, { status: 500 })
  }
  const llm = res.data as { general_prompt?: string; begin_message?: string }
  return NextResponse.json({
    ok: true,
    prompt: llm.general_prompt ?? '',
    begin_message: llm.begin_message ?? '',
    saved_at: new Date().toISOString(),
  })
}
