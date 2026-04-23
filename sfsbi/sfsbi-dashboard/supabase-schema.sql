-- SFSBI Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor to create the sfsbi_call_logs table
-- This is an isolated table for SFSBI traffic only (separate from ieti_call_logs)

CREATE TABLE IF NOT EXISTS sfsbi_call_logs (
  id BIGSERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  call_id TEXT UNIQUE,
  agent_id TEXT,
  call_status TEXT DEFAULT 'completed',
  caller_name TEXT,
  caller_phone TEXT,
  service_interest TEXT DEFAULT 'unknown',
  how_heard TEXT,
  language_used TEXT DEFAULT 'english',
  lead_score TEXT DEFAULT 'medium' CHECK (lead_score IN ('high', 'medium', 'low')),
  urgency_flag TEXT DEFAULT 'routine' CHECK (urgency_flag IN ('routine', 'urgent', 'emergency')),
  call_type TEXT DEFAULT 'new_inquiry',
  after_hours BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  wants_human BOOLEAN DEFAULT FALSE,
  intake_collected BOOLEAN DEFAULT FALSE,
  bmi_mentioned TEXT,
  call_duration_seconds INTEGER DEFAULT 0,
  call_outcome TEXT,
  user_sentiment TEXT,
  call_summary TEXT,
  transcript TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE sfsbi_call_logs;

-- Enable Row Level Security
ALTER TABLE sfsbi_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read"   ON sfsbi_call_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON sfsbi_call_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON sfsbi_call_logs FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_received_at ON sfsbi_call_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_agent_id    ON sfsbi_call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_lead_score  ON sfsbi_call_logs(lead_score);
CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_urgency     ON sfsbi_call_logs(urgency_flag);
CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_call_id     ON sfsbi_call_logs(call_id);
CREATE INDEX IF NOT EXISTS idx_sfsbi_call_logs_is_spam     ON sfsbi_call_logs(is_spam);

-- One-time migration: copy any existing rows from the shared call_logs table
INSERT INTO sfsbi_call_logs (
  received_at, call_id, call_status, caller_name, caller_phone, service_interest,
  how_heard, language_used, lead_score, urgency_flag, call_type, after_hours,
  intake_collected, call_duration_seconds, call_outcome, user_sentiment,
  wants_human, bmi_mentioned, call_summary, recording_url
)
SELECT
  received_at, call_id, call_status, caller_name, caller_phone, service_interest,
  how_heard, language_used, lead_score, urgency_flag, call_type, after_hours,
  intake_collected, call_duration_seconds, call_outcome, user_sentiment,
  wants_human, bmi_mentioned, call_summary, recording_url
FROM call_logs
WHERE call_id IS NOT NULL
ON CONFLICT (call_id) DO NOTHING;