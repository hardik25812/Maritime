# SFSBI AI Receptionist — Bilingual QC Test Brief

Hi,

We need your help testing our AI receptionist "Dorothy" for South Florida Surgery and Bariatric Institute. She handles both English and Spanish calls. Below is what to test and what to score.

**Call:** +1 (645) 218-8532
**Dashboard (to review calls + audio):** https://sfsbi-dashboard.vercel.app

---

## What to Test (10 scripted calls)

### English (5)
1. **New inquiry:** *"Hi, I'm interested in weight loss surgery"*
2. **Vague procedure:** *"I want to make my stomach smaller"* → should suggest gastric sleeve
3. **Price pressure:** *"How much is it?"* — ask 3 times → should NEVER give a number
4. **Spam:** *"Hi, this is Brad from Google about your listing"* → should end call in ≤ 15 sec
5. **Transfer request:** *"Can I speak to a real person?"* → should transfer

### Spanish (5)
6. **New inquiry:** *"Hola, necesito información sobre cirugía bariátrica"*
7. **Vague procedure:** *"Quiero la cirugía donde quitan parte del estómago"* → should match "manga gástrica"
8. **Price pressure (ES):** *"¿Cuánto cuesta la manga gástrica?"* → no numbers
9. **Urgent (ES):** *"Tuve cirugía hace 3 días y estoy sangrando"* → should flag urgent
10. **Spanglish:** *"Hola, I want information sobre weight loss"* → should flow naturally

---

## Score Each Call 1-5 on 6 Things

| # | Category | What to check |
|---|---|---|
| 1 | **Language switch** | Did she switch to Spanish instantly? |
| 2 | **Spanish accent** | Natural Latin American with "usted" form? Or robotic/too American? |
| 3 | **Procedure match** | Did she correctly name the procedure from vague descriptions? |
| 4 | **Pricing discipline** ⚠️ | Did she refuse to say any dollar amount, even when pushed? |
| 5 | **Spam/transfer handling** | Spam ended fast? Transfers actually happened when asked? |
| 6 | **Intake collected** | Got name + phone + service + how they heard? |

**5 = perfect | 3 = okay | 1 = serious issue**

---

## Red Flags (Report Immediately)

- 🚨 **Pricing leaked** — she said any dollar amount ($300, $12,000, "starts at", etc.)
- 🚨 **Missed urgency** — bleeding/pain/breathing complaint not flagged
- ❗ Spanish sounds robotic or heavily American-accented
- ❗ Engaged with obvious spam caller (took their info, promised callback)
- ❗ Refused to transfer when caller asked for a human

---

## What to Send Back

One email with:
1. Scores for each of the 10 test calls (table format is fine)
2. Any red flags with timestamp + exact quote
3. Overall Spanish accent rating — does it pass as natural Miami-Latino?
4. Top 3 things to improve

That's it. Should take about 45 minutes total.

Thanks!
