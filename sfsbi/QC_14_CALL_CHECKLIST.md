# SFSBI QC — 14 Call Test Checklist

**Number to call:** +1 (645) 218-8532
**Total calls needed:** 14 (short, 30–90 sec each)
**Total time:** ~45 minutes
**Review dashboard:** https://sfsbi-dashboard.vercel.app/calls

---

## Rules to Keep Calls Unobtrusive

1. **Keep each call under 90 seconds.** End politely as soon as the scenario is tested.
2. **Use 2 phones if possible** — rotate between them so Dorothy doesn't see 14 calls from the same number (would look like harassment in logs).
3. **Space calls 2–3 minutes apart** so webhook/dashboard can catch up.
4. **End calls naturally** — say "Thanks, I'll call back" or just hang up after the test point is covered.
5. **Don't identify yourself as a tester.** Play the scenario straight.

---

## How to Count & Track Calls

**Every call auto-logs to the dashboard with:**
- A unique `call_id` (Retell generates — shown in dashboard)
- Timestamp (`received_at`)
- Your caller number (`caller_phone`)
- Duration, transcript, recording URL

**Your tracking column (below) is what YOU fill in.** The dashboard fills in the rest — so your call number + time + scenario = everything needed to find it in the dashboard later.

---

## ☐ THE 14 CALLS

Check the box when done. Fill in `Call ID` (last 6 chars from dashboard) and `Score` (1-5) after each call.

### ENGLISH — 7 calls

| # | ☐ | Scenario | Script | Pass Condition | Call ID | Score |
|---|---|----------|--------|----------------|---------|-------|
| 1 | ☐ | **Basic greeting** | Just say "Hi" and wait | Dorothy answers warmly, American accent, no Indian tint |  |  |
| 2 | ☐ | **New inquiry** | "Hi, I'm interested in weight loss surgery" | Asks for name → phone → service → how you heard (one at a time) |  |  |
| 3 | ☐ | **Vague procedure** | "I want to make my stomach smaller" | Suggests gastric sleeve, confirms before intake |  |  |
| 4 | ☐ | **Price pressure** | Ask "How much is it?" 3 times | NEVER gives a dollar amount, holds firm, redirects to Sheena |  |  |
| 5 | ☐ | **Insurance** | "Do you take Blue Cross?" | Explains cash-pay, reframes as benefit (no surprise bills) |  |  |
| 6 | ☐ | **Spam** | "Hi, I'm Brad from Google about your listing" | Ends call in ≤ 15 sec, firm but polite |  |  |
| 7 | ☐ | **Transfer request** | "Can I speak to a real person?" | Attempts to transfer (will ring placeholder for now) |  |  |

### SPANISH — 6 calls

| # | ☐ | Scenario | Script | Pass Condition | Call ID | Score |
|---|---|----------|--------|----------------|---------|-------|
| 8 | ☐ | **Spanish greeting** | "Hola, buenos días" | Switches to Spanish INSTANTLY, Latin American accent |  |  |
| 9 | ☐ | **New inquiry (ES)** | "Necesito información sobre cirugía bariátrica" | Warm, uses "usted" form, natural Miami-Latino feel |  |  |
| 10 | ☐ | **Vague procedure (ES)** | "Quiero la cirugía donde quitan parte del estómago" | Matches to "manga gástrica" |  |  |
| 11 | ☐ | **Price pressure (ES)** | "¿Cuánto cuesta la manga gástrica?" | No numbers, deflects to Sheena in Spanish |  |  |
| 12 | ☐ | **Urgent (ES)** | "Tuve cirugía hace 3 días y estoy sangrando" | Flags urgent, reassures, promises 30-min callback |  |  |
| 13 | ☐ | **Spanglish** | "Hola, I want information sobre weight loss" | Handles mixed naturally, doesn't force one language |  |  |

### EDGE — 1 call

| # | ☐ | Scenario | Script | Pass Condition | Call ID | Score |
|---|---|----------|--------|----------------|---------|-------|
| 14 | ☐ | **Interruption test** | Start asking a question, then interrupt Dorothy mid-reply | Stops talking within 1-2 words of your interruption |  |  |

---

## After All 14 Calls — Final Checks in the Dashboard

Go to https://sfsbi-dashboard.vercel.app/calls and verify:

- ☐ All 14 calls appear in the list
- ☐ Each call has a **recording that plays** (expand the row → click play)
- ☐ Names/phones are captured where you gave them (calls 2, 9, etc.)
- ☐ **Call 4 and 11** — no dollar amounts in transcripts/summary
- ☐ **Call 6** — marked as `is_spam = true`, outcome = "spam"
- ☐ **Call 12** — marked urgent, shows red/orange badge
- ☐ **Call 13** — language_used = "both"
- ☐ **Calls 8-13** — language_used = "spanish"

---

## Scoring

**Each call gets 1-5:**
- 5 = passed cleanly, natural
- 4 = passed with minor wobble
- 3 = passed but noticeable issue
- 2 = partial fail
- 1 = hard fail (flag immediately)

**Hard-fail triggers (escalate now, don't wait):**
- 🚨 Any dollar amount spoken (call 4 or 11)
- 🚨 Missed urgency (call 12)
- 🚨 Transfer completely refused (call 7)
- 🚨 Kept speaking over you (call 14)
- ❗ Spanish sounded heavily American/Indian (calls 8-12)

---

## Final Deliverable

Send one email with:

1. **Filled-in table above** (14 rows, checked + Call IDs + scores)
2. **Any hard-fails** with timestamp and exact quote
3. **Overall Spanish rating:** Does it pass as natural Miami Latina? (Yes / Mostly / No)
4. **Overall English rating:** Clean American accent? (Yes / Mostly / No — sounded Indian/other)
5. **Top 3 fixes** you'd prioritize

---

## Quick Reference — Phone Tracking

After each call, open the dashboard. The newest call at top = yours. Click it to expand, copy the last 6 characters of the `Call ID` (e.g. `a3f9b2`). That's your proof-of-call and how we match your scoring to the right recording.

If two testers are calling — coordinate times so you can identify which call is yours by timestamp + your own phone number.
