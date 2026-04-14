# QC DASHBOARD — SKILL.md
# The Complete Blueprint for Building AI Receptionist QC Dashboards
# Version: 1.0 | April 2026
# Use this every time you create a new client dashboard. Follow it exactly.

---

## OVERVIEW

This skill defines how to build a production-ready QC (Quality Control) Dashboard for any Retell AI voice agent client. The dashboard connects to Supabase for real-time call data, integrates with n8n workflows for automation, and uses Twilio for SMS alerts.

The system has 5 layers:
1. **Supabase** — Database for call logs (real-time subscriptions)
2. **Next.js Dashboard** — Client-branded frontend with 7 pages
3. **n8n Workflows** — Post-call handler, urgent escalation, weekly report
4. **Retell AI** — Voice agent with system prompt + knowledge base
5. **Twilio** — Phone number + SMS alerts

Every new client dashboard follows this EXACT architecture. Customize branding, services, and field names — but the structure never changes.

---

## TECH STACK (Do Not Deviate)

```
Framework:     Next.js 16+ (App Router)
Language:      TypeScript
Styling:       TailwindCSS v4+
Icons:         lucide-react
Charts:        recharts
Database:      Supabase (PostgreSQL + Realtime)
Client lib:    @supabase/supabase-js v2
Utilities:     clsx, date-fns
Font:          Inter (Google Fonts)
```

### package.json dependencies (copy exactly)
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.102.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^1.7.0",
    "next": "16.2.2",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## PROJECT STRUCTURE (Every Dashboard Follows This)

```
[client]-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + main content wrapper
│   │   ├── dashboard/page.tsx      ← Main overview page
│   │   ├── calls/page.tsx          ← Full call log with filters
│   │   ├── leads/page.tsx          ← Lead tracker by score
│   │   ├── urgent/page.tsx         ← Urgent flags + human handoffs
│   │   ├── analytics/page.tsx      ← Charts and trends
│   │   ├── weekly/page.tsx         ← Weekly QC report generator
│   │   └── settings/page.tsx       ← IDs, webhooks, setup checklist
│   ├── api/
│   │   └── calls/route.ts          ← POST (upsert) + GET (fetch) call logs
│   ├── globals.css                 ← Brand CSS variables + Tailwind import
│   ├── layout.tsx                  ← Root layout (font, metadata)
│   └── page.tsx                    ← Root redirect to /dashboard
├── components/
│   ├── Sidebar.tsx                 ← Navigation + branding + agent status
│   ├── TopBar.tsx                  ← Page title, refresh, user avatar
│   ├── StatCard.tsx                ← Metric card with icon + trend
│   ├── Badge.tsx                   ← Small styled label
│   ├── AudioPlayer.tsx             ← Call recording playback
│   ├── CallRow.tsx                 ← Expandable call detail row
│   ├── DashboardClient.tsx         ← Main dashboard with stats + charts
│   ├── CallsClient.tsx             ← Filterable call log list
│   ├── LeadsClient.tsx             ← Lead cards by score tier
│   ├── UrgentClient.tsx            ← Urgent + human handoff list
│   ├── AnalyticsClient.tsx         ← Charts: volume, leads, sentiment
│   └── WeeklyClient.tsx            ← Printable weekly QC report
├── lib/
│   ├── supabase.ts                 ← Supabase client + CallLog type
│   └── utils.ts                    ← Formatting + color + label utilities
├── public/
│   └── [client]-logo.webp          ← Client logo file
├── .env.local                      ← Supabase URL + anon key + Retell API key
├── supabase-schema.sql             ← Full Supabase schema + sample data
└── package.json
```

---

## CUSTOMIZATION POINTS (What Changes Per Client)

Every client dashboard is 90% identical. Only these things change:

### 1. Brand Variables (globals.css)
```css
:root {
  --brand-primary: #[CLIENT_COLOR];     /* Main accent — buttons, active nav, links */
  --brand-secondary: #[SECONDARY];      /* Success/positive actions */
  --brand-gray: #[GRAY];                /* Muted text */
  --brand-dark: #[DARK];                /* Sidebar bg, headings */
}
body {
  background-color: #f5f7fa;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### 2. Metadata (app/layout.tsx)
```typescript
export const metadata: Metadata = {
  title: "[CLIENT_NAME] — AI Receptionist Dashboard",
  description: "Quality Control Dashboard for [CLIENT_FULL_NAME]",
  icons: { icon: "/[client]-logo.webp" },
};
```

### 3. Sidebar Branding (components/Sidebar.tsx)
- Logo: `/public/[client]-logo.webp`
- Subtitle: `"AI Receptionist Dashboard"`
- Agent ID display at bottom
- Active nav uses `var(--brand-primary)`

### 4. TopBar User Info (components/TopBar.tsx)
- Avatar initial letter (e.g. "S" for Sheena)
- Name: `"[COORDINATOR_NAME]"`
- Role: `"Admin"`

### 5. Service Labels (lib/utils.ts → getServiceLabel)
This is the KEY customization — maps backend `service_interest` keys to display names:
```typescript
export function getServiceLabel(key: string): string {
  const map: Record<string, string> = {
    // ← CLIENT-SPECIFIC SERVICE KEYS HERE
    // Example for a bariatric clinic:
    gastric_sleeve: 'Gastric Sleeve',
    gastric_bypass: 'Gastric Bypass',
    coolsculpting: 'CoolSculpting',
    // Example for a property management company:
    water_leak: 'Water Leak',
    mold_concern: 'Mold Concern',
    noise_complaint: 'Noise Complaint',
    // Always include:
    general_inquiry: 'General Inquiry',
    unknown: 'Unknown',
  }
  return map[key] || key
}
```

### 6. CallLog Type (lib/supabase.ts)
The base type is universal. Only add client-specific fields if needed:
```typescript
export type CallLog = {
  id: number
  received_at: string
  call_id: string
  call_status: string
  caller_name: string
  caller_phone: string
  service_interest: string       // ← values match getServiceLabel keys
  how_heard: string              // Optional: remove if not relevant
  language_used: string          // Keep if bilingual, remove if not
  lead_score: 'high' | 'medium' | 'low'
  urgency_flag: 'routine' | 'urgent' | 'emergency'
  call_type: string
  after_hours: boolean
  intake_collected: boolean
  call_duration_seconds: number
  call_outcome: string
  user_sentiment: string
  wants_human: boolean
  // CLIENT-SPECIFIC FIELDS:
  // bmi_mentioned: string        ← bariatric clinics
  // property_address: string     ← property management
  // unit_number: string          ← apartments
  call_summary: string
  recording_url: string
  created_at: string
}
```

### 7. Settings Page IDs (app/(dashboard)/settings/page.tsx)
```typescript
const AGENT_ID = '[RETELL_AGENT_ID]'
const LLM_ID   = '[RETELL_LLM_ID]'
const WF1_ID   = '[N8N_WF1_ID]'
const WF2_ID   = '[N8N_WF2_ID]'
const WF3_ID   = '[N8N_WF3_ID]'
const WEBHOOK  = 'https://[N8N_URL]/webhook/[client]-retell-call-ended'
```

### 8. Weekly Report Trigger URL (components/WeeklyClient.tsx)
```typescript
await fetch('https://[N8N_URL]/webhook/[client]-weekly-report', { ... })
```

### 9. Sample Data (supabase-schema.sql)
- 8-10 realistic sample rows with client-specific service types, names, phone numbers
- Must match the `service_interest` keys in `getServiceLabel`

---

## SUPABASE SCHEMA (Universal — Copy Then Customize)

```sql
-- ============================================================
-- [CLIENT_NAME] QC Dashboard — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS call_logs (
  id                    BIGSERIAL PRIMARY KEY,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  call_id               TEXT UNIQUE,
  call_status           TEXT,
  caller_name           TEXT DEFAULT '',
  caller_phone          TEXT DEFAULT '',
  service_interest      TEXT DEFAULT 'unknown',
  how_heard             TEXT DEFAULT '',
  language_used         TEXT DEFAULT 'english',
  lead_score            TEXT DEFAULT 'medium',
  urgency_flag          TEXT DEFAULT 'routine',
  call_type             TEXT DEFAULT 'new_inquiry',
  after_hours           BOOLEAN DEFAULT FALSE,
  intake_collected      BOOLEAN DEFAULT FALSE,
  call_duration_seconds INTEGER DEFAULT 0,
  call_outcome          TEXT DEFAULT '',
  user_sentiment        TEXT DEFAULT '',
  wants_human           BOOLEAN DEFAULT FALSE,
  -- CLIENT-SPECIFIC COLUMNS (add/remove as needed):
  -- bmi_mentioned       TEXT DEFAULT '',       ← bariatric
  -- property_address    TEXT DEFAULT '',       ← property mgmt
  -- unit_number         TEXT DEFAULT '',       ← apartments
  call_summary          TEXT DEFAULT '',
  recording_url         TEXT DEFAULT '',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Standard indexes (always include these)
CREATE INDEX IF NOT EXISTS idx_call_logs_received_at    ON call_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_score     ON call_logs(lead_score);
CREATE INDEX IF NOT EXISTS idx_call_logs_urgency_flag   ON call_logs(urgency_flag);
CREATE INDEX IF NOT EXISTS idx_call_logs_service        ON call_logs(service_interest);
CREATE INDEX IF NOT EXISTS idx_call_logs_intake         ON call_logs(intake_collected);

-- Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all reads" ON call_logs FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON call_logs FOR INSERT WITH CHECK (true);
```

---

## ENV FILE (.env.local)

```
# Supabase — from supabase.com → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# Retell — for fetching recordings if needed
RETELL_API_KEY=[RETELL_API_KEY]
```

---

## COMPONENT PATTERNS (Reference for Every Component)

### Pattern 1: Page Component (Thin Wrapper)
Every page under `app/(dashboard)/` is a thin wrapper:
```tsx
import XxxClient from '@/components/XxxClient'
export default function XxxPage() {
  return <XxxClient />
}
```

### Pattern 2: Client Component (Data Fetching)
Every `*Client.tsx` follows this exact pattern:
```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import TopBar from '@/components/TopBar'
import { supabase } from '@/lib/supabase'
import type { CallLog } from '@/lib/supabase'

export default function XxxClient() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCalls = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      // Add .eq(), .in(), .gte() filters as needed
      .order('received_at', { ascending: false })
      .limit(200)
    if (data) setCalls(data as CallLog[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar
        title="Page Title"
        subtitle="Description"
        onRefresh={() => fetchCalls(true)}
        refreshing={refreshing}
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
        {/* Page content */}
      </div>
    </div>
  )
}
```

### Pattern 3: Real-Time Subscription (Dashboard + Urgent pages)
```tsx
useEffect(() => {
  fetchCalls()
  const channel = supabase
    .channel('call_logs_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_logs' },
      (payload) => setCalls(prev => [payload.new as CallLog, ...prev])
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [fetchCalls])
```
Use real-time on: DashboardClient, UrgentClient
Do NOT use on: CallsClient, LeadsClient, AnalyticsClient, WeeklyClient (they use manual refresh)

### Pattern 4: API Route (app/api/calls/route.ts)
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const row = {
    received_at:           body.received_at || new Date().toISOString(),
    call_id:               body.call_id || null,
    // ... map ALL fields with defaults
  }
  const { error } = await supabase.from('call_logs').upsert(row, { onConflict: 'call_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const { data, error } = await supabase
    .from('call_logs').select('*')
    .order('received_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

---

## DASHBOARD PAGES — WHAT EACH PAGE DOES

### 1. Dashboard (/dashboard) — DashboardClient.tsx
- **8 StatCards** in 2 rows of 4: Total Calls, High-Intent Leads, Urgent Flags, Intake Rate, Avg Duration, Bilingual Calls, New Inquiries, Human Handoffs
- **Bar chart**: Calls per day (last 7 days) using recharts BarChart
- **Pie chart**: Lead quality distribution (high/medium/low)
- **Horizontal bar chart**: Top 6 service interests
- **Recent calls**: Last 8 calls using CallRow component
- **Real-time**: New calls appear automatically via Supabase subscription

### 2. Call Logs (/calls) — CallsClient.tsx
- **Search bar**: Filters by name, phone, service, summary (client-side)
- **Filter chips**: Lead score (all/high/medium/low), Urgency (routine/urgent/emergency), Language (EN/ES/bilingual)
- **Call list**: Paginated (20 per page) using CallRow component
- **CSV export**: Downloads filtered results as CSV
- **Pagination**: Bottom pagination with page numbers

### 3. Leads (/leads) — LeadsClient.tsx
- **Tab bar**: High / Medium / Low with count badges
- **Lead cards**: 2-column grid with name, phone, service, summary, call-back button
- **Filters**: Only shows calls with `intake_collected = true`
- **Action button**: `tel:` link for one-tap callback

### 4. Urgent (/urgent) — UrgentClient.tsx
- **Alert banner**: Red banner showing count of urgent calls
- **Two sections**: Urgent/Emergency calls, Human Handoff Requests
- **Expandable cards**: Click to reveal summary + call-back button
- **Real-time**: New urgent calls appear automatically
- **Color coding**: Emergency = red, Urgent = orange, Human = blue

### 5. Analytics (/analytics) — AnalyticsClient.tsx
- **Date range selector**: 7 / 30 / 90 day buttons
- **Line chart**: Daily call volume over selected range
- **Stacked bar chart**: Lead quality by week
- **Pie chart**: Language breakdown
- **Horizontal bar chart**: Service interest breakdown (top 8)
- **Pie chart + table**: Sentiment distribution + call outcome counts

### 6. Weekly Report (/weekly) — WeeklyClient.tsx
- **Branded report card**: Dark header with logo + 3 hero stats
- **Sections**: Call Volume, Lead Quality, Flags, Top Service Interests
- **High-intent leads table**: Names + phones + call-back buttons
- **Action buttons**: "Email Report" (triggers n8n WF3) + "Print/Save PDF" (window.print())
- **Data range**: Last 7 days only

### 7. Settings (/settings) — page.tsx (inline, no client component)
- **Copy fields**: Agent ID, LLM ID, WF1/WF2/WF3 IDs, Webhook URL
- **Setup checklist**: 10-item checklist of deployment steps
- **External links**: Direct links to Retell dashboard, n8n

---

## N8N WORKFLOW ARCHITECTURE (3 Workflows Per Client)

### WF1: Post-Call Handler
```
Webhook (POST /[client]-retell-call-ended)
  → Code (Parse Retell Payload)
    → IF (Skip Spam) [true=NoOp, false=continue]
      → HTTP Request (Supabase REST API — upsert call_logs)
        → IF (Urgent or Human Requested) [true=SMS alert, false=continue]
          → IF (High Lead Score) [true=SMS alert]
```

**Supabase HTTP Request node config:**
```
Method: POST
URL: https://[PROJECT_REF].supabase.co/rest/v1/call_logs
Headers:
  apikey: [ANON_KEY]
  Authorization: Bearer [ANON_KEY]
  Content-Type: application/json
  Prefer: resolution=merge-duplicates
Body: JSON with all call fields mapped from $json.*
```

**Twilio SMS node config:**
```
Method: POST
URL: https://api.twilio.com/2010-04-01/Accounts/[TWILIO_SID]/Messages.json
Auth: HTTP Basic (Twilio SID:Token)
Body (form-urlencoded):
  To: [COORDINATOR_PHONE]
  From: [TWILIO_PHONE]
  Body: Expression with caller name, phone, service, summary
```

### WF2: Urgent Escalation
```
Webhook (POST /[client]-urgent-callback)
  → Code (Format Urgent Data)
    → Twilio SMS to Coordinator
    → Twilio SMS to Owner/Doctor (if applicable)
```

### WF3: Weekly QC Report
```
Webhook (POST /[client]-weekly-report) OR Schedule (Monday 9am)
  → HTTP Request (GET from Supabase — last 7 days of call_logs)
    → Code (Calculate weekly stats)
      → Gmail (Send HTML report email)
```

---

## RETELL AGENT CONFIGURATION

When creating the agent for a new client, use the Retell API:

### Step 1: Create LLM
```python
retell_api("POST", "/create-retell-llm", {
    "model": "gpt-4o",
    "model_temperature": 0.3,
    "general_prompt": SYSTEM_PROMPT,  # Under 650 tokens per retell_voice_agent_skill.md
    "begin_message": "Thanks for calling [BUSINESS]. How can I help you today?"
})
```

### Step 2: Update Agent
```python
retell_api("PATCH", f"/update-agent/{AGENT_ID}", {
    "agent_name": "[CLIENT] - AI Receptionist",
    "response_engine": {"type": "retell-llm", "llm_id": llm_id},
    "voice_id": "11labs-Dorothy",
    "voice_speed": 1.0,
    "voice_temperature": 0.7,
    "enable_dynamic_voice_speed": True,
    "responsiveness": 0.9,
    "enable_dynamic_responsiveness": True,
    "interruption_sensitivity": 0.8,
    "enable_backchannel": True,
    "backchannel_frequency": 0.5,
    "backchannel_words": ["mm-hmm", "yeah", "right", "got it", "sure"],
    "ambient_sound": "call-center",
    "ambient_sound_volume": 0.3,
    "end_call_after_silence_ms": 30000,
    "max_call_duration_ms": 600000,
    "normalize_for_speech": True,
    "reminder_trigger_ms": 10000,
    "reminder_max_count": 2,
    "language": "en-US",
    "webhook_url": "https://[N8N_URL]/webhook/[client]-retell-call-ended",
    "boosted_keywords": ["[BUSINESS_TERMS]"],
    "pronunciation_dictionary": [
        {"word": "[HARD_WORD]", "alphabet": "ipa", "phoneme": "[IPA]"}
    ],
    "post_call_analysis_data": POST_CALL_FIELDS
})
```

### Step 3: Import Twilio Number
```python
retell_api("POST", "/import-phone-number", {
    "phone_number": TWILIO_PHONE_NUMBER,
    "phone_number_type": "twilio",
    "twilio_account_sid": TWILIO_SID,
    "twilio_auth_token": TWILIO_TOKEN,
    "inbound_agent_id": AGENT_ID,
    "termination_uri": "https://[N8N_URL]/webhook/[client]-retell-call-ended"
})
```

### Step 4: Configure Twilio Voice Webhook
In Twilio Console → Phone Number → Voice Configuration:
```
A Call Comes In: https://api.retellai.com/twilio-voice-webhook/[AGENT_ID]
Method: HTTP POST
```

---

## POST-CALL ANALYSIS FIELDS (Standard — Add Client-Specific)

These 15 fields are the universal base. Add client-specific fields as needed.

```python
POST_CALL_FIELDS = [
    {"name": "caller_name", "type": "string", "description": "Full name of the caller"},
    {"name": "caller_phone", "type": "string", "description": "Callback phone number"},
    {"name": "service_interest", "type": "string", "description": "Which service they're interested in"},
    {"name": "how_heard_about_us", "type": "string", "description": "How they found us"},
    {"name": "language_used", "type": "string", "description": "english, spanish, or both"},
    {"name": "lead_score", "type": "string", "description": "high, medium, or low"},
    {"name": "urgency_flag", "type": "string", "description": "routine, urgent, or emergency"},
    {"name": "call_type", "type": "string", "description": "new_inquiry, existing_patient, or spam"},
    {"name": "after_hours", "type": "boolean", "description": "Was this call outside business hours?"},
    {"name": "is_spam", "type": "boolean", "description": "Is this a spam/solicitor call?"},
    {"name": "wants_human", "type": "boolean", "description": "Did caller request to speak with a human?"},
    {"name": "intake_collected", "type": "boolean", "description": "Did we get name + phone + service?"},
    {"name": "call_outcome", "type": "string", "description": "intake_collected, question_answered_only, insurance_disqualified, hang_up_early, spam, or urgent_escalation"},
    {"name": "call_summary", "type": "string", "description": "2-3 sentence summary of the call"},
    # CLIENT-SPECIFIC:
    # {"name": "bmi_mentioned", "type": "string", "description": "BMI if mentioned"},
    # {"name": "property_address", "type": "string", "description": "Property address if given"},
]
```

---

## UTILITY FUNCTIONS (lib/utils.ts — Universal)

Always include these functions. They handle all formatting across every component.

```typescript
// cn() — className merger
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

// formatDuration(seconds) → "3m 12s"
export function formatDuration(seconds: number): string

// formatPhone(phone) → "+1 (305) 123-4567"
export function formatPhone(phone: string): string

// formatDate(dateStr) → "Apr 8, 2026, 02:30 PM"
export function formatDate(dateStr: string): string

// formatDateShort(dateStr) → "Apr 8"
export function formatDateShort(dateStr: string): string

// getLeadScoreColor(score) → Tailwind classes for badge
export function getLeadScoreColor(score: string): string

// getUrgencyColor(flag) → Tailwind classes for badge
export function getUrgencyColor(flag: string): string

// getSentimentColor(sentiment) → Tailwind text class
export function getSentimentColor(sentiment: string): string

// getServiceLabel(key) → Display name ← CLIENT-SPECIFIC MAP
export function getServiceLabel(key: string): string
```

---

## DESIGN SYSTEM (Consistent Across All Clients)

### Colors (Override per client)
| Token | Default | Usage |
|---|---|---|
| `--brand-primary` | `#4A90D9` | Active nav, buttons, links, stat icons |
| `--brand-secondary` | `#4CAF50` | Success states, call-back buttons, positive badges |
| `--brand-dark` | `#1e2a3a` | Sidebar background, headings |
| `--brand-gray` | `#8C8C8C` | Muted text |
| Background | `#f5f7fa` | Page background |

### Card Style
```
bg-white rounded-xl border border-slate-100 shadow-sm p-5
```

### Badge Style
```
inline-flex items-center font-medium border rounded-full capitalize
Size sm: px-2 py-0.5 text-[11px]
Size md: px-2.5 py-1 text-xs
```

### Button Styles
```
Primary:  bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90
Success:  bg-[#4CAF50] text-white rounded-lg hover:bg-green-600
Outline:  border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50
Filter:   bg-slate-50 text-slate-600 border border-slate-200 rounded-lg (inactive)
          bg-[var(--brand-primary)] text-white (active)
```

### Chart Colors
```
BLUE   = var(--brand-primary)
GREEN  = '#4CAF50'
AMBER  = '#F59E0B'
RED    = '#EF4444'
VIOLET = '#8B5CF6'
GRAY   = '#94a3b8'
```

---

## DEPLOYMENT CHECKLIST (For Every New Client)

```
## Phase 1: Setup (30 min)
□ Create Supabase project
□ Run supabase-schema.sql in SQL Editor
□ Note Supabase URL + anon key
□ Create Next.js app: npx create-next-app@latest [client]-dashboard
□ Install deps: npm i @supabase/supabase-js clsx date-fns lucide-react recharts
□ Copy .env.local template and fill values

## Phase 2: Dashboard Build (60-90 min)
□ Copy all component files from template
□ Customize globals.css brand variables
□ Customize getServiceLabel() in lib/utils.ts
□ Customize Sidebar logo + branding
□ Customize TopBar user info
□ Add client logo to /public/
□ Update Settings page IDs
□ Insert sample data into Supabase
□ Test: npm run dev → verify all 7 pages render

## Phase 3: n8n Workflows (30 min)
□ Create WF1: Post-call handler with Supabase + SMS
□ Create WF2: Urgent escalation with SMS
□ Create WF3: Weekly QC report with email
□ Fill Twilio SID, phone numbers, Sheena phone
□ Fill Supabase URL + key in HTTP Request nodes
□ Activate all 3 workflows

## Phase 4: Retell Agent (30 min)
□ Create LLM via API with system prompt
□ Update agent with voice settings + post-call fields
□ Upload knowledge base in Retell dashboard
□ Import Twilio number via API
□ Configure Twilio Voice webhook URL
□ Test 5 calls per retell_voice_agent_skill.md

## Phase 5: Go Live (15 min)
□ Delete sample data from Supabase
□ Verify dashboard loads empty state cleanly
□ Make 1 test call → verify it shows in dashboard
□ Verify SMS alerts fire for urgent/high-lead
□ Send weekly report test email
□ Hand off to client
```

---

## TIMING ESTIMATES

| Phase | Time | Notes |
|---|---|---|
| Supabase setup | 10 min | Create project, run SQL, note keys |
| Dashboard build | 60-90 min | Copy template, customize branding |
| n8n workflows | 30 min | 3 workflows with credentials |
| Retell agent | 30 min | LLM, agent config, KB, phone import |
| Testing | 20 min | 5 test calls + SMS + dashboard check |
| **Total** | **~3 hours** | From zero to live agent + dashboard |

---

## COMMON ISSUES AND FIXES

| Issue | Cause | Fix |
|---|---|---|
| Dashboard shows no data | Supabase URL/key wrong in .env.local | Verify NEXT_PUBLIC_SUPABASE_URL and key |
| Real-time not working | Supabase Realtime not enabled | Enable Realtime for call_logs table in Supabase dashboard |
| n8n Supabase insert fails | RLS blocking inserts | Add "Allow all inserts" policy or use service_role key |
| SMS not sending | A2P registration needed | Register for 10DLC or use trial mode |
| Agent doesn't answer | Twilio webhook not set | Set Voice URL to `https://api.retellai.com/twilio-voice-webhook/[AGENT_ID]` |
| Recording URL empty | Call too short or still processing | Retell generates recordings ~30s after call ends |
| Charts empty | No calls in selected date range | Check date range selector, verify sample data timestamps |
| ambient_sound API error | Invalid value | Only allowed: coffee-shop, convention-hall, summer-outdoor, mountain-outdoor, static-noise, call-center |

---

## VERSION HISTORY
- v1.0 (April 2026): Initial skill file based on SFSBI deployment. Tested architecture: Next.js 16 + Supabase + n8n + Retell + Twilio. Full 7-page dashboard with real-time subscriptions, 3 n8n workflows, Retell API integration. Estimated build time: 3 hours per client from template.
