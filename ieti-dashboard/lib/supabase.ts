import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const IETI_TABLE = 'ieti_call_logs'

export type CallLog = {
  id: number
  received_at: string
  call_id: string
  call_status: string
  caller_name: string
  caller_phone: string
  concern_type: string
  property_address: string
  lead_score: 'high' | 'medium' | 'low'
  urgency_flag: 'routine' | 'urgent' | 'emergency'
  call_type: string
  after_hours: boolean
  intake_collected: boolean
  call_duration_seconds: number
  call_outcome: string
  user_sentiment: string
  wants_human: boolean
  description: string
  call_summary: string
  recording_url: string
  created_at: string
}
