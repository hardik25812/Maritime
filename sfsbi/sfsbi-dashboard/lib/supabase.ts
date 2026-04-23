import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// SFSBI-only table. Isolated from IETI (which uses ieti_call_logs).
export const SFSBI_TABLE = 'sfsbi_call_logs'
export const SFSBI_AGENT_ID = 'agent_dfd95700637dad9769ebf4fa24'

export type CallLog = {
  id: number
  received_at: string
  call_id: string
  call_status: string
  caller_name: string
  caller_phone: string
  service_interest: string
  how_heard: string
  language_used: string
  lead_score: 'high' | 'medium' | 'low'
  urgency_flag: 'routine' | 'urgent' | 'emergency'
  call_type: string
  after_hours: boolean
  intake_collected: boolean
  call_duration_seconds: number
  call_outcome: string
  user_sentiment: string
  wants_human: boolean
  bmi_mentioned: string
  call_summary: string
  recording_url: string
  created_at: string
}
