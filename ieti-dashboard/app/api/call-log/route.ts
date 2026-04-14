import { NextRequest, NextResponse } from 'next/server'
import { supabase, IETI_TABLE } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const row = {
      received_at: body.received_at || new Date().toISOString(),
      call_id: body.call_id || '',
      call_status: body.call_status || 'completed',
      caller_name: body.caller_name || '',
      caller_phone: body.caller_phone || '',
      concern_type: body.concern_type || 'general_inquiry',
      property_address: body.property_address || '',
      lead_score: body.lead_score || 'medium',
      urgency_flag: body.urgency_flag || 'routine',
      call_type: body.call_type || 'new_inquiry',
      after_hours: body.after_hours ?? false,
      intake_collected: body.intake_collected ?? false,
      call_duration_seconds: body.call_duration_seconds || 0,
      call_outcome: body.call_outcome || '',
      user_sentiment: body.user_sentiment || '',
      wants_human: body.wants_human ?? false,
      description: body.description || '',
      call_summary: body.call_summary || '',
      recording_url: body.recording_url || '',
    }

    const { data, error } = await supabase
      .from(IETI_TABLE)
      .upsert(row, { onConflict: 'call_id' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from(IETI_TABLE)
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
