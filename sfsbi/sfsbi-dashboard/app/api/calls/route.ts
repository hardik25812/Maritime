import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const row = {
      received_at:           body.received_at || new Date().toISOString(),
      call_id:               body.call_id || null,
      call_status:           body.call_status || '',
      caller_name:           body.caller_name || '',
      caller_phone:          body.caller_phone || '',
      service_interest:      body.service_interest || 'unknown',
      how_heard:             body.how_heard || '',
      language_used:         body.language_used || 'english',
      lead_score:            body.lead_score || 'medium',
      urgency_flag:          body.urgency_flag || 'routine',
      call_type:             body.call_type || 'new_inquiry',
      after_hours:           body.after_hours === true || body.after_hours === 'true',
      intake_collected:      body.intake_collected === true || body.intake_collected === 'true',
      call_duration_seconds: parseInt(body.call_duration_seconds) || 0,
      call_outcome:          body.call_outcome || '',
      user_sentiment:        body.user_sentiment || '',
      wants_human:           body.wants_human === true || body.wants_human === 'true',
      bmi_mentioned:         body.bmi_mentioned || '',
      call_summary:          body.call_summary || '',
      recording_url:         body.recording_url || '',
    }

    const { error } = await supabase.from('call_logs').upsert(row, { onConflict: 'call_id' })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
