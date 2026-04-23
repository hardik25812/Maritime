# SFSBI AI Receptionist — Client Demo Script for Sheena

> **Presenter Notes:** Walk Sheena through each section below. Each section has a SHOW (what to demo live) and a TELL (what to explain). Total demo time: ~20-30 minutes.

---

## 1. THE BIG PICTURE (2 min)

**TELL:**
"We've built a complete AI receptionist system for SFSBI. Here's what it does end-to-end:"

```
Caller dials +1 (645) 218-8532
    → Twilio receives the call
    → Routes to Retell AI via SIP Trunk
    → Dorothy (the AI receptionist) answers
    → She greets, answers questions, collects intake info
    → After the call ends, data is automatically sent to:
        1. Your QC Dashboard (real-time)
        2. Sheena gets an SMS alert if urgent
        3. Weekly email report every Monday
```

**Everything is automated. Zero manual work.**

---

## 2. LIVE CALL DEMO (5 min)

**SHOW:** Call `+1 (645) 218-8532` on speakerphone.

**What Sheena will hear:**
- Dorothy answers: *"Thanks for calling South Florida Surgery and Bariatric Institute. How can I help you today?"*
- She's warm, concise, sounds like a real receptionist
- She handles English AND Spanish fluently
- If asked her name → "I'm Dorothy"
- If asked "are you a real person?" → Deflects naturally

**Test scenarios to show:**
1. **New patient inquiry:** "Hi, I'm interested in weight loss surgery"
   - Dorothy will ask name, callback number, which service, how they heard about you — one at a time
2. **Insurance question:** "Do you take Blue Cross?"
   - Dorothy explains cash-pay practice, reframes it as a benefit
3. **Spanish caller:** "Hola, necesito información sobre cirugía bariátrica"
   - She switches to fluent Spanish immediately

**Agent settings:**
| Setting | Value |
|---|---|
| Voice | Grace (ElevenLabs) — warm, professional female |
| Model | GPT-4o |
| Responsiveness | 1.0 (fastest) |
| Language | English + Spanish |
| Ambient sound | Call center (realistic background) |
| Backchannel | On ("mm-hmm", "right") |

---

## 3. THE DASHBOARD (10 min)

**SHOW:** Open https://sfsbi-dashboard.vercel.app and log in.

### 3a. Dashboard Home (`/dashboard`)
- **Stat cards:** Total calls, high-intent leads, average duration, urgent flags
- **Charts:** Daily call volume (bar), lead quality breakdown (pie)
- **Recent calls list:** Click any to expand and see full details
- **Real-time:** New calls appear automatically — no refresh needed

### 3b. All Calls (`/calls`)
- **Search:** By name, phone, service, or summary text
- **Filters:** Lead score (high/medium/low), urgency, language
- **Export:** Click "Export CSV" to download filtered data
- **Each call shows:** Caller name, phone, service interest, duration, lead score, urgency badge, language, timestamp
- **Expand any call:** Full AI summary, call outcome, sentiment

### 3c. Leads (`/leads`)
- **Three tabs:** High Intent | Medium | Low
- **Lead cards** show name, phone, service interest, and "Call Back" button
- **Only shows calls where intake was collected** (name + phone + service)
- "Sheena, this is your callback list — sorted by quality"

### 3d. Urgent Alerts (`/urgent`)
- **Red alert banner** when urgent calls come in
- **Color-coded:** Red = emergency, Orange = urgent, Yellow = needs attention
- **Details:** What the caller said, why it was flagged
- "If someone calls about chest pain after surgery, this page lights up AND you get an SMS"

### 3e. Analytics (`/analytics`)
- **Date range selector:** Filter by any time period
- **Charts:**
  - Daily call volume trend (line)
  - Lead quality over time (stacked bar)
  - Language breakdown (pie — English vs Spanish)
  - Service interest breakdown (horizontal bar — which services get most calls)
  - Caller sentiment distribution

### 3f. Weekly Report (`/weekly`)
- **Auto-generated summary** of the last 7 days
- Key metrics: total calls, high-intent leads, urgent flags, top services
- **"Email Report" button** sends it to your inbox
- **"Print / Save PDF" button** for records

### 3g. Settings (`/settings`)
- Shows all system IDs and webhook URLs
- Setup checklist
- Quick links to Retell, n8n, Twilio, Supabase

---

## 4. WHAT DOROTHY KNOWS (3 min)

**TELL:** "Dorothy's system prompt has 15 sections covering every scenario:"

| Section | What It Handles |
|---|---|
| Identity | She's Dorothy, receptionist for SFSBI, knows Dr. Valladares and Sheena |
| Speaking Rules | 2-3 sentences max, one question at a time, natural contractions |
| Response Style | Warm, direct, acknowledges caller before responding |
| Insurance | Cash-pay explanation, reframes as benefit, mentions HSA/FSA |
| Task Flow | Greet → Answer → Collect info → Confirm back → Close |
| Urgency Flags | Severe pain, bleeding, infection, breathing issues → flags immediately |
| After Hours | Acknowledges it, still collects info, promises next-day callback |
| Bilingual | Switches to Spanish instantly when detected |
| Data Collection | Name → Phone → Service → How heard → BMI (optional) |
| Lead Scoring | High/Medium/Low based on caller intent signals |
| Call Outcomes | 6 categories: intake, question-only, insurance-disqualified, hang-up, spam, urgent |
| Objections | Price, insurance, not ready — has scripted rebuttals |
| Knowledge Base | Answers from your uploaded service info |
| Ending Calls | Confirms back all info, warm close |
| Safety Rails | Never gives medical advice, never quotes prices, never transfers |

---

## 5. POST-CALL DATA CAPTURE (2 min)

**TELL:** "After every single call, Dorothy automatically extracts 15 data points:"

| Field | Example |
|---|---|
| caller_name | Maria Rodriguez |
| caller_phone | (305) 555-1234 |
| service_interest | gastric_sleeve |
| how_heard_about_us | Google |
| language_used | spanish |
| lead_score | high |
| urgency_flag | routine |
| call_type | new_inquiry |
| after_hours | false |
| is_spam | false |
| wants_human | false |
| bmi_mentioned | 42 |
| intake_collected | true |
| call_outcome | intake_collected |
| call_summary | "Maria called interested in gastric sleeve. BMI 42. Found us on Google. Collected name and callback number." |

"All of this flows into your dashboard automatically."

---

## 6. AUTOMATION WORKFLOWS (3 min)

**SHOW:** Open n8n at https://n8n.srv1546601.hstgr.cloud

### Workflow 1: Post-Call Handler
- **Triggers:** Every time a call ends
- **Does:** Extracts all 15 fields → saves to Supabase → checks urgency → sends SMS to Sheena if urgent
- **SMS alert example:** "🚨 URGENT: John Smith called about post-op pain. Call back: (305) 555-0000"

### Workflow 2: Urgent Escalation
- **Triggers:** When urgency_flag = "urgent" or "emergency"
- **Does:** Immediate SMS to Sheena's phone with caller details

### Workflow 3: Weekly Report
- **Triggers:** Every Monday at 9 AM
- **Does:** Pulls last 7 days of calls → generates summary → emails to Sheena
- **Includes:** Total calls, lead breakdown, top services, high-intent callback list

---

## 7. WHAT'S WORKING RIGHT NOW ✅

| Component | Status |
|---|---|
| Phone number (+1 645-218-8532) | ✅ Live |
| Dorothy answers calls | ✅ Working |
| English + Spanish | ✅ Working |
| Call data extraction (15 fields) | ✅ Working |
| Dashboard on Vercel | ✅ Deployed |
| Supabase database | ✅ 28 calls logged |
| n8n WF1 (post-call handler) | ✅ Active |
| n8n WF2 (urgent escalation) | ✅ Active |
| n8n WF3 (weekly report) | ⏳ Needs Gmail OAuth connect |
| Urgent SMS alerts | ✅ Configured |
| SIP Trunk routing | ✅ Configured |

---

## 8. WHAT SHEENA NEEDS TO DO

1. **Log into the dashboard** — We'll set up her login credentials right now
2. **Connect Gmail for weekly reports** — One-click OAuth in n8n
3. **Review & customize:**
   - Does Dorothy's greeting sound right?
   - Any services to add/remove from the knowledge base?
   - Who else should get urgent SMS alerts?
4. **Forward the office number** — When ready to go live, forward the main office line to +1 (645) 218-8532 during/after hours

---

## 9. LIVE LINKS — EVERYTHING IN ONE PLACE

| What | URL |
|---|---|
| **QC Dashboard** | https://sfsbi-dashboard.vercel.app |
| **Phone Number** | +1 (645) 218-8532 |
| **Retell Agent** | https://app.retellai.com/agents/agent_dfd95700637dad9769ebf4fa24 |
| **n8n Workflows** | https://n8n.srv1546601.hstgr.cloud |
| **Supabase DB** | https://supabase.com/dashboard/project/xoxpslsbnkxcthdmfbwn |
| **Twilio Console** | https://console.twilio.com |
| **GitHub Repo** | https://github.com/hardik25812/Maritime (sfsbi/ folder) |

---

## 10. DEMO ORDER (Recommended Flow)

1. **Start with the call** — Put phone on speaker, call the number, let Sheena hear Dorothy
2. **Show the dashboard** — Open it right after the call, show the call appearing in real-time
3. **Walk through each page** — Dashboard → Calls → Leads → Urgent → Analytics → Weekly
4. **Show the n8n workflows** — Quick visual of the automation
5. **Discuss next steps** — Gmail connect, knowledge base review, go-live plan

> **Key message for Sheena:** "Every call that comes in is automatically answered, qualified, and logged. You just check the dashboard and call back the high-intent leads. No more missed calls, no more voicemail."
