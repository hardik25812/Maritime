# Art Needlepoint — Master Setup & Testing Guide

**Client:** Doreen — artneedlepoint.com  
**Rep:** Ben Lemma — reputationheal.com  
**n8n Instance:** https://n8n.srv1546601.hstgr.cloud  
**Last Audited:** Apr 21, 2026

---

## 1. SYSTEM STATUS AT A GLANCE

| Component | Status | Blocking Issue |
|---|---|---|
| WF1A — Backlog Review Converter | ❌ Inactive, 0/4 credentials set | Missing: OpenAI, Google Sheets, SMTP |
| WF1B — Send Approved Emails | ❌ Inactive, 0/3 credentials set | Missing: Google Sheets, SMTP |
| WF2 — Live Sentiment Router | ❌ Inactive, 0/5 credentials set | Missing: OpenAI, Google Sheets, SMTP |
| WF3 — Cart Abandonment Recovery | ❌ Inactive, 0/8 credentials set | Missing: WooCommerce, Google Sheets, SMTP |
| Google Sheet | ❌ Not created yet | Need Sheet ID + 4 tabs |
| Hermes Dashboard | ✅ Built (mock data) | Needs live data connection |
| Client Presentation | ✅ Complete | `art_needlepoint_presentation.html` |

**Bottom line: All 4 workflows are built and validated structurally, but NONE can run because zero credentials are configured and the Google Sheet doesn't exist yet.**

---

## 2. CREDENTIALS NEEDED (Create These in n8n First)

You currently have 3 credentials in n8n, none of which are for Art Needlepoint:
- `Google Sheets account` (ID: YbVRsytaJN1Cuoox) — used by IETI/SFSBI, could potentially reuse
- `Supabase - IETI` — not needed
- `Twilio - IETI` — not needed

### Credentials to Create

| # | Credential | n8n Type | Used By | How to Get It |
|---|---|---|---|---|
| 1 | **OpenAI API** | `openAiApi` | WF1A, WF2 | https://platform.openai.com/api-keys → Create key |
| 2 | **Google Sheets OAuth2** | `googleSheetsOAuth2Api` | WF1A, WF1B, WF2, WF3 | Can reuse existing `YbVRsytaJN1Cuoox` if same Google account has access to AN sheet |
| 3 | **SMTP** | `smtp` | WF1A, WF1B, WF2, WF3 | Host, port, username, password for sending email (e.g., ai@reputationheal.com) |
| 4 | **WooCommerce API** | `wooCommerceApi` | WF3 only | From WooCommerce → Settings → REST API → Add Key (Consumer Key + Secret) |

### How to set credentials on workflows:
1. Open each workflow in n8n editor
2. Click each node that shows a ⚠️ credential warning
3. Select the credential from the dropdown (or create new)
4. Save the workflow

---

## 3. PLACEHOLDERS TO REPLACE (In Workflow Node Parameters)

These are literal strings inside the workflow nodes that must be find-and-replaced:

| Placeholder | Replace With | Where It Appears |
|---|---|---|
| `REPLACE_WITH_GOOGLE_SHEET_ID` | The Google Sheet ID (from the sheet URL) | WF1A (×3), WF1B (×2), WF2 (×4), WF3 (×1) = **10 total** |
| `REPLACE_WITH_DOREEN_EMAIL` | Doreen's actual email address | WF1A (×1), WF2 (×1) = **2 total** |
| `REPLACE_WITH_FROM_EMAIL` | Sender address (e.g., `ai@reputationheal.com`) | WF1B (×1), WF3 (×4) = **5 total** |
| `REPLACE_WITH_WOOCOMMERCE_DOMAIN` | `artneedlepoint.com` (or WC subdomain) | WF3 (×3) = **3 total** |

**Tip:** Use n8n's search-in-workflow feature or open each node and Ctrl+F for `REPLACE_WITH`.

---

## 4. GOOGLE SHEET SETUP

### Step 1: Create a new Google Sheet
- Name it: `Art Needlepoint — Hermes Operations`
- Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{THIS_IS_THE_ID}/edit`
- Make sure the Google account used in n8n OAuth has Editor access

### Step 2: Create these 4 tabs with exact column headers in Row 1

**Tab: `Backlog`**
| A | B | C | D | E |
|---|---|---|---|---|
| customer_name | customer_email | product_name | testimonial_text | approval_status |

- **Written by:** WF2 (when sentiment ≥ 8, sets approval_status = `pending`)
- **Read by:** WF1A (reads rows where approval_status = `pending`)

**Tab: `Approval Queue`**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| customer_name | customer_email | product_name | testimonial_text | email_subject | email_body | approval_status | generated_at |

- **Written by:** WF1A (GPT-4o generates email, sets approval_status = `AWAITING_DOREEN`)
- **Read by:** WF1B (sends rows where approval_status = `APPROVED`)
- **Doreen edits:** Changes approval_status to `APPROVED` or `REJECTED`

**Tab: `Sentiment Log`**
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| received_at | customer_name | customer_email | product_name | score | sentiment | issue_type | outcome | reasoning |

- **Written by:** WF2 (logs every email scored, regardless of sentiment)
- **Read by:** Dashboard (analytics)

**Tab: `Cart Abandonment`**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| abandoned_at | customer_name | customer_email | items | cart_total | item_count | outcome | completed_at |

- **Written by:** WF3 (logs final outcome of each cart recovery sequence)
- **Read by:** Dashboard (analytics)

---

## 5. WORKFLOW-BY-WORKFLOW TESTING GUIDE

---

### WF2: Live Sentiment Router — TEST FIRST
**n8n ID:** `TVPkvfpVSy1DQbRS` | **Trigger:** Webhook (POST)  
**Why test first:** It feeds data into the Backlog sheet that WF1A reads.

#### Prerequisites
- [ ] OpenAI API credential set on "Score Sentiment" node
- [ ] Google Sheets OAuth2 set on "Add to Review Backlog", "Log Happy to Sheet", "Log Unhappy to Sheet"
- [ ] SMTP set on "Alert Doreen - Unhappy Customer"
- [ ] All `REPLACE_WITH_GOOGLE_SHEET_ID` replaced (×4)
- [ ] `REPLACE_WITH_DOREEN_EMAIL` replaced (×1)
- [ ] Google Sheet exists with `Backlog` and `Sentiment Log` tabs

#### Test Procedure

**Test A — Happy Customer (should route to review pipeline)**
1. Activate the workflow (or use "Test workflow" with pin data)
2. Send POST to the webhook URL with:
```json
{
  "from": "margaret.jones@email.com",
  "subject": "Love my kit!",
  "body": "Hi! I just wanted to say the Tropical Parrot Canvas is absolutely stunning. The colors are even more vibrant than the photo. Thank you so much!",
  "customer_name": "Margaret Jones",
  "product_name": "Tropical Parrot Canvas"
}
```
3. **Expected result:**
   - GPT-4o scores sentiment ≥ 8
   - Row added to `Backlog` tab: Margaret Jones, pending status
   - Row added to `Sentiment Log` tab: score, sentiment=positive, outcome=review_queue
   - NO email to Doreen (happy path doesn't alert her)

**Test B — Unhappy Customer (should alert Doreen)**
```json
{
  "from": "john.smith@email.com",
  "subject": "Missing thread colors",
  "body": "I received my order but several thread colors are missing from the kit. This is really disappointing. I need this resolved.",
  "customer_name": "John Smith",
  "product_name": "Christmas Stocking Kit"
}
```
4. **Expected result:**
   - GPT-4o scores sentiment < 8
   - Row added to `Sentiment Log` tab: score, sentiment=negative, outcome=doreen_alert
   - Email sent to Doreen with full context
   - NOT added to Backlog (unhappy customers never get review ask)

#### Output Data Produced
| Field | Where It Goes | Used By |
|---|---|---|
| Backlog row (happy) | Google Sheet → Backlog tab | WF1A reads this |
| Sentiment Log row | Google Sheet → Sentiment Log tab | Dashboard analytics |
| Doreen alert email | Doreen's inbox | Human review |

---

### WF1A: Backlog Review Converter — TEST SECOND
**n8n ID:** `nfmXFaTvWLUacMwc` | **Trigger:** Manual  
**Why test second:** It reads from the Backlog sheet (populated by WF2).

#### Prerequisites
- [ ] OpenAI API credential set on "Generate Personalized Email"
- [ ] Google Sheets OAuth2 set on "Read Customer Backlog", "Write Draft to Approval Sheet"
- [ ] SMTP set on "Notify Doreen - Drafts Ready"
- [ ] All `REPLACE_WITH_GOOGLE_SHEET_ID` replaced (×3)
- [ ] `REPLACE_WITH_DOREEN_EMAIL` replaced (×1)
- [ ] `Backlog` tab has at least 1 row with approval_status = `pending` (from WF2 test or manual entry)
- [ ] `Approval Queue` tab exists with headers

#### Test Procedure
1. Ensure Backlog tab has a test row:
   | customer_name | customer_email | product_name | testimonial_text | approval_status |
   |---|---|---|---|---|
   | Margaret Jones | margaret.jones@email.com | Tropical Parrot Canvas | The colors are even more vibrant than the photo | pending |

2. Click "Execute Workflow" in n8n (manual trigger)

3. **Expected result:**
   - Reads Margaret's row from Backlog
   - GPT-4o generates personalized email using her words ("vibrant colors", "Tropical Parrot Canvas")
   - New row in `Approval Queue`: email_subject, email_body, approval_status = `AWAITING_DOREEN`
   - Email to Doreen: "You have new review drafts to review"

4. **Verify the email draft quality:**
   - Does it use Margaret's own words?
   - Is the tone warm, personal, artisan (not corporate)?
   - Does it include a Google review link?
   - Would Doreen approve this?

#### Output Data Produced
| Field | Where It Goes | Used By |
|---|---|---|
| Approval Queue row | Google Sheet → Approval Queue tab | WF1B reads this after Doreen approves |
| Notification email | Doreen's inbox | Tells her to go review drafts |

---

### WF1B: Send Approved Emails — TEST THIRD
**n8n ID:** `HuszM9AZ49V0RIXd` | **Trigger:** Manual  
**Why test third:** Depends on Doreen approving drafts from WF1A.

#### Prerequisites
- [ ] Google Sheets OAuth2 set on "Read Approval Queue", "Mark as SENT in Sheet"
- [ ] SMTP set on "Send Review Request Email"
- [ ] `REPLACE_WITH_GOOGLE_SHEET_ID` replaced (×2)
- [ ] `REPLACE_WITH_FROM_EMAIL` replaced (×1)
- [ ] Approval Queue has at least 1 row with approval_status = `APPROVED`

#### Test Procedure
1. Go to Approval Queue tab, change a row's approval_status from `AWAITING_DOREEN` to `APPROVED`
2. Click "Execute Workflow" in n8n

3. **Expected result:**
   - Reads APPROVED rows from Approval Queue
   - Sends the email to the customer (use a test email you control!)
   - Updates row: approval_status = `SENT - 2026-04-21`

4. **⚠️ SAFETY: For testing, change the customer_email in the test row to YOUR email so you receive it, not a real customer.**

#### Output Data Produced
| Field | Where It Goes | Used By |
|---|---|---|
| Sent email | Customer's inbox | They click Google review link |
| Updated row (SENT status) | Google Sheet → Approval Queue tab | Audit trail |

---

### WF3: Cart Abandonment Recovery — TEST LAST
**n8n ID:** `ifY4WDfJjWZiHr6t` | **Trigger:** Webhook (POST)  
**Why test last:** Independent workflow, needs WooCommerce API access.

#### Prerequisites
- [ ] WooCommerce API credential set on "Check if Order Completed", "Check Order Again", "Check Order Final"
- [ ] Google Sheets OAuth2 set on "Log Abandonment Outcome"
- [ ] SMTP set on all 4 email nodes
- [ ] `REPLACE_WITH_WOOCOMMERCE_DOMAIN` replaced (×3)
- [ ] `REPLACE_WITH_FROM_EMAIL` replaced (×4)
- [ ] `REPLACE_WITH_GOOGLE_SHEET_ID` replaced (×1)
- [ ] `Cart Abandonment` tab exists with headers
- [ ] WooCommerce configured to POST to this webhook on checkout abandonment

#### Test Procedure
1. Activate the workflow to get the webhook URL
2. Send POST simulating an abandoned cart:
```json
{
  "customer_name": "Test Customer",
  "customer_email": "YOUR_TEST_EMAIL@gmail.com",
  "items": ["Jolly Santa Stocking Kit", "Christmas Ornament Set"],
  "cart_total": 285.00,
  "item_count": 2,
  "order_id": "test-12345"
}
```
3. **Expected result (over 72 hours — use shortened waits for testing):**
   - **1 hour:** Email 1 (gentle reminder) sent
   - **24 hours:** Checks WooCommerce API for order. If none → Email 2 (social proof)
   - **72 hours:** Checks again. If none → Email 3 (BOGO because 2 items)
   - Row logged to Cart Abandonment sheet

4. **⚠️ For testing: The Wait nodes have real delays (1hr, 23hr, 48hr). You may want to temporarily reduce these to 1min/2min/3min for testing, then restore before going live.**

#### Output Data Produced
| Field | Where It Goes | Used By |
|---|---|---|
| Recovery emails (×3) | Customer's inbox | Revenue recovery |
| Cart Abandonment log row | Google Sheet → Cart Abandonment tab | Dashboard analytics |

---

## 6. COMPLETE DATA FLOW MAP

```
INCOMING CUSTOMER EMAIL
    ↓
[WF2: Sentiment Router] ← webhook POST
    ↓ GPT-4o scores 1-10
    ├── Score ≥ 8 (happy)
    │   ├── → Backlog sheet (approval_status = pending)
    │   └── → Sentiment Log sheet
    └── Score < 8 (unhappy)
        ├── → Alert email to Doreen
        └── → Sentiment Log sheet

BACKLOG SHEET (has pending rows)
    ↓
[WF1A: Backlog Converter] ← manual trigger
    ↓ GPT-4o generates personalized email draft
    ├── → Approval Queue sheet (status = AWAITING_DOREEN)
    └── → Email to Doreen: "Review your drafts"

APPROVAL QUEUE (Doreen sets APPROVED/REJECTED)
    ↓
[WF1B: Send Approved] ← manual trigger
    ↓ Sends APPROVED emails only
    ├── → Customer inbox (review request)
    └── → Approval Queue updated (status = SENT)

WOOCOMMERCE CHECKOUT ABANDONED
    ↓
[WF3: Cart Recovery] ← webhook POST from WooCommerce
    ↓ 3-touch sequence (1hr → 24hr → 72hr)
    ├── Checks WooCommerce API after each wait
    ├── Stops if order completed
    ├── Touch 3: BOGO (2+ items) or Urgency (1 item)
    └── → Cart Abandonment sheet (outcome logged)
```

---

## 7. WHAT THE DASHBOARD NEEDS (When Connecting Live Data)

The Hermes Dashboard at `hermes-dashboard/` currently uses mock data. When connecting to real data, here's what each page needs:

| Dashboard Page | Data Source | API/Query |
|---|---|---|
| Morning Brief | All sheets + WooCommerce | Aggregate counts from all 4 tabs + WC orders API |
| Agent Team | Workflow execution logs | n8n API: execution counts per workflow |
| SEO Report | Google Search Console | GSC API: queries, impressions, clicks, position |
| Revenue Recovery | Cart Abandonment sheet + WC | Sheet data + WC orders for recovered revenue calc |
| Review Pipeline | Backlog + Approval Queue sheets | Read both tabs, calculate pipeline stages |
| Milestones | WooCommerce orders + custom logic | WC orders API → product category → timeline calc |
| MailChimp Attribution | MailChimp API + WC orders | MC opens within 48hr of WC orders by same email |
| Content Queue | Approval Queue sheet | Read Approval Queue, show AWAITING_DOREEN rows |
| Cart Abandonment | Cart Abandonment sheet | Read Cart Abandonment tab |
| Settings | Static config | Displays workflow IDs, credential status, placeholders |

---

## 8. QUICK-START ACTIVATION CHECKLIST

### Phase 1: Credentials (15 min)
- [ ] Create OpenAI API credential in n8n
- [ ] Verify Google Sheets OAuth2 works (reuse `YbVRsytaJN1Cuoox` or create new)
- [ ] Create SMTP credential in n8n (ai@reputationheal.com or similar)
- [ ] Get WooCommerce REST API keys from Doreen/Alex → create credential

### Phase 2: Google Sheet (10 min)
- [ ] Create Google Sheet "Art Needlepoint — Hermes Operations"
- [ ] Create 4 tabs with exact headers (see Section 4 above)
- [ ] Copy Sheet ID from URL
- [ ] Share sheet with the Google account used in n8n OAuth

### Phase 3: Wire Credentials to Workflows (20 min)
- [ ] WF1A: Set OpenAI, Google Sheets, SMTP on 4 nodes
- [ ] WF1B: Set Google Sheets, SMTP on 3 nodes
- [ ] WF2: Set OpenAI, Google Sheets, SMTP on 5 nodes
- [ ] WF3: Set WooCommerce, Google Sheets, SMTP on 8 nodes

### Phase 4: Replace Placeholders (10 min)
- [ ] Replace `REPLACE_WITH_GOOGLE_SHEET_ID` in all 4 workflows (10 occurrences)
- [ ] Replace `REPLACE_WITH_DOREEN_EMAIL` in WF1A + WF2 (2 occurrences)
- [ ] Replace `REPLACE_WITH_FROM_EMAIL` in WF1B + WF3 (5 occurrences)
- [ ] Replace `REPLACE_WITH_WOOCOMMERCE_DOMAIN` in WF3 (3 occurrences)

### Phase 5: Test (30 min)
- [ ] Test WF2 with happy email payload → verify Backlog row created
- [ ] Test WF2 with unhappy email payload → verify Doreen alert sent
- [ ] Test WF1A → verify GPT-4o draft in Approval Queue
- [ ] Set test row to APPROVED → test WF1B → verify email received
- [ ] Test WF3 with cart webhook → verify Email 1 arrives (use short wait for test)

### Phase 6: Go Live
- [ ] Activate WF2 (Live Sentiment Router) — starts receiving webhook posts
- [ ] Activate WF3 (Cart Recovery) — starts receiving WC abandonment webhooks
- [ ] WF1A and WF1B stay manual-trigger (Doreen runs them on her schedule)
- [ ] Connect WooCommerce to POST to WF3 webhook on cart abandonment
- [ ] Set up email forwarding to WF2 webhook for incoming customer emails

### Phase 7: Dashboard (Optional — After Workflows Proven)
- [ ] Deploy Hermes Dashboard to Netlify/Vercel
- [ ] Connect to Google Sheets API or Supabase for live data
- [ ] Replace mock data with real API calls

---

## 9. WORKFLOW REFERENCE CARD

| ID | Name | Trigger | Nodes | Credentials Needed |
|---|---|---|---|---|
| `nfmXFaTvWLUacMwc` | WF1A: Backlog Review Converter | Manual | 9 | OpenAI, Google Sheets, SMTP |
| `HuszM9AZ49V0RIXd` | WF1B: Send Approved Emails | Manual | 7 | Google Sheets, SMTP |
| `TVPkvfpVSy1DQbRS` | WF2: Live Sentiment Router | Webhook POST | 10 | OpenAI, Google Sheets, SMTP |
| `ifY4WDfJjWZiHr6t` | WF3: Cart Abandonment Recovery | Webhook POST | 18 | WooCommerce, Google Sheets, SMTP |

---

## 10. FILES IN THIS PROJECT

| File | Purpose |
|---|---|
| `ArtNeedlepoint_SETUP_AND_TESTING.md` | **This file** — master setup, testing, and status guide |
| `art_needlepoint_build.md` | Detailed build log with node maps and changelog |
| `art_needlepoint_presentation.html` | Professional client presentation (17 slides) |
| `ArtNeedlepoint_SOW_Spec.md` | Statement of Work / Spec document |
| `hermes-dashboard/` | Next.js Hermes Operations Dashboard (10 pages, mock data) |
| `artneedlepoint_logo.png` | Art Needlepoint logo |

---

## 11. CLIENT RULES (Never Violate)

- **Doreen approves ALL customer-facing copy** before it sends
- **Brand voice:** warm, expert, artisan — never corporate or pushy
- **No skill-level segmentation** — Doreen explicitly rejected this
- **Don't touch "Mondays with Needlepoint"** — her newsletter works fine
- **Payment recovery emails:** within 1 hour of failed payment
- **Review requests:** 7 days post-delivery, never sooner
- **Security:** Flag any new pages with author `andevtemp` immediately
- **AOV is $180** (not $85)
- **Platform:** WooCommerce (not Shopify)
