# IETI Automated Lead Generation Agent Systems — Full Build Plan

> **Client**: Indoor Environmental Testing Inc. (IETI) — Martine Davis
> **Service Areas**: Madison, WI + Nashville, TN
> **Current Stack**: n8n (self-hosted), Retell AI, Twilio, Google Sheets, AppToto
> **Date**: April 2026

---

## EXECUTIVE SUMMARY

Two autonomous agent systems that convert weather events and public records into qualified inspection leads. Both systems are fully automatable using your existing n8n instance, supplemented by verified public APIs and affordable third-party services.

**Projected ROI at conservative 2% conversion:**
- Agent System 1 (Flood Radar): 5–15 new leads per qualifying storm event
- Agent System 2 (New Homebuyer): 10–30 new leads per month in Nashville alone

---

## AGENT SYSTEM 1: "FLOOD RADAR" — Storm-Triggered Lead Generation

### How It Works (End-to-End Flow)

```
NOAA Weather API (every 15 min)
    → n8n detects flood/storm alert for Madison WI or Nashville TN
    → NOAA QPE rainfall data confirms significant precipitation (>2 inches)
    → FEMA NFHL ArcGIS service identifies flood-zone parcels in affected area
    → Property data API pulls owner name + mailing address for flood-zone parcels
    → AI (OpenAI/Claude via n8n) generates personalized outreach message
    → Outreach fires within 48 hours:
        - SMS via Twilio (if phone available)
        - Postcard via Lob API (physical mail)
        - Email via SendGrid/Gmail (if email available)
    → QR code on postcard → AppToto booking link
    → Lead logged to Google Sheets + CRM
```

### DATA SOURCE 1: NOAA/NWS Weather Alerts API

**VERIFIED ✅ — Free, No API Key Required**

- **Endpoint**: `https://api.weather.gov/alerts/active`
- **Format**: REST API, returns GeoJSON/JSON-LD
- **Auth**: None required (public API, just needs `User-Agent` header with contact email)
- **Rate Limit**: No hard limit published; recommended polling every 5–15 minutes
- **Documentation**: https://www.weather.gov/documentation/services-web-api

**Key Query Parameters:**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `zone` | NWS forecast zone code | `WIZ063` (Dane County WI), `TNC037` (Davidson County TN) |
| `area` | State abbreviation | `WI`, `TN` |
| `event` | Alert type filter | `Flood Watch`, `Flood Warning`, `Flash Flood Warning` |
| `status` | Alert status | `actual` |
| `severity` | Severity filter | `Severe`, `Extreme` |

**Exact Endpoints for IETI Service Areas:**
```
# Madison WI (Dane County) - Zone WIZ063
https://api.weather.gov/alerts/active?zone=WIZ063&event=Flood%20Watch,Flood%20Warning,Flash%20Flood%20Warning

# Nashville TN (Davidson County) - Zone TNC037
https://api.weather.gov/alerts/active?zone=TNC037&event=Flood%20Watch,Flood%20Warning,Flash%20Flood%20Warning
```

**Alert Response Contains:**
- `event`: Type (Flood Watch, Flood Warning, Flash Flood Warning)
- `severity`: Severity level
- `areaDesc`: Human-readable area description
- `description`: Full alert text (often includes rainfall amounts)
- `onset` / `expires`: Time window
- `geocode.SAME`: FIPS county codes for affected areas

**NWS Zone Codes for IETI:**
| Area | Zone Code | FIPS Code |
|------|-----------|-----------|
| Dane County, WI (Madison) | `WIZ063` | `055025` |
| Davidson County, TN (Nashville) | `TNC037` | `047037` |

### DATA SOURCE 2: NOAA Quantitative Precipitation Estimation (QPE)

**VERIFIED ✅ — Free, No API Key Required**

- **Service**: NOAA RFC QPE ArcGIS MapServer
- **Endpoint**: `https://mapservices.weather.noaa.gov/raster/rest/services/obs/rfc_qpe/MapServer`
- **Format**: ArcGIS REST service (query by geometry/coordinates, returns observed rainfall)
- **Layers**: Includes 1-hour, 6-hour, 24-hour, 48-hour, and 72-hour observed precipitation
- **Usage**: Query for observed rainfall totals at specific coordinates after an alert triggers
- **No API key needed** — this is a public NOAA GIS service

**Example Query (24-hour rainfall at a point):**
```
https://mapservices.weather.noaa.gov/raster/rest/services/obs/rfc_qpe/MapServer/identify
?geometry=-89.4012,43.0731  (Madison WI coordinates)
&geometryType=esriGeometryPoint
&tolerance=1
&mapExtent=-90,42,-88,44
&imageDisplay=400,300,96
&returnGeometry=false
&f=json
```

### DATA SOURCE 3: FEMA National Flood Hazard Layer (NFHL)

**Two Options — One Free, One Paid:**

#### Option A: FEMA NFHL ArcGIS REST Service (FREE ✅)
- **Endpoint**: `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer`
- **Layer 28**: `S_Fld_Haz_Ar` (Flood Hazard Areas) — the main flood zone layer
- **Auth**: None required
- **Query**: By geometry (point, polygon, envelope) — returns flood zone designation
- **Key field**: `FLD_ZONE` (A, AE, AH, AO, V, VE = high-risk flood zones; X = minimal risk)

**Example Query (Flood zone for a specific lat/lon):**
```
https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query
?where=1%3D1
&geometry=-86.7816,36.1627  (Nashville coordinates)
&geometryType=esriGeometryPoint
&spatialRel=esriSpatialRelIntersects
&outFields=FLD_ZONE,ZONE_SUBTY,SFHA_TF
&returnGeometry=false
&f=json
```

**Limitation**: Returns flood zone for a point, but does NOT return owner/address data. Need to cross-reference with parcel data.

#### Option B: National Flood Data API (PAID — Has Parcel Data)
- **Endpoint**: `https://api.nationalflooddata.com/data/v3/flood`
- **Auth**: API key required (register at nationalflooddata.com)
- **Pricing**: Contact for pricing — enterprise-oriented
- **Advantage**: Returns flood zone + parcel data + property info in one query
- **Key params**: `searchtype=addressparcel` or `searchtype=coord` with lat/lon

**⚠️ RECOMMENDATION**: Use the FREE FEMA ArcGIS service for flood zone lookup, then cross-reference with a property data API for owner information.

### DATA SOURCE 4: Property Owner / Parcel Data

**This is the hardest piece — multiple options with different trade-offs:**

#### Option A: County-Level Public Records (FREE but Manual/Limited)

**Dane County, WI (Madison):**
- **Access Dane**: https://accessdane.danecounty.gov/Parcel
- **Dane County Open Data**: https://gis-countyofdane.opendata.arcgis.com/
- **GIS data available** for download (parcels with some owner info)
- **Limitation**: No direct REST API for bulk owner lookup; requires GIS file processing
- **GIS Parcel Download**: Available as shapefiles — can be loaded into PostGIS or processed by n8n Code node

**Davidson County, TN (Nashville):**
- **Nashville Property Assessor**: https://www.padctn.org/real-property-search/
- **Register of Deeds**: Online subscription $50/month at https://www.nashville.gov/departments/register-deeds/internet-services
- **Limitation**: Web-based search only, no public REST API. Subscription provides name/date search for deeds.

#### Option B: Regrid Parcel API (PAID — Best for Automation) ⭐ RECOMMENDED
- **Endpoint**: `https://app.regrid.com/api/v2/parcels`
- **Coverage**: 158+ million U.S. parcels, nationwide
- **Data includes**: Owner name, mailing address, property address, year built, land use, acreage
- **Auth**: API key via subscription
- **Pricing**: Self-serve API plans available at https://app.regrid.com/api/plans
  - Starter plans begin around **$100–250/month** for API access
  - Includes parcel boundary, owner, and property attribute data
- **Query by**: Address, lat/lon, boundary polygon, or FIPS code
- **Why ideal**: Query by geographic area (polygon/envelope) to get all parcels in a flood zone

#### Option C: ATTOM Data API (PAID — Premium with Deed/Sale History)
- **Endpoint**: `https://api.gateway.attomdata.com/propertyapi/v1.0.0/`
- **Coverage**: 158+ million U.S. properties
- **Data includes**: Owner, address, year built, deed history, recent sales, assessed value
- **Auth**: API key (free trial available at https://api.developer.attomdata.com)
- **Pricing**: Starts ~$250/month for developer tier; enterprise pricing for bulk
- **Free Trial**: Available — create account to test endpoints
- **Why useful**: Has `sale/snapshot` endpoint for recent deed transfers (Agent System 2)

#### Option D: County GIS + OpenStreetMap Hybrid (FREE but Complex)
- Download county parcel shapefiles (Dane County and Davidson County both offer these)
- Load into a PostGIS database
- Spatial query: "all parcels that intersect FEMA flood zone polygons"
- Owner data may be partial (depends on what county publishes)
- **Advantage**: Zero ongoing API cost
- **Disadvantage**: Requires PostGIS setup, periodic data refresh, owner data may be incomplete

### OUTREACH CHANNELS

#### SMS via Twilio (ALREADY HAVE ✅)
- **Account**: `AC90045bfc00a44cc8de3bebaf7892786f`
- **Phone**: `+17407373726`
- **Cost**: ~$0.0079/SMS segment
- **Limitation**: Need phone numbers from property data — not always available from assessor records
- **Compliance**: Must include opt-out language ("Reply STOP to unsubscribe")
- **⚠️ IMPORTANT**: Twilio requires A2P 10DLC registration for business SMS. You likely need a Campaign registered for marketing messages. Check: https://www.twilio.com/docs/messaging/guides/10dlc

#### Physical Postcard via Lob API ⭐ HIGHEST IMPACT
- **Endpoint**: `https://api.lob.com/v1/postcards`
- **Auth**: API key (Basic Auth with API key as username)
- **Pricing**:
  - Developer plan: **FREE** — up to 500 mailings
  - Startup: **$260/month** — up to 3,000 mailings
  - Per postcard: **$0.58–$0.87** depending on plan (includes print + postage)
- **Features**: 
  - HTML template → printed postcard
  - Address verification built-in (CASS certified)
  - QR code generation (include in HTML template)
  - Tracking webhooks (delivered, returned, etc.)
  - 3–5 business day delivery
- **Documentation**: https://docs.lob.com/

**Example Lob API Call:**
```json
POST https://api.lob.com/v1/postcards
{
  "description": "IETI Flood Alert Postcard",
  "to": {
    "name": "John Smith",
    "address_line1": "123 Main St",
    "address_city": "Nashville",
    "address_state": "TN",
    "address_zip": "37201"
  },
  "from": {
    "name": "Indoor Environmental Testing Inc.",
    "address_line1": "[IETI Address]",
    "address_city": "Madison",
    "address_state": "WI",
    "address_zip": "[ZIP]"
  },
  "front": "<html>...postcard front with QR code...</html>",
  "back": "<html>...personalized message...</html>",
  "size": "6x9"
}
```

#### Alternative: PostGrid (Cheaper per piece)
- Similar API to Lob
- Postcards start at ~$0.42/piece
- Less documentation/community support than Lob

#### Email via SendGrid or Gmail (ALREADY PARTIALLY HAVE)
- Gmail already in stack for WF4
- For bulk: SendGrid free tier = 100 emails/day
- **Limitation**: Email addresses not commonly in assessor/parcel data

#### Scheduling via AppToto
- **Webhooks supported**: Yes — Apptoto can fire webhooks on booking events
- **Integration**: Generate a booking link (AppToto online scheduling URL) → embed in QR code on postcard
- **Webhook events**: `appointment.booked`, `appointment.cancelled`, `appointment.confirmed`
- **Can connect to n8n**: Set webhook URL to n8n endpoint for lead tracking

---

## AGENT SYSTEM 2: "NEW HOMEBUYER" Outreach — Nashville Growth Engine

### How It Works (End-to-End Flow)

```
Property Data API (daily scheduled pull)
    → Query recent deed transfers in Nashville/Davidson County
    → Filter: homes built pre-1978 (asbestos/lead risk), homes with basements/crawlspaces
    → AI generates personalized direct mail piece
    → Wait 2–3 weeks post-closing date
    → Send personalized postcard via Lob API
    → QR code → AppToto booking link
    → Lead logged to Google Sheets
```

### DATA SOURCE: Recent Home Sales / Deed Transfers

**Option A: ATTOM Data API ⭐ RECOMMENDED for Agent System 2**
- **Endpoint**: `GET /property/v4/deed/snapshot`
- **Query by**: FIPS code (Davidson County = `47037`), date range
- **Returns**: Buyer name, property address, sale date, sale price, deed type
- **Combine with**: `GET /property/v4/detail` for year built, building type, basement info
- **Free trial available**: https://api.developer.attomdata.com
- **Pricing**: Developer tier ~$250/month

**Option B: Davidson County Register of Deeds Subscription**
- **Cost**: $50/month (single user)
- **Access**: Online search for recorded deeds since Jan 1, 2000
- **Includes**: Name, date, document type
- **Limitation**: No API — requires screen scraping or manual export
- **URL**: https://www.nashville.gov/departments/register-deeds/internet-services

**Option C: Regrid with Daily Ownership Updates Add-On**
- Regrid offers a "Daily Ownership Updates" add-on
- Can detect ownership changes (= new sales) automatically
- Combined with parcel data (year built, land use)
- Pricing: Add-on to base Regrid API subscription

### FILTERING CRITERIA

| Filter | Source | Logic |
|--------|--------|-------|
| Recent sale (last 7 days) | ATTOM deed/snapshot | `saleDate >= NOW - 7 days` |
| Built pre-1978 | ATTOM property/detail | `yearBuilt < 1978` |
| Has basement/crawlspace | ATTOM property/detail | `basementType != 'None'` |
| Residential | ATTOM property/detail | `propertyType = 'SFR' OR 'Condo'` |
| Nashville area | ATTOM | `fips = 47037` (Davidson County) |

### TIMING
- Pull daily, but **hold mailings 2–3 weeks** after closing date
- n8n Wait node (already proven in WF4) handles the delay
- This targets the "settling in and noticing things" window

---

## SYSTEM ARCHITECTURE

### Recommended Stack

| Component | Tool | Role |
|-----------|------|------|
| **Orchestration** | n8n (self-hosted, existing) | All workflow automation, scheduling, API calls |
| **AI Brain** | OpenClaw OR n8n AI Agent nodes | Message personalization, data enrichment reasoning |
| **Weather Data** | NOAA/NWS API (free) | Storm/flood alert monitoring |
| **Rainfall Data** | NOAA QPE MapServer (free) | Quantitative precipitation verification |
| **Flood Zones** | FEMA NFHL ArcGIS (free) | Identify high-risk parcels |
| **Property Data** | Regrid API OR ATTOM API (paid) | Owner name, address, year built |
| **SMS** | Twilio (existing) | Text message outreach |
| **Physical Mail** | Lob API (new) | Automated postcards |
| **Email** | SendGrid or Gmail (existing) | Email outreach |
| **Scheduling** | AppToto (existing) | Booking link in QR codes |
| **Logging** | Google Sheets (existing) | Lead tracking |
| **AI Personalization** | OpenAI GPT-4o / Claude via n8n | Generate personalized copy |

### n8n vs OpenClaw — Where Each Fits

Based on verified research:

**n8n handles (deterministic, reliable execution):**
- Scheduled API polling (weather alerts every 15 min)
- Data pipeline: weather → flood zone → property lookup → outreach
- SMS/email/postcard API calls
- Wait nodes for timing delays
- Google Sheets logging
- Error handling and retry logic

**OpenClaw handles (adaptive intelligence):**
- Complex message personalization beyond templates
- Analyzing property data to identify highest-priority leads
- Adapting outreach copy based on specific storm details
- Monitoring and adjusting campaign performance
- Could serve as a "campaign manager" agent that decides when/how to outreach

**Hybrid Pattern (RECOMMENDED):**
```
OpenClaw (brain) → decides what campaigns to run
    ↓ triggers via webhook
n8n (execution) → reliable API calls, scheduling, outreach delivery
    ↓ results webhook
OpenClaw → analyzes results, adjusts strategy
```

However, **n8n alone can handle 90% of this** with Code nodes + AI Agent nodes for the LLM personalization parts. OpenClaw adds value mainly for adaptive campaign management, which can be added later.

---

## WORKFLOW DESIGNS

### WF5: Flood Radar — Weather Monitor (n8n)
```
Schedule Trigger (every 15 min)
    → HTTP Request: NOAA alerts for WIZ063 (Madison)
    → HTTP Request: NOAA alerts for TNC037 (Nashville)
    → Code: Filter for flood/storm alerts not already processed
    → IF: New qualifying alert found?
        → YES: 
            → HTTP Request: NOAA QPE for rainfall totals
            → Code: Determine affected zip codes from alert geometry
            → HTTP Request: FEMA NFHL query for flood zone parcels
            → HTTP Request: Regrid/ATTOM query for property owners in area
            → AI Agent: Generate personalized message per property
            → Split/Batch: Process each lead
                → Lob API: Send postcard
                → Twilio: Send SMS (if phone available)
                → Google Sheets: Log lead
            → Twilio SMS to Martine: "Flood Radar triggered — X postcards sent for [area]"
        → NO: End (no action)
```

### WF6: New Homebuyer — Daily Deed Monitor (n8n)
```
Schedule Trigger (daily at 7 AM CT)
    → HTTP Request: ATTOM deed/snapshot for Davidson County (last 7 days)
    → Code: Filter for residential, pre-1978, has basement
    → Code: Calculate send date (closing + 21 days)
    → Split/Batch: Process each qualifying property
        → Wait Node: Until calculated send date
        → HTTP Request: ATTOM property/detail for enrichment
        → AI Agent: Generate personalized postcard copy
        → Lob API: Send postcard
        → Google Sheets: Log lead
    → Twilio SMS to Martine: "New Homebuyer — X postcards queued for Nashville"
```

---

## PREREQUISITES & SETUP CHECKLIST

### Accounts to Create (New)

| Service | Purpose | Cost | Action |
|---------|---------|------|--------|
| **Lob** | Postcard API | Free dev plan (500/mo), $260/mo startup | Register at https://dashboard.lob.com/register |
| **Regrid** OR **ATTOM** | Property data | ~$100–250/mo | Register at https://app.regrid.com/api/plans OR https://api.developer.attomdata.com |
| **ATTOM** (if using for Agent 2) | Deed records | ~$250/mo (free trial first) | Register at https://api.developer.attomdata.com |
| **SendGrid** (optional) | Bulk email | Free (100/day) | Register at https://sendgrid.com |

### Accounts Already Have ✅
| Service | Status |
|---------|--------|
| n8n (self-hosted) | ✅ Active at n8n.srv1546601.hstgr.cloud |
| Twilio | ✅ Active, SID: AC90045bfc00a44cc8de3bebaf7892786f |
| Google Sheets OAuth2 | ✅ Active, credential ID: YbVRsytaJN1Cuoox |
| Retell AI | ✅ Active |
| AppToto | ✅ Active (assumed — mentioned in client stack) |
| OpenAI/Claude API | ⚠️ Need to confirm — required for AI personalization nodes |

### Free APIs (No Account Needed)
| Service | Purpose |
|---------|---------|
| NOAA/NWS Weather API | Flood/storm alerts — just needs User-Agent header |
| NOAA QPE MapServer | Rainfall data — public ArcGIS service |
| FEMA NFHL ArcGIS | Flood zone lookup — public service |

### Twilio A2P 10DLC Registration ⚠️ CRITICAL
- **Required for**: Sending marketing SMS to property owners
- **What it is**: All US business SMS must be registered under A2P 10DLC regulations
- **Cost**: ~$15 one-time brand registration + $0.75–$15/campaign registration
- **Timeline**: Approval can take 1–5 business days
- **Action**: Register a Campaign in Twilio Console → Messaging → Trust Hub
- **Message type**: Marketing/Promotional
- **Without this**: Messages may be filtered/blocked by carriers

### Design Assets Needed
| Asset | Purpose | Spec |
|-------|---------|------|
| Postcard front template (HTML) | Lob postcard front | 6x9 or 4x6 postcard, IETI branding |
| Postcard back template (HTML) | Lob postcard back | Personalized message area + QR code |
| QR code destination URL | AppToto booking | IETI scheduling page URL |
| IETI logo (high-res) | Postcard branding | PNG/SVG, 300 DPI |

---

## COST ESTIMATES (Monthly)

### Minimum Viable Setup
| Item | Cost/Month | Notes |
|------|------------|-------|
| Regrid API (starter) | ~$150 | Property owner lookups |
| Lob Developer Plan | $0 | Up to 500 postcards free |
| Lob postcard cost | ~$44–87 | 50–100 postcards × $0.87 |
| Twilio SMS | ~$5–15 | ~200–500 SMS × $0.0079 + segments |
| Twilio 10DLC | ~$2 | Amortized monthly |
| n8n hosting | $0 | Already self-hosted |
| NOAA/FEMA APIs | $0 | Free public APIs |
| **TOTAL (minimum)** | **~$200–255/month** | |

### Full Setup (Both Agent Systems)
| Item | Cost/Month | Notes |
|------|------------|-------|
| ATTOM API (developer) | ~$250 | Deed records + property data |
| Lob Startup Plan | $260 | Up to 3,000 postcards |
| Lob postcard cost | ~$174–348 | 300–600 postcards × $0.58 |
| Twilio SMS | ~$15–40 | ~500–1500 SMS |
| SendGrid | $0 | Free tier (100/day) |
| OpenAI API (GPT-4o) | ~$10–30 | Message personalization |
| n8n hosting | $0 | Already self-hosted |
| NOAA/FEMA APIs | $0 | Free |
| **TOTAL (full)** | **~$710–930/month** | |

### ROI Projection
- Average inspection booking: **$600–700**
- Postcards sent per storm event: **50–200** (Flood Radar)
- Postcards sent per month: **100–300** (New Homebuyer)
- Conservative conversion: **2%**
- Expected new bookings: **3–10/month**
- Expected new revenue: **$1,800–$7,000/month**
- **Net ROI: 3–10x monthly cost**

---

## PHASED DEPLOYMENT PLAN

### Phase 1: Foundation (Week 1–2)
1. ✅ Confirm AppToto booking URL for QR codes
2. Register for Lob developer account (free)
3. Register for ATTOM free trial
4. Register Twilio 10DLC campaign for marketing SMS
5. Confirm OpenAI API key availability in n8n
6. Design postcard HTML templates (front + back)
7. Set up new Google Sheets tabs for lead tracking

### Phase 2: Flood Radar MVP (Week 2–3)
1. Build WF5 in n8n: NOAA weather polling (every 15 min)
2. Add FEMA flood zone lookup logic
3. Integrate Regrid/ATTOM for property owner data
4. Build Lob postcard integration
5. Add AI Agent node for message personalization
6. Test with historical storm data
7. Deploy — activate schedule trigger

### Phase 3: New Homebuyer MVP (Week 3–4)
1. Build WF6 in n8n: Daily ATTOM deed pull
2. Add filtering logic (pre-1978, basement, residential)
3. Build Wait node timing (closing + 21 days)
4. Integrate Lob postcard sending
5. Test with sample Nashville deed data
6. Deploy — activate daily schedule

### Phase 4: Optimization (Week 4+)
1. Add OpenClaw as campaign manager (optional)
2. A/B test postcard copy variants
3. Track conversion rates (booking from QR code scans)
4. Add email channel for leads where email is available
5. Expand to surrounding counties
6. Add Dane County WI to New Homebuyer system

---

## TECHNICAL DECISION: n8n ALONE vs n8n + OpenClaw

### n8n Alone (RECOMMENDED TO START)
- **Pros**: Already deployed, proven reliability, all integrations available via HTTP Request nodes, AI Agent nodes handle LLM personalization
- **Cons**: Less adaptive — templates and logic are fixed unless manually updated

### n8n + OpenClaw Hybrid (PHASE 4 UPGRADE)
- **Pros**: OpenClaw can reason about campaign strategy, adapt copy based on results, proactively suggest new target areas
- **Cons**: Additional setup, LLM token costs ($15–80/month), prompt injection risk needs sandboxing
- **Best pattern**: OpenClaw as "campaign brain" → triggers n8n workflows via webhook → n8n handles all API calls reliably

### Hermes Integration
- Hermes monitoring system (already in your repo) can monitor all agent system workflows
- Alert on failures, track execution counts, measure campaign performance
- Integrates naturally with existing n8n health monitoring setup

---

## LEGAL & COMPLIANCE CONSIDERATIONS

### SMS (Twilio)
- **A2P 10DLC registration**: MANDATORY for marketing SMS
- **Opt-out**: Every message MUST include "Reply STOP to unsubscribe"
- **TCPA**: Cannot text numbers on Do Not Call list without prior consent
- **⚠️ RECOMMENDATION**: Use SMS only for warm leads who called in (via Retell), use postcards for cold outreach

### Direct Mail (Lob)
- **CAN-SPAM does NOT apply** to physical mail
- **No opt-in required** for postal mail — this is a major advantage
- **USPS regulations**: Lob handles compliance (CASS certification, address verification)
- **Best channel for cold outreach** — no legal risk like SMS/email

### Property Data
- All property records used are **public records** (assessor, deed, GIS)
- No privacy violation in accessing and using public record data for marketing
- Standard practice in real estate, insurance, and home services industries

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Property API costs higher than estimated | Medium | Medium | Start with ATTOM free trial; use county GIS data as fallback |
| Low conversion rate (<1%) | Medium | Medium | A/B test copy; focus on highest-intent signals (active flood) |
| Twilio 10DLC rejection | Low | High | Apply early; use postcards as primary channel |
| NOAA API downtime | Low | Low | Add retry logic; cache recent alerts |
| Postcard delivery delays | Low | Low | Accept 3–5 day window; storm urgency still valid |
| Over-mailing same addresses | Medium | Medium | Dedup database in Google Sheets; 90-day cooldown per address |

---

## NEXT STEPS (Action Items for You)

1. **DECIDE**: Regrid vs ATTOM for property data (recommend ATTOM free trial first)
2. **REGISTER**: Lob account at https://dashboard.lob.com/register
3. **REGISTER**: ATTOM free trial at https://api.developer.attomdata.com
4. **REGISTER**: Twilio 10DLC campaign (or decide postcards-only for cold outreach)
5. **CONFIRM**: AppToto booking URL to use in QR codes
6. **CONFIRM**: OpenAI API key available in n8n credentials
7. **PROVIDE**: IETI logo + brand colors for postcard design
8. **APPROVE**: Postcard copy/messaging for Martine's review

Once these prerequisites are confirmed, I can begin building WF5 and WF6 in n8n immediately.
