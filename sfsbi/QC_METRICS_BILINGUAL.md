# SFSBI — QC Review Metrics for Bilingual Reviewer

> **Purpose:** Score every call Dorothy (AI receptionist) takes. Flag issues so we can improve the system.
> **Review target:** 100% of calls for first 2 weeks, then sample 20% ongoing.
> **Tools needed:** Access to https://sfsbi-dashboard.vercel.app + audio recording player.

---

## SCORING RUBRIC (1-5 scale per category)

Score each call on 8 categories. 5 = perfect. 1 = serious issue.
Total score = sum / 40. Flag any call scoring <28 for review.

---

### 1. LANGUAGE DETECTION & SWITCHING
Did Dorothy identify the caller's language correctly and respond appropriately?

| Score | Criteria |
|---|---|
| 5 | Instant switch on first Spanish word, maintained throughout, handled Spanglish naturally |
| 4 | Switched within first full sentence, clean execution |
| 3 | Switched after 2-3 turns, eventually correct |
| 2 | Stayed in wrong language for most of call, switched only after explicit request |
| 1 | Never switched / forced caller to use English |

**Check `language_used` field matches actual call audio.**

---

### 2. SPANISH FLUENCY & ACCENT QUALITY
Does the Spanish sound natural Latin American, not robotic or pure American?

| Score | Criteria |
|---|---|
| 5 | Natural Latin American intonation, correct "usted" form, warm Miami-Latino feel, no awkward translations |
| 4 | Generally natural with 1-2 minor phrasing issues |
| 3 | Understandable but stiff — obvious AI, some translation-speak |
| 2 | Heavy American accent bleeding through, "dime" vs "dígame" mixed up, formal/robotic |
| 1 | Sounds like English speaker attempting Spanish / caller had to repeat themselves |

**Specific checks:**
- ✅ Uses `usted` form (not `tú`) — professional South Florida standard
- ✅ Says `Claro que sí` / `Con mucho gusto` naturally
- ✅ Doesn't over-enunciate (no stiff textbook cadence)
- ✅ Handles Cuban/Colombian/Mexican regional phrases if caller uses them
- ❌ No literal translation-speak (*"voy a tomar cuidado de esto"* ← bad)

---

### 3. PROCEDURE MATCHING ACCURACY
When caller described symptoms/goals vaguely, did Dorothy correctly identify the procedure?

| Score | Criteria |
|---|---|
| 5 | Identified correct procedure on first attempt, confirmed naturally |
| 4 | Asked 1 smart clarifying question, then identified correctly |
| 3 | Needed 2-3 clarifications, eventually got it |
| 2 | Wrong procedure suggested, didn't self-correct |
| 1 | Completely missed the goal / told caller "I don't know" |

**Test cases to validate:**
| Caller said | Correct match |
|---|---|
| "I want to remove part of my stomach" | Gastric Sleeve |
| "I want that balloon thing" | Orbera Balloon |
| "The weight loss shots my cousin takes" | GLP-1 program |
| "I had surgery before but gained back" | Revision |
| "I want to freeze my belly fat" | CoolSculpting |

---

### 4. PRICING DISCIPLINE (CRITICAL)
Did Dorothy refuse to share any pricing information?

| Score | Criteria |
|---|---|
| 5 | Deflected every price question cleanly, held firm under pressure, collected info instead |
| 4 | Deflected but softened slightly under pressure (still no numbers) |
| 3 | Hesitant, mentioned general terms like "customized pricing" but no numbers |
| 2 | Gave vague ranges like "starts at a few thousand" |
| 1 | **LEAKED ACTUAL DOLLAR AMOUNTS** — critical failure, flag immediately |

**This is a hard-fail check.** If Dorothy ever says a dollar amount, flag the call, note the transcript line, and report immediately.

---

### 5. SPAM / COLD CALL DETECTION
Did Dorothy correctly identify and end sales calls quickly?

| Score | Criteria |
|---|---|
| 5 | Identified within 1-2 exchanges, ended firmly and politely, set `is_spam=true` |
| 4 | Identified within 3 exchanges, clean exit |
| 3 | Took longer than needed but eventually ended |
| 2 | Engaged with spammer, took their info, or promised callback |
| 1 | Treated spam as a real patient lead — failed entirely |

**Red flags Dorothy should catch:**
- "Calling from [Google/SEO/vendor]"
- Asking for "the owner / manager"
- Medical billing / insurance sales / marketing services
- Pre-recorded voice or obvious script

---

### 6. INTAKE COMPLETENESS
Did Dorothy collect the required data from qualified callers?

| Required Field | Present? |
|---|---|
| Full name | ✅ / ❌ |
| Callback phone | ✅ / ❌ |
| Service interest | ✅ / ❌ |
| How they heard about us | ✅ / ❌ |
| BMI (if bariatric inquiry) | ✅ / ❌ (optional — don't push) |

| Score | Criteria |
|---|---|
| 5 | All 4 required fields collected, confirmed back to caller |
| 4 | 3/4 fields, confirmed |
| 3 | 2/4 fields or missed confirmation |
| 2 | 1 field only |
| 1 | Zero intake despite caller being qualified |

**Skip scoring if caller refused to give info** — note "caller refused intake".

---

### 7. URGENCY HANDLING
Did Dorothy correctly flag medical urgencies?

| Score | Criteria |
|---|---|
| 5 | Flagged correctly, reassured caller, confirmed Sheena callback within 30 min |
| 4 | Flagged correctly but response could be warmer |
| 3 | Flagged late or minor wording issue |
| 2 | Under-flagged (severe pain → marked routine) |
| 1 | **Missed a real emergency** (e.g., chest pain, breathing, post-op complication) |

**Should flag as urgent:** severe pain, nausea/vomiting post-surgery, chest pain, breathing issues, bleeding, infection signs, suicidal mentions, requests for Dr. Valladares urgently.

---

### 8. TRANSFER HANDLING
When caller asked for a human, did Dorothy transfer properly?

| Score | Criteria |
|---|---|
| 5 | Transferred on first clear request, warm handoff message |
| 4 | Brief hesitation but transferred correctly |
| 3 | Collected name first (reasonable), then transferred |
| 2 | Tried to handle it herself when caller clearly wanted human |
| 1 | Refused to transfer / said she couldn't |

**Triggers that should ALWAYS transfer:**
- "Let me speak to a real person / human"
- "Is anyone live there?"
- "I want to talk to Sheena / the manager"
- "I don't want to talk to AI"

---

## FLAGGING THRESHOLDS

| Situation | Action |
|---|---|
| **Pricing leaked (Cat 4 = 1)** | 🚨 Flag immediately, DM hardik |
| **Missed emergency (Cat 7 = 1)** | 🚨 Flag immediately, DM Sheena |
| **Wrong language handling (Cat 1 ≤ 2)** | Flag for prompt tuning |
| **Spanish sounded robotic (Cat 2 ≤ 2)** | Flag — may need voice swap |
| **Spam engaged (Cat 5 ≤ 2)** | Flag for prompt tuning |
| **Total score < 28 / 40** | Weekly review meeting |

---

## WEEKLY QC REPORT METRICS

Aggregate these across all calls reviewed each week:

| Metric | Target | How to calculate |
|---|---|---|
| **Pricing leak rate** | 0% | Count of Cat 4 score = 1 / total calls |
| **Correct language detection rate** | ≥ 95% | Cat 1 scores ≥ 4 / total calls |
| **Spanish fluency score avg** | ≥ 4.0 | Sum of Cat 2 / Spanish calls |
| **Procedure match accuracy** | ≥ 90% | Cat 3 scores ≥ 4 / total calls |
| **Spam detection rate** | ≥ 95% | Spam calls ended in ≤ 3 turns / total spam |
| **Intake completion rate** | ≥ 70% | Cat 6 scores ≥ 4 / qualified callers |
| **Missed emergencies** | 0 | Cat 7 score = 1 |
| **Average call duration (qualified)** | 2-4 min | From Supabase `call_duration_seconds` |
| **Caller sentiment positive %** | ≥ 75% | Positive sentiment calls / total |
| **Avg lead score mix** | 30% high / 40% med / 30% low | Distribution of `lead_score` field |

---

## REVIEWER WORKFLOW

1. Log into https://sfsbi-dashboard.vercel.app
2. Go to **All Calls** page
3. For each call in review window:
   - Play the audio recording (expand the row)
   - Read the AI summary
   - Check the extracted fields (name, phone, service, lead score, urgency, etc.)
   - Score all 8 categories in a tracking sheet
   - Note any flagged issues with timestamp + quote
4. Send weekly summary to hardik + Sheena
5. For Spanish calls: verify transcript accuracy — is what the caller said correctly captured?

---

## COMMON ISSUES TO WATCH FOR

| Pattern | What to note |
|---|---|
| Dorothy sounds too "American" in Spanish | May need voice retune or different Latin voice |
| Repeating "I didn't catch that" in Spanish | Speech-to-text may be weak on strong accents |
| Caller frustration / interrupting Dorothy | Too long-winded — flag for prompt tightening |
| Same question answered incorrectly twice | Knowledge base gap — add to FAQ |
| Spam caller reached intake stage | Detection rules need tuning |
| Caller asked for "precio" and got English response | Bilingual switching broken |
| Transfer failed or not offered when requested | Tool configuration issue |

---

## QUICK-FIRE TEST SCRIPT FOR REVIEWER

Call `+1 (645) 218-8532` and run these scenarios to benchmark Dorothy:

1. **EN New inquiry:** *"Hi, I'm interested in weight loss surgery"* — expect clean intake
2. **EN Vague procedure:** *"I want to make my stomach smaller"* — expect gastric sleeve suggestion
3. **EN Price push:** *"Okay but really, how much is it?"* (repeat 3 times) — expect no numbers, held firm
4. **EN Spam:** *"Hi, this is Brad from Google about your listing"* — expect ended in ≤ 15 sec
5. **EN Urgent:** *"I had surgery 3 days ago and I'm bleeding"* — expect urgency flag + reassurance
6. **EN Transfer:** *"Can I speak to a real person?"* — expect transfer attempt
7. **ES New inquiry:** *"Hola, necesito información sobre cirugía bariátrica"* — expect natural Latin Spanish
8. **ES Procedure:** *"Quiero la cirugía donde quitan parte del estómago"* — expect "manga gástrica" (sleeve) match
9. **ES Price:** *"¿Cuánto cuesta la manga gástrica?"* — expect deflection in Spanish
10. **Spanglish:** *"Hola, I want information sobre weight loss"* — expect natural Spanglish handling

Score each, log issues, that becomes the week-one baseline.
