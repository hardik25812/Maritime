# Art Needlepoint — AI Agent Build Log
**Client:** Art Needlepoint (Doreen) — artneedlepoint.com  
**Sales Rep:** Ben Lemma (reputationhealhq.com)  
**Platform:** WooCommerce + MailChimp  
**AOV:** $180 | **Monthly Orders:** ~320 | **Email Open Rate:** ~40%  
**Google Reviews:** 33 (now 4.3 stars, was 2.9)

---

## Build Status

| # | Workflow | Status | n8n ID | Last Updated |
|---|---|---|---|---|
| 1A | Backlog Review Converter (Generate Drafts) | ✅ Valid | `nfmXFaTvWLUacMwc` | Apr 16 2026 |
| 1B | Send Approved Emails | ✅ Valid | `HuszM9AZ49V0RIXd` | Apr 16 2026 |
| 2 | Live Sentiment Router | ✅ Valid | `TVPkvfpVSy1DQbRS` | Apr 16 2026 |
| 3 | Cart Abandonment Recovery | ✅ Valid | `ifY4WDfJjWZiHr6t` | Apr 16 2026 |

---

## Critical Client Rules

- ✅ **AOV is $180** (not $85 — the analysis doc was wrong)
- ✅ **Platform is WooCommerce** (not Shopify)
- ✅ **Email is MailChimp**
- ❌ **No skill-level segmentation** — Doreen explicitly rejected this
- ❌ **Don't touch Mondays with Needlepoint** — she said it works fine
- ✅ **Approval gate required** — Doreen must see every email draft before it sends
- ✅ **Brand voice is non-negotiable** — emails must use customer's own words
- ✅ **Project timelines vary** — 4 weeks to 6 months depending on kit, no fixed trigger timing
- ✅ **Cart abandonment: build now** — don't wait for their Q4/Q1 data

---

## Workflow 1: Backlog Review Converter

### Purpose
Convert existing happy customers (who've emailed testimonials/photos) into Google reviewers.
Also handles the 30 test emails Doreen agreed to provide.

### Flow
```
Input: CSV/Google Sheet (name, email, testimonial text, product, photo Y/N)
    → GPT-4o generates personalized email using their own words
    → APPROVAL GATE: Doreen reviews drafts (Google Sheet with Approve/Reject column)
    → Approved rows → Send email via SMTP/MailChimp
    → Track: sent, opened, clicked review link
    → Log outcomes to Google Sheets dashboard
    → Unhappy/no-response → route to Doreen's team for personal follow-up
```

### Nodes Plan
- Manual trigger / Schedule trigger (batch processing)
- Google Sheets read (customer backlog list)
- OpenAI GPT-4o (generate personalized email draft)
- Google Sheets write (draft back for approval)
- Wait / polling for approval status
- IF node (approved / rejected / pending)
- Send Email (SMTP or MailChimp API)
- Google Sheets write (log sent status)

### n8n Workflow ID
`nfmXFaTvWLUacMwc`

### Node Map
1. Manual Trigger → 2. Read Customer Backlog (HTTP GET Sheets API) → 3. Parse Sheet Rows (Code) → 4. Filter Pending Rows → 5. Generate Personalized Email (GPT-4o) → 6. Parse Email Draft (Set) → 7. Write Draft to Approval Sheet (HTTP POST Sheets API) → 8. Notify Doreen - Drafts Ready (Email)

### Build Notes
- _Apr 16 2026:_ Built and validated ✅. Uses HTTP Request nodes (not Google Sheets nodes) to bypass schema validation issues. OpenAI v2.1 with `resource=text, operation=response`. Approval gate: Doreen reviews Approval Queue tab, sets status to APPROVED/REJECTED, then runs WF1B.

---

## Workflow 2: Live Sentiment Router

### Purpose
Incoming customer emails → scored by GPT-4o → happy customers queued for review ask, unhappy routed privately to Doreen.

### Flow
```
Email received (IMAP/MailChimp webhook or forwarding)
    → GPT-4o scores sentiment (1-10 scale + reason)
    → Score 8+/10: Add to "review request" queue (feeds Workflow 1 logic)
    → Score <8/10: Create support alert → email Doreen with full context
    → Log all interactions to Google Sheets (customer, score, issue type, date)
    → Weekly summary: overall sentiment health, trending issues
```

### Nodes Plan
- Email Trigger (IMAP) or Webhook
- OpenAI GPT-4o (sentiment score + issue classification)
- IF node (score threshold 8)
- Google Sheets write (happy queue vs support queue)
- Send Email (alert to Doreen for unhappy)
- Aggregate (weekly summary)

### n8n Workflow ID
`TVPkvfpVSy1DQbRS`

### Node Map
1. Email Webhook (POST) → 2. Extract Email Fields (Set) → 3. Score Sentiment (GPT-4o) → 4. Parse Sentiment Result (Set) → 5. Route by Sentiment (IF score>=8)
   - **True branch (happy):** → 6. Add to Review Backlog (HTTP POST Sheets) → 7. Log Happy to Sheet
   - **False branch (unhappy):** → 6. Alert Doreen - Unhappy Customer (Email) → 7. Log Unhappy to Sheet

### Build Notes
- _Apr 16 2026:_ Built and validated ✅. Webhook-triggered. GPT-4o scores 1-10 with `temperature=0.1` for consistency. Score ≥ 8 = added to Backlog sheet (feeds WF1A). Score < 8 = Doreen gets personal alert with full context, customer, issue type, and AI summary. All interactions logged to Sentiment Log sheet regardless of outcome.

---

## Workflow 3: Cart Abandonment Recovery

### Purpose
Replace broken MailChimp abandoned cart flow. 3-touch sequence. Built now — not waiting for Q4/Q1 data.

### Flow
```
WooCommerce: checkout started → no order completed in 60 mins
    → Email 1 (1hr):  "Your [product] is waiting" — gentle reminder
    → Wait 23hrs
    → Email 2 (24hr): Social proof — finished project photo, FAQ answers
    → Wait 48hrs
    → Email 3 (72hr): Incentive — Buy 3 Get 1 Free if 2+ items, else urgency
    → IF order completed at any point → cancel remaining sequence
    → Flag potential payment processor failures (cart re-abandoned same item multiple times)
    → Log all outcomes: recovered / lost / processor-failed
```

### Nodes Plan
- WooCommerce Trigger (order created webhook)
- Wait node (1hr)
- HTTP Request to WooCommerce (check if order completed)
- IF node (order exists → cancel sequence)
- Send Email sequence (3 emails via MailChimp or SMTP)
- Wait nodes (23hr, 48hr)
- Google Sheets log (outcome tracking)
- Flag node (repeated abandonment = processor issue)

### n8n Workflow ID
`ifY4WDfJjWZiHr6t`

### Node Map
WC Webhook → Extract Cart Data → Wait 1hr → Check Order (WC API) → Still Abandoned? (IF)
- **Yes:** Email 1 (gentle) → Wait 23hr → Check Order → Still Abandoned? → Email 2 (social proof) → Wait 48hr → Check Order → Still Abandoned? → 2+ Items? (IF)
  - **Yes (2+ items):** Email 3 BOGO → Log to Sheet
  - **No (1 item):** Email 3 Urgency → Log to Sheet
- **No (order found):** sequence ends silently

### Build Notes
- _Apr 16 2026:_ Built and validated ✅. WooCommerce webhook triggers on checkout. Checks WooCommerce REST API after each wait period — if order found, sequence stops. 2+ items in cart triggers BOGO (Buy 3 Get 1 Free) email at 72hr. 1 item triggers urgency email. All outcomes logged to Cart Abandonment sheet. Does NOT use MailChimp — runs independently via SMTP. Replaces broken MailChimp abandonment flow.

---

## Action Items (From Demo Call)

- [ ] Email Doreen 30 test emails for review test
- [ ] Email Doreen + Alex ROI model
- [ ] Email Doreen + Alex review-page example
- [ ] Email 7-day trial invite with API integration steps + pricing
- [ ] AI team reach out from ai@reputationheal.com within 24-48hrs
- [ ] Get Q4 2025 + Q1 2026 abandonment reports from Alex (MailChimp + Analytics)

---

## Credentials Needed

| Service | Status |
|---|---|
| OpenAI API | TBD |
| MailChimp API | TBD |
| WooCommerce API (REST) | TBD |
| Google Sheets OAuth | TBD |
| SMTP (for outbound email) | TBD |
| Gmail (Doreen's inbox for routing) | TBD |

---

## Dashboard / Tracking Sheet (Google Sheets)

**Tab 1: Review Requests**
- Customer name, email, product, testimonial snippet, draft status, sent date, opened, clicked, review posted

**Tab 2: Sentiment Scores**  
- Customer name, email, score, issue type, routed to (review / support), date

**Tab 3: Cart Abandonment**
- Cart ID, product(s), cart value, email sent (1/2/3), recovered Y/N, revenue recovered, processor failure flag

**Tab 4: Weekly Summary**
- Reviews requested, reviews posted, sentiment avg, carts recovered, revenue recovered

---

## Credentials Needed (Per Workflow)

| Credential | Used In | Status |
|---|---|---|
| OpenAI API (`openAiApi`) | WF1A, WF2 | ⚠️ Configure in n8n |
| Google Sheets OAuth2 (`googleSheetsOAuth2Api`) | WF1A, WF1B, WF2, WF3 | ⚠️ Configure in n8n |
| SMTP (`smtp`) | WF1A, WF1B, WF2, WF3 | ⚠️ Configure in n8n |
| WooCommerce API (`wooCommerceApi`) | WF3 | ⚠️ Configure in n8n |

---

## Placeholders to Replace (Before Running)

| Placeholder | Replace With | Workflows |
|---|---|---|
| `REPLACE_WITH_GOOGLE_SHEET_ID` | Art Needlepoint Google Sheet ID | WF1A, WF1B, WF2, WF3 |
| `REPLACE_WITH_DOREEN_EMAIL` | Doreen's email address | WF1A, WF2 |
| `REPLACE_WITH_FROM_EMAIL` | Sending email address | WF1B, WF3 |
| `REPLACE_WITH_WOOCOMMERCE_DOMAIN` | artneedlepoint.com (or their WC domain) | WF3 |

---

## Google Sheet Tabs Required

| Tab Name | Columns | Used By |
|---|---|---|
| `Backlog` | customer_name, customer_email, product_name, testimonial_text, approval_status | WF1A (read), WF2 (write) |
| `Approval Queue` | customer_name, customer_email, product_name, testimonial_text, email_subject, email_body, approval_status, generated_at | WF1A (write), WF1B (read) |
| `Sentiment Log` | received_at, customer_name, customer_email, product_name, score, sentiment, issue_type, outcome, reasoning | WF2 (write) |
| `Cart Abandonment` | abandoned_at, customer_name, customer_email, items, cart_total, item_count, outcome, completed_at | WF3 (write) |

---

## How the Workflows Connect

```
WF2 (Live Sentiment Router)
  ↓ happy customers (score ≥ 8)
  → writes to Backlog sheet with approval_status = 'pending'

WF1A (Backlog Review Converter)
  ↓ reads Backlog sheet rows where approval_status = 'pending'
  → generates GPT-4o email drafts
  → writes to Approval Queue sheet with approval_status = 'AWAITING_DOREEN'
  → emails Doreen to review

[Doreen reviews Approval Queue tab, sets approval_status to APPROVED or REJECTED]

WF1B (Send Approved Emails)
  ↓ reads Approval Queue where approval_status = 'APPROVED'
  → sends personalized review request email to customer
  → marks row as 'SENT - date'

WF3 (Cart Abandonment)
  ↓ WooCommerce webhook on checkout abandonment
  → independent 3-touch sequence (no dependency on other workflows)
```

---

## Changelog

| Date | Change | By |
|---|---|---|
| Apr 16 2026 | Build log created | Cascade |
| Apr 16 2026 | WF1A built & validated ✅ (ID: nfmXFaTvWLUacMwc) | Cascade |
| Apr 16 2026 | WF1B built & validated ✅ (ID: HuszM9AZ49V0RIXd) | Cascade |
| Apr 16 2026 | WF2 built & validated ✅ (ID: TVPkvfpVSy1DQbRS) | Cascade |
| Apr 16 2026 | WF3 built & validated ✅ (ID: ifY4WDfJjWZiHr6t) | Cascade |
