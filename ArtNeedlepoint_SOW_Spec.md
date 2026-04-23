# STATEMENT OF WORK & SYSTEM SPECIFICATION
## The Art Needlepoint Company — AI Growth & SEO Recovery System
### Client: Doreen Finkel (Owner), Alex Hadi (Tech) · artneedlepoint.com
### Provider: Reputation Health HQ · reputationhealthhq.com
### Date: April 17, 2026

---

## 1. CLIENT OVERVIEW

| Field | Detail |
|-------|--------|
| Business | The Art Needlepoint Company |
| Website | artneedlepoint.com (WooCommerce + WordPress) |
| Owner | Doreen Finkel |
| Tech Contact | Alex Hadi (marketing/dev) |
| Location | South Paris, ME |
| Products | 7,935 needlepoint kits, canvases, threads, accessories |
| Monthly Orders | ~320 orders/month |
| AOV | $180 |
| Monthly Revenue | ~$57,600 |
| Email List | 25,000 subscribers (MailChimp) |
| Google Rating | 4.3 stars (improved from 2.3) |
| Years in Business | 30+ years |

---

## 2. PROBLEM STATEMENT

### 2.1 SEO Crisis
- **Held Google Position #2** for "needlepoint kits" for **16 consecutive years** (2007–2023)
- **October 2023**: Google Helpful Content Update (HCU) caused initial drop
- **2025**: Site hacked — **279 casino/gambling spam posts** injected by attacker using WordPress author "andevtemp" across 10+ languages
- **Current Position**: ~14 for "needlepoint kits", ~9 for "needlepoint kit" (singular)
- **Index Crisis**: Only ~10 pages currently indexed by Google out of 7,935 products
- **No Manual Penalty**: Google Search Console confirms no manual action — recovery is algorithmic and achievable
- **Desktop vs Mobile Gap**: Desktop position 17.02 vs Mobile 9.45 — desktop severely underperforming

### 2.2 Revenue Leaks
- No cart abandonment recovery system exists
- Failed payments have no automated follow-up
- 25,000 email subscribers are undermonetized (no automated sequences)
- Google Merchant/Shopping listings underinvested (25.78% CTR vs 2.08% organic — 12x better but only 12,775 impressions)

### 2.3 Review & Reputation
- Improved from 2.3 → 4.3 stars but no automated review generation pipeline
- Happy customers are not systematically asked for reviews
- No system to intercept unhappy customers before they post publicly

### 2.4 Brand Monitoring
- Doreen has no visibility into Reddit, forums, or social mentions of her brand or needlepoint discussions
- Competitors are active in needlepoint communities; Art Needlepoint has zero presence monitoring

---

## 3. COMPETITIVE LANDSCAPE (Live Data — April 2026)

### Keyword: "needlepoint kits" — Current Google Rankings

| Position | Domain | Notes |
|----------|--------|-------|
| 1 | unwind.studio | Founded 2020 — 30 years younger than Art Needlepoint |
| 2 | poppymonkneedlepointkits.com | Keyword-rich exact-match domain |
| 3 | lepointstudio.com | Modern DTC brand |
| 4 | kcneedlepoint.com | Multi-brand catalog, free shipping |
| 5 | morganjuliadesigns.com | 49K Instagram followers |
| 6 | pennylinn.com | Founded 2020, strong community |
| ... | ... | ... |
| **NOT RANKED** | **artneedlepoint.com** | **Not in top 10 for plural "kits"** |

### Keyword: "needlepoint kit" (singular)

| Position | Domain |
|----------|--------|
| ~9 | **artneedlepoint.com** ← Only top-10 ranking |

### Key Competitive Insights
- SERP dominated by specialty DTC needlepoint retailers, NOT Amazon/Etsy in organic
- Newer pandemic-era brands (2020) are outranking a 30-year brand
- needlepoint.com (exact-match domain) dominates broadest "needlepoint" term
- No competitor has Wikipedia page — authority is buildable

---

## 4. SCOPE OF WORK — COMPLETE SYSTEM

### PRIORITY 1: SEO Recovery System (CRITICAL)

**Goal: Restore artneedlepoint.com to position 3-4 for "needlepoint kits" and "needlepoint kit" within 6 months.**

#### Phase 1 — Stop the Bleeding (Weeks 1–4)
- [ ] Verify all 279 spam posts fully deleted + "andevtemp" author removed
- [ ] Security audit: scan for backdoors, rogue plugins, unauthorized admin accounts
- [ ] Submit clean XML sitemap to Google Search Console
- [ ] Review and fix robots.txt to allow full crawl of product pages
- [ ] Fix all broken internal links from deleted spam pages
- [ ] Deploy SCOUT agent for daily automated spam/hack monitoring
- [ ] Set up daily sitemap scan — any new "andevtemp" content triggers immediate alert

#### Phase 2 — Rebuild Indexation (Weeks 4–8)
- [ ] Target: 500+ product pages indexed by Google (from current ~10)
- [ ] Add Product structured data (schema.org) to all WooCommerce items
- [ ] Audit and fix duplicate/thin title tags across 7,935 products
- [ ] Write 300+ word unique content for top 20 category pages:
  - /product-category/needlepoint-kits/
  - /product-category/new-arrivals/
  - /product-category/limited-editions/
  - /product-category/wildlife/
  - /browse-by-artist/
  - (15+ more category pages)
- [ ] Optimize Google Merchant Center product feed
- [ ] Fix Core Web Vitals issues (especially desktop — LCP, CLS)

#### Phase 3 — Authority Building (Weeks 8–16)
- [ ] Target: "needlepoint kit" position 9 → 3
- [ ] E-E-A-T content strategy: feature Doreen's 30+ years expertise
  - "About Our Expert Curators" page
  - Artist spotlight series (leverage browse-by-artist catalog)
  - "How to Choose Your First Needlepoint Kit" comprehensive guide
  - "Needlepoint vs Cross Stitch" comparison guide
- [ ] Fix desktop ranking gap (17.02 → target under 5)
- [ ] Internal linking restructure: category pages → product pages → related kits
- [ ] Backlink outreach: craft blogs, needlepoint communities, artist features

#### Phase 4 — Dominate Keywords (Weeks 16–24)
- [ ] Target: "needlepoint kits" (plural) position top 4
- [ ] Expand Google Shopping: 10x impression volume (from 12,775 → 125,000+)
- [ ] Scale Merchant listings leveraging 25.78% CTR advantage
- [ ] Long-tail keyword expansion: 500+ "needlepoint [theme/animal/style] kit" pages
- [ ] Monthly ranking reports + SCOUT daily monitoring continues

#### SEO KPIs & Milestones

| Metric | Current | Month 2 | Month 4 | Month 6 |
|--------|---------|---------|---------|---------|
| Pages Indexed | ~10 | 500+ | 2,000+ | 7,935+ |
| "needlepoint kit" position | ~9 | 6 | 4 | 3 |
| "needlepoint kits" position | Not ranked | Top 15 | Top 8 | 3-4 |
| Google Shopping impressions | 12,775 | 50,000 | 100,000 | 125,000+ |
| Desktop avg position | 17.02 | 12 | 7 | 4 |

---

### BUILD 1: Cart Abandonment Recovery System (ATLAS Agent)

**Trigger**: WooCommerce webhook fires when cart is abandoned (no checkout within 1 hour)

**Workflow**:
1. WooCommerce cart abandoned event → N8N webhook receiver
2. Hermes evaluates cart value and customer history via MCP tool calls
3. ATLAS drafts personalized recovery email
4. Email enters **Doreen Approval Queue** (nothing sends without her sign-off)
5. Upon approval → MailChimp sends email
6. Sequence:
   - **+1 hour**: Warm reminder — "You left something beautiful behind"
   - **+24 hours**: Product-focused — shows exact items in cart with images
   - **+48 hours**: Optional 10% incentive (configurable, Doreen controls)
7. ATLAS tracks opens, clicks, conversions, reports to dashboard

**Revenue Estimate**: At 10% recovery rate × $180 AOV × ~28 abandoned carts/month = **+$5,000/month**

**Technical Requirements**:
- WooCommerce REST API keys (Consumer Key + Secret)
- MailChimp API key
- N8N workflow: Cart Abandonment Pipeline
- MCP tools: woocommerce_get_cart, mailchimp_send_email, mailchimp_tag_subscriber

---

### BUILD 2: Live Sentiment Router + Review Pipeline (IRIS Agent)

**Trigger**: WooCommerce order status changes to "completed" / "delivered"

**Workflow**:
1. Order completion event → N8N webhook
2. IRIS reads any prior customer support emails for this customer
3. AI sentiment analysis scores the customer (positive / neutral / negative)
4. **7-day wait** after delivery (never sooner — Doreen's requirement)
5. Routing:
   - **Positive sentiment (score > 0.7)**: Sends personalized Google Review request with direct link
   - **Neutral (0.4–0.7)**: Sends satisfaction check email first, then review request if positive reply
   - **Negative (< 0.4)**: Routes directly to Doreen via private alert — NO review request sent
6. All review request copy → Doreen Approval Queue
7. IRIS tracks: reviews received, response rate, rating trends

**Target**: Push Google rating from 4.3 → 4.7+ within 90 days

**Technical Requirements**:
- WooCommerce REST API keys
- MailChimp API key
- Google Business Profile access (for direct review link generation)
- N8N workflow: Review Pipeline
- MCP tools: woocommerce_get_order, woocommerce_get_customer, mailchimp_send_email, sentiment_analyze

---

### BUILD 3: Payment Recovery + Win-Back Machine (ATLAS Agent — Extended)

**Trigger A — Failed Payment**: WooCommerce `order.updated` webhook when payment status = "failed"

**Failed Payment Workflow**:
1. Payment failure detected → N8N webhook fires immediately
2. ATLAS drafts recovery email with easy retry link
3. **+1 hour**: First email — "Your payment didn't go through — here's a quick link to try again"
4. **+6 hours**: Follow-up if still unresolved — alternate payment method suggestion
5. MailChimp tags updated: `payment-failed`, `payment-recovered` or `payment-lost`

**Trigger B — Win-Back**: Daily cron checks for customers with no order in 90+ days

**Win-Back Workflow ("Strut Your Stitches" Campaign)**:
1. Daily 6 AM cron → N8N queries WooCommerce for 90-day inactive customers
2. ECHO drafts personalized win-back email featuring new arrivals relevant to their purchase history
3. Email → Doreen Approval Queue
4. Sequence:
   - **Day 1**: "New arrivals we thought you'd love" (based on past categories)
   - **Day 7**: Artist spotlight or featured collection
   - **Day 14**: "We miss you" with optional incentive (Doreen configures)
5. Track reactivation rate

**Revenue Estimate**:
- Payment recovery: $1,800/month per 10 recovered orders
- Win-back: $2,400/month at 3% reactivation × $180 AOV

**Technical Requirements**:
- WooCommerce REST API keys
- MailChimp API key
- N8N workflows: Payment Recovery Pipeline, Win-Back Campaign
- MCP tools: woocommerce_get_orders, woocommerce_get_customer_history, mailchimp_send_email, mailchimp_update_tags

---

### BUILD 4: Reddit & Community Monitor Agent (SENTRY Agent) — NEW

**Purpose**: Monitor Reddit and online communities for any mention of Art Needlepoint, Doreen, needlepoint discussions, or competitor activity. Alert Doreen when someone talks about needlepoint so she can engage.

**Trigger**: Scheduled cron — every 4 hours

**Monitored Channels**:
- Reddit subreddits: r/Needlepoint, r/CrossStitch, r/Embroidery, r/crafts, r/Stitching
- Reddit search: keywords "art needlepoint", "artneedlepoint", "needlepoint kit recommendation", "best needlepoint"
- Google Alerts: "art needlepoint company", "artneedlepoint.com"

**Workflow**:
1. Every 4 hours → N8N cron triggers SENTRY agent
2. SENTRY queries Reddit API (public read access, no auth required for search)
   - Search endpoint: `reddit.com/search.json?q=needlepoint+kit`
   - Subreddit feeds: `reddit.com/r/Needlepoint/new.json`
3. AI filters for relevance:
   - **Direct mention**: Someone mentions Art Needlepoint or artneedlepoint.com → HIGH PRIORITY alert
   - **Purchase intent**: "looking for needlepoint kits", "recommendations?" → MEDIUM alert (opportunity to engage)
   - **Competitor mention**: Someone recommends Unwind Studio, Poppy Monk, etc. → LOW alert (awareness)
4. Alert delivered to Doreen via email digest or dashboard notification
5. Each alert includes: post link, relevant quote, suggested response (optional)

**Why This Matters**:
- Reddit threads rank in Google — a recommendation there drives SEO value
- Direct customer acquisition from community engagement
- Competitor intelligence: see what customers say about alternatives
- Brand protection: catch and respond to complaints early

**Technical Requirements**:
- Reddit API access (free public tier — no cost, rate limit: 100 requests/minute)
- N8N workflow: Reddit Monitor Pipeline
- N8N node: HTTP Request to Reddit JSON API (no official Reddit node needed)
- MCP tools: reddit_search, reddit_fetch_subreddit, ai_relevance_filter
- Optional: Google Alerts forwarded to a monitored email inbox

---

### BUILD 5: SEO Watchdog Agent (SCOUT Agent)

**Purpose**: Continuous automated monitoring of Google rankings, site indexation, and hack re-infection.

**Trigger**: Daily cron at 6:00 AM ET

**Workflow**:
1. Daily 6 AM → N8N triggers SCOUT
2. SCOUT performs:
   - Google Search Console API check: pages indexed count, crawl errors, new 404s
   - Keyword position check: "needlepoint kits", "needlepoint kit", "needlepoint" — track daily
   - Sitemap scan: detect any new unauthorized posts or authors
   - Core Web Vitals check: flag any regressions
3. **Alert Conditions**:
   - 🔴 CRITICAL: New spam posts or unknown authors detected
   - 🔴 CRITICAL: Indexed pages drops below previous week
   - 🟡 WARNING: Any target keyword drops 3+ positions
   - 🟢 GOOD: Ranking improvement detected
4. Dashboard updated with daily metrics
5. Weekly summary email to Doreen + Alex

**Technical Requirements**:
- Google Search Console API access (property user)
- WordPress admin read access (for sitemap/author auditing)
- N8N workflow: SEO Watchdog Pipeline
- MCP tools: gsc_get_performance, gsc_get_index_status, sitemap_scan, rank_check

---

## 5. AI ARCHITECTURE

### 5.1 Hermes Orchestrator (Nous Research)
**Role**: Central AI brain that coordinates all 5 agents. Hermes is a function-calling LLM from Nous Research designed for multi-agent orchestration.

**How it works**:
- Receives events from all N8N workflows
- Decides priority, timing, and which agent handles what
- Handles edge cases (e.g., customer has both a failed payment AND an abandoned cart — don't send 2 emails)
- Generates the daily dashboard briefing
- Escalates to Doreen when human judgment needed

### 5.2 Agent Team

| Agent | Role | Triggers | Actions |
|-------|------|----------|---------|
| ATLAS | Revenue Recovery | Cart abandoned, payment failed | Draft emails, track conversions |
| IRIS | Review Intelligence | Order delivered | Sentiment analysis, route reviews |
| ECHO | Email Automation | Win-back cron, sequences | MailChimp campaigns |
| SCOUT | SEO Watchdog | Daily 6AM cron | Rankings, indexation, hack scan |
| SENTRY | Community Monitor | Every 4 hours | Reddit/forum scan, alerts |
| HERALD | Content Publisher | On-demand | Category pages, meta tags, blog |

### 5.3 N8N (Workflow Automation Engine)
- Handles all webhook listeners, cron triggers, and API connections
- Connects WooCommerce, MailChimp, Google APIs, Reddit API
- Visual workflow builder — all workflows documented and auditable
- Self-hosted or cloud — client choice

### 5.4 Syntax MCP (Model Context Protocol)
- Provides the "hands" for AI agents — tool calls to interact with live APIs
- Each agent has access to specific MCP tools scoped to their role
- Example: ATLAS can call `woocommerce_get_cart` but cannot call `gsc_get_performance` (that's SCOUT's tool)
- Security: tool access is role-scoped, no agent has full system access

---

## 6. DOREEN'S APPROVAL GATE

**Non-negotiable requirement from client**: "I need to see the writing before it goes out."

### Implementation:
- Every customer-facing email/message enters a **Doreen Approval Queue**
- Queue accessible via dashboard or email digest
- Each item shows: draft copy, target customer, trigger reason
- Doreen can: ✅ Approve | ✏️ Edit & Approve | ❌ Reject with note
- Approved templates become "pre-approved" — future similar emails auto-send without re-approval
- After 20+ approved templates, system is largely self-running with Doreen reviewing exceptions only

### Brand Voice Guidelines (to collect from Doreen):
- Warm, expert, artisan — never corporate or pushy
- Examples of "sounds like us" vs "doesn't sound like us"
- Specific phrases Doreen uses or avoids

---

## 7. PREREQUISITES — WHAT WE NEED FROM DOREEN & ALEX

### Required (Before Build Starts)

| # | Item | Who | Time | Purpose |
|---|------|-----|------|---------|
| 1 | WooCommerce REST API Keys | Alex | 2 min | Cart, order, payment, customer data |
| 2 | MailChimp API Key | Alex | 2 min | Email sequences, subscriber management |
| 3 | Google Search Console access | Alex | 5 min | Add us as property user — SEO monitoring |
| 4 | WordPress Admin (read access) | Alex | 2 min | Verify hack cleanup, sitemap audit |
| 5 | Google Business Profile access | Doreen | 5 min | Review link generation |
| 6 | Confirm all 279 spam posts deleted | Alex | Verify | Must be complete before sitemap resubmission |

### Helpful (Week 2)

| # | Item | Who | Purpose |
|---|------|-----|---------|
| 7 | Google Merchant Center access | Alex | Expand Shopping listings (25.78% CTR opportunity) |
| 8 | Brand voice examples | Doreen | 3-5 "sounds like us" / "doesn't" email samples |
| 9 | Top 20 artists/products list | Doreen | E-E-A-T content strategy |
| 10 | Current MailChimp campaign exports | Alex | Match existing tone in new sequences |
| 11 | Google Analytics access | Alex | Traffic + conversion tracking |

### Already Completed

| Item | Status |
|------|--------|
| GSC Performance data shared | ✅ Analyzed (March 2025–April 2026) |
| Hack identified (279 spam posts) | ✅ Found and reported by us |
| Cleanup underway | ✅ Alex confirmed in progress |
| No manual Google penalty | ✅ Confirmed via GSC Manual Actions |

---

## 8. PRICING

### One-Time Setup: $5,000

Includes:
- Build 1: Cart Abandonment Recovery System (ATLAS)
- Build 2: Live Sentiment Router + Review Pipeline (IRIS)
- Build 3: Payment Recovery + Win-Back Machine (ATLAS + ECHO)
- Build 4: Reddit & Community Monitor (SENTRY)
- Build 5: SEO Watchdog Agent (SCOUT)
- Hermes Orchestrator configuration
- N8N workflow setup (all 5 pipelines)
- Syntax MCP tool integration
- Doreen Approval Queue system
- AI Dashboard with daily briefings
- SEO Phase 1 execution (hack verification + sitemap submission)

### Monthly Retainer: $1,000/month

Includes:
- Daily SCOUT SEO + hack monitoring
- Weekly ranking reports (3 target keywords)
- Monthly content queue (10 pieces — category pages, meta tags, blog posts)
- AI agent performance tuning and optimization
- Email sequence A/B testing and optimization
- Google Shopping feed management
- Reddit/community monitoring (SENTRY — 6x daily)
- Immediate alert if new spam/hack detected
- Monthly strategy call with Doreen
- SEO Phases 2–4 execution and management

---

## 9. ROI PROJECTION (Conservative)

| Revenue Stream | Monthly Estimate | Basis |
|---------------|-----------------|-------|
| Cart abandonment recovery (10% rate) | +$5,000 | ~28 abandoned × 10% × $180 AOV |
| Failed payment recovery | +$1,800 | ~10 recovered × $180 AOV |
| Win-back campaigns (90-day inactive) | +$2,400 | 3% reactivation rate |
| SEO traffic recovery (position 3-4) | +$8,000 | Based on GSC data: position 2 traffic was 2-3x current |
| Total Monthly Upside | **+$17,200/mo** | |
| Monthly Cost | -$1,000/mo | |
| **Net Monthly ROI** | **+$16,200/mo** | **16.2x return on monthly investment** |

First-year value: **$194,400** incremental revenue on a $17,000 total investment ($5K + $12K annual retainer)

---

## 10. TIMELINE

| Week | Milestone |
|------|-----------|
| Week 1 | API keys received, hack cleanup verified, SCOUT deployed |
| Week 2 | N8N workflows built + tested, Hermes configured |
| Week 3 | Doreen reviews first batch of email templates |
| Week 4 | Builds 1-3 GO LIVE, SENTRY active, sitemap submitted |
| Week 6 | SEO Phase 2 begins — indexation push |
| Week 8 | 500+ pages indexed target |
| Week 12 | "needlepoint kit" target: position 4 |
| Week 16 | SEO Phase 3 complete — authority content live |
| Week 24 | "needlepoint kits" target: position 3-4 |

---

## 11. ACCEPTANCE CRITERIA

The system will be considered successfully delivered when:

1. **All 5 agents operational** and generating daily dashboard briefings
2. **Cart abandonment emails** sending within 1 hour of abandoned cart (after Doreen approval)
3. **Review pipeline** active with sentiment routing working correctly
4. **Payment failure recovery** emails firing within 1 hour of failed payment
5. **Reddit monitoring** delivering relevant alerts every 4 hours
6. **SCOUT** running daily with ranking + hack monitoring
7. **Doreen Approval Queue** functional with approve/edit/reject workflow
8. **500+ pages indexed** by Google within 8 weeks of sitemap submission
9. All N8N workflows documented and transferable

---

## 12. TERMS

- **Payment**: 50% upfront ($2,500), 50% upon system go-live ($2,500)
- **Monthly retainer**: $1,000/month, billed on the 1st, 30-day cancellation notice
- **Data ownership**: All customer data remains property of The Art Needlepoint Company
- **Access**: Provider credentials will be revoked upon contract termination
- **Confidentiality**: All business data, customer lists, and revenue figures treated as confidential

---

**Prepared by**: Reputation Health HQ
**Prepared for**: The Art Needlepoint Company (Doreen Finkel, Owner)
**Date**: April 17, 2026
**Valid for**: 30 days from date above

---

*Signatures:*

_________________________ | _________________________
**Reputation Health HQ** | **The Art Needlepoint Company**
Date: _________________ | Date: _________________
