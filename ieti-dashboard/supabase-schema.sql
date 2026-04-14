-- IETI Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor to create the ieti_call_logs table

CREATE TABLE IF NOT EXISTS ieti_call_logs (
  id BIGSERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  call_id TEXT UNIQUE,
  call_status TEXT DEFAULT 'completed',
  caller_name TEXT,
  caller_phone TEXT,
  concern_type TEXT DEFAULT 'general_inquiry',
  property_address TEXT,
  lead_score TEXT DEFAULT 'medium' CHECK (lead_score IN ('high', 'medium', 'low')),
  urgency_flag TEXT DEFAULT 'routine' CHECK (urgency_flag IN ('routine', 'urgent', 'emergency')),
  call_type TEXT DEFAULT 'new_inquiry',
  after_hours BOOLEAN DEFAULT FALSE,
  intake_collected BOOLEAN DEFAULT FALSE,
  call_duration_seconds INTEGER DEFAULT 0,
  call_outcome TEXT,
  user_sentiment TEXT,
  wants_human BOOLEAN DEFAULT FALSE,
  description TEXT,
  call_summary TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE ieti_call_logs;

-- Enable Row Level Security
ALTER TABLE ieti_call_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (dashboard reads)
CREATE POLICY "Allow anonymous read" ON ieti_call_logs
  FOR SELECT USING (true);

-- Allow anonymous insert (API route inserts from n8n)
CREATE POLICY "Allow anonymous insert" ON ieti_call_logs
  FOR INSERT WITH CHECK (true);

-- Allow anonymous update (upsert from API)
CREATE POLICY "Allow anonymous update" ON ieti_call_logs
  FOR UPDATE USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ieti_call_logs_received_at ON ieti_call_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_ieti_call_logs_lead_score ON ieti_call_logs(lead_score);
CREATE INDEX IF NOT EXISTS idx_ieti_call_logs_urgency_flag ON ieti_call_logs(urgency_flag);
CREATE INDEX IF NOT EXISTS idx_ieti_call_logs_call_id ON ieti_call_logs(call_id);
