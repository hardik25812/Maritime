# IETI Lead Generation Agent Systems — Architecture

## System Overview

Two autonomous n8n workflow systems that generate leads for IETI by detecting environmental events and matching them to property owners in Martine's service areas.

**Hermes** monitors both systems and reports health via Telegram.

---

## System 1: Flood Radar (WF5)

### Trigger
Schedule node — runs every 15 minutes

### Pipeline

```
Schedule (15 min)
  → NOAA NWS Alerts API (free, no key)
      GET https://api.weather.gov/alerts/active?zone=WIZ063,TNC037
      Filter: event contains "Flood" OR "Flash Flood" OR "Heavy Rain"
  → Dedup Check (Supabase: ieti_flood_events)
      Skip if alert ID already processed
  → NOAA QPE Rainfall Totals (free, no key)
      GET https://mapservices.weather.noaa.gov/raster/rest/services/obs/rfc_qpe/MapServer/identify
      Get actual inches of rain for affected area
  → FEMA NFHL Flood Zone Lookup (free, no key)
      GET https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query
      Identify which parcels are in flood zones (A, AE, AH, AO, V, VE)
  → Property Owner Lookup (ATTOM or Regrid — paid)
      Get owner name, mailing address, phone, email for parcels in affected zones
  → Dedup Leads (Supabase: ieti_leads)
      Skip owners already contacted in last 90 days
  → Generate Personalized Outreach
      SMS via Twilio + Email via Gmail
      Include: owner name, zip, rainfall inches, date, booking link
  → Log to Supabase (ieti_leads) + Google Sheets
  → Hermes notification via n8n webhook
```

### Data Enhancement Layer (Free Satellite/Imagery)

```
After flood alert confirmed:
  → NASA FIRMS API (free, needs Earthdata login)
      Check for fire+flood compound events
  → Copernicus Emergency Management (free)
      GloFAS flood monitoring — river discharge forecasts
  → USGS Water Services API (free, no key)
      GET https://waterservices.usgs.gov/nwis/iv/?sites=XXXXXXXX&parameterCd=00065
      Real-time river gauge levels for nearby monitoring stations
  → NOAA Storm Events Database (free)
      Historical storm severity for the area — adds credibility to outreach
```

### Outreach Templates

**SMS (Twilio):**
```
Hi [Name], [X] inches of rain hit [Zip] on [Date].
Mold starts growing in 24-48 hrs inside wet walls.
IETI has tested homes in your area since 2000.
Book a quick inspection: [AppToto link]
— Indoor Environmental Testing Inc.
```

**Email (Gmail):**
```
Subject: [X]" of rain at your property — mold risk window is 24-48 hours

Dear [Name],

Your neighborhood ([Zip]) received [X] inches of rainfall on [Date].
According to FEMA flood maps, your property is in flood zone [Zone].

Mold begins growing inside wet walls within 24-48 hours — even if
you can't see it. A single inspection can prevent $10,000-$50,000
in remediation costs later.

We've been testing homes in [City] since 2000.

→ Book inspection: [AppToto link]
→ Call us: (XXX) XXX-XXXX

— Martine Davis, Lead Inspector
Indoor Environmental Testing Inc.
```

---

## System 2: New Homebuyer (WF6)

### Trigger
Schedule node — runs daily at 8 AM

### Pipeline

```
Schedule (daily 8 AM)
  → ATTOM Property API — Recent Deed Transfers
      GET /property/v4/transaction/saleshistory
      Filter: last 30 days, Madison WI + Nashville TN
  → Filter Properties
      - Built pre-1978 (asbestos/lead risk) OR
      - Has basement (mold risk) OR
      - Price > $200k (owner has money for inspection)
  → Dedup (Supabase: ieti_leads)
      Skip if already contacted
  → Wait 21 days from closing date
      (gives buyer time to move in and notice issues)
  → Generate Personalized Outreach
      SMS + Email — "Congrats on your new home" angle
  → Log to Supabase + Google Sheets
  → Hermes notification
```

### Outreach Templates

**SMS:**
```
Hi [Name], congrats on your new home at [Address]!
Homes built before 1978 may have hidden mold, asbestos, or lead paint.
IETI offers new-homeowner inspections starting at $XXX.
Book: [AppToto link]
```

**Email:**
```
Subject: Congrats on [Address] — one thing most new homeowners miss

Dear [Name],

Congratulations on your recent purchase at [Address]!

Your home was built in [Year]. Homes from this era commonly have
hidden concerns: mold in basements, asbestos in insulation, or
lead paint under newer layers.

Most buyers discover these after a health issue or a failed resale
inspection. A proactive environmental test now costs a fraction of
what remediation costs later.

→ Book new-homeowner inspection: [AppToto link]

— Martine Davis, Lead Inspector
```

---

## Supabase Schema

### ieti_flood_events
```sql
CREATE TABLE ieti_flood_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT,
  headline TEXT,
  description TEXT,
  affected_zones TEXT[],
  rainfall_inches NUMERIC,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  coordinates JSONB,
  gauge_data JSONB,
  leads_generated INTEGER DEFAULT 0,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ieti_leads
```sql
CREATE TABLE ieti_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'flood_radar' or 'new_homebuyer'
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  year_built INTEGER,
  flood_zone TEXT,
  trigger_event TEXT, -- alert_id or deed_id
  trigger_date TIMESTAMPTZ,
  outreach_channel TEXT, -- 'sms', 'email', 'both'
  outreach_sent_at TIMESTAMPTZ,
  outreach_status TEXT DEFAULT 'pending',
  response_status TEXT DEFAULT 'none', -- 'none','opened','clicked','booked'
  booking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_phone, source, trigger_event)
);
```

---

## Free APIs Used (No Cost)

| API | Purpose | Auth | Rate Limit |
|-----|---------|------|-----------|
| NOAA NWS Alerts | Flood/storm alerts | None (User-Agent header) | Reasonable use |
| NOAA QPE MapServer | Observed rainfall | None | Reasonable use |
| FEMA NFHL ArcGIS | Flood zone by lat/lon | None | Reasonable use |
| USGS Water Services | River gauge levels | None | Reasonable use |
| NASA FIRMS | Fire/hotspot data | Free Earthdata token | 10 req/min |
| Copernicus GloFAS | River discharge forecasts | Free ECMWF key | Generous |

## Paid APIs Required

| API | Purpose | Cost | Note |
|-----|---------|------|------|
| ATTOM Property | Owner lookup + deed transfers | $250/mo (free trial) | Best for both systems |
| Twilio SMS | Outreach delivery | ~$0.0079/SMS | Already have |
| Gmail | Email outreach | Free | Already have |

---

## Hermes Integration

Hermes monitors both WF5 and WF6 via:

1. **Cron health checks** — every 15 min, verify workflows are active and executing
2. **Event-driven alerts** — n8n sends webhook to Hermes on:
   - New flood event detected
   - Leads generated count
   - Outreach sent count
   - Any errors
3. **Daily summary** — 9 AM Telegram report:
   - Active weather alerts in service areas
   - Leads generated (24h)
   - Outreach sent/delivered/failed
   - Conversion tracking (if AppToto webhook configured)

### Hermes Telegram Messages

**Flood detected:**
```
🌊 FLOOD RADAR ALERT
━━━━━━━━━━━━━━━━━━━━
Event: Flash Flood Warning
Zone: Dane County, WI (WIZ063)
Rainfall: 3.2 inches
Time: Apr 14, 2026 2:30 PM

📊 Pipeline Status:
Properties in flood zone: 847
After dedup: 312 new leads
SMS queued: 312
Email queued: 289

⏱ Outreach fires in 2 hours
```

**Daily summary:**
```
📈 IETI Lead Gen — Daily Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apr 14, 2026

🌊 Flood Radar
Active alerts: 0
Leads generated (24h): 312
SMS sent: 312 (delivered: 298)
Email sent: 289 (opened: 67)

🏠 New Homebuyer
Deed transfers found: 23
Qualified leads: 8
Outreach sent: 8

📊 Totals
New leads: 320
Pending follow-up: 45
Booked inspections: 3
```

---

## File Structure

```
ieti-lead-gen/
├── ARCHITECTURE.md          (this file)
├── supabase-schema.sql      (table definitions)
├── templates/
│   ├── flood-sms.txt
│   ├── flood-email.html
│   ├── homebuyer-sms.txt
│   └── homebuyer-email.html
└── README.md
```

n8n workflows:
- WF5: IETI Lead Gen — Flood Radar
- WF6: IETI Lead Gen — New Homebuyer

---

## Prerequisites Before Building

1. ✅ n8n instance running
2. ✅ Twilio account + SMS capability
3. ✅ Gmail credentials in n8n
4. ✅ Supabase project
5. ⬜ ATTOM API key (free trial: https://api.developer.attom.com)
6. ⬜ Twilio 10DLC registration (mandatory for marketing SMS)
7. ⬜ AppToto booking URL for QR/links
8. ⬜ NASA Earthdata token (free: https://urs.earthdata.nasa.gov)
9. ⬜ Confirm service area zip codes (Madison WI + Nashville TN)
