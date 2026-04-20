import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const IETI_TABLE = 'ieti_call_logs'
export const FLOOD_EVENTS_TABLE = 'ieti_flood_events'
export const LEADS_TABLE = 'ieti_leads'

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

export type FloodEvent = {
  id: string
  alert_id: string
  event_type: string
  severity: string
  certainty: string
  urgency: string
  headline: string
  description: string
  instruction: string
  affected_zones: string[]
  affected_counties: string[]
  rainfall_inches: number | null
  gauge_station_id: string
  gauge_level_ft: number | null
  gauge_status: string
  fema_flood_zone: string
  coordinates: { lat: number; lon: number } | null
  satellite_data: Record<string, unknown> | null
  leads_generated: number
  outreach_sent: number
  start_time: string
  end_time: string
  processed_at: string
  created_at: string
}

export type Lead = {
  id: string
  source: 'flood_radar' | 'new_homebuyer'
  owner_name: string
  owner_phone: string
  owner_email: string
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  year_built: number | null
  property_type: string
  flood_zone: string
  trigger_event_id: string
  trigger_event_type: string
  trigger_date: string
  rainfall_inches: number | null
  outreach_channel: 'sms' | 'email' | 'both'
  sms_sent_at: string | null
  sms_status: string
  email_sent_at: string | null
  email_status: string
  response_status: 'none' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'booked' | 'opted_out'
  booking_url: string
  notes: string
  created_at: string
  updated_at: string
}
