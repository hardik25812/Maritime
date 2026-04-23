import json, urllib.request, urllib.error

RETELL_KEY = "key_70acf8e731936d5abafc26e9d116"
LLM_ID = "llm_cab07a332ad0ee72450127f9ec95"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def api(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {RETELL_KEY}",
        "Content-Type": "application/json"
    }, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:400]}"

# ─────────────────────────────────────────────────────
# FIX 1: VOICE — Switch to Latin America Spanish localized voice
# ─────────────────────────────────────────────────────
print("=" * 60)
print("FIX 1: Updating voice to Latin America Spanish localized")
print("=" * 60)
ok, result = api("PATCH", f"/update-agent/{AGENT_ID}", {
    "voice_id": "11labs-Hailey-Latin-America-Spanish-localized",
    "voice_model": "eleven_turbo_v2_5",  # Multilingual turbo for EN + ES
    "language": "multi",  # Multi-language mode
})
if ok:
    print(f"  Voice: {result.get('voice_id')}")
    print(f"  Voice model: {result.get('voice_model')}")
    print(f"  Language: {result.get('language')}")
else:
    print(f"  Failed, trying fallback: {result}")
    # Fallback: try without language=multi
    ok, result = api("PATCH", f"/update-agent/{AGENT_ID}", {
        "voice_id": "11labs-Hailey-Latin-America-Spanish-localized",
        "voice_model": "eleven_turbo_v2_5",
    })
    if ok:
        print(f"  Voice updated (fallback): {result.get('voice_id')}")
    else:
        print(f"  Fallback also failed: {result}")

# ─────────────────────────────────────────────────────
# FIX 2, 3, 4: Update system prompt
# ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("FIXES 2-4: Updating system prompt")
print("=" * 60)

ok, llm = api("GET", f"/get-retell-llm/{LLM_ID}")
if not ok:
    print(f"Failed to get LLM: {llm}")
    exit(1)

prompt = llm["general_prompt"]

# ── FIX 3: Remove pricing section entirely ──
import re
# Remove the Pricing & Services section and BMI section we added previously
prompt = re.sub(
    r"## Pricing & Services.*?(?=## )",
    "",
    prompt,
    flags=re.DOTALL
)

# Update pricing objection response — NO numbers at all
prompt = prompt.replace(
    'Price concerns: Give the ballpark range for their service of interest from the Pricing section, then say "That\'s all-inclusive — Sheena will walk you through exact costs and payment options on your call."',
    'Price concerns: NEVER give any prices, ranges, or numbers. Say: "Pricing depends on your specific needs and goals. Sheena will go over all the details — including what\'s included and payment options — when she calls you back. Can I get your name and number so she can reach you?"'
)

# ── FIX 2: Add procedure matching section ──
PROCEDURE_MATCHING = """## Procedure Matching — IMPORTANT
Many callers describe their goal WITHOUT knowing the procedure name. Listen for keywords and guide them to the right service. NEVER make them feel bad for not knowing — be warm and helpful.

**When caller says... → Guide them toward:**
- "I need to lose a lot of weight" / "I want weight loss surgery" → Bariatric consultation (sleeve, balloon, or band — Sheena decides based on BMI)
- "Remove part of my stomach" / "make my stomach smaller" → Gastric Sleeve
- "Put a band on my stomach" / "band surgery" → Lap-Band
- "Balloon in my stomach" / "non-surgical weight loss" → Orbera Balloon
- "Weight loss shots" / "Ozempic" / "Wegovy" / "Mounjaro" → GLP-1 medical weight loss program
- "Diet pills" / "appetite suppressant" → Phentermine program
- "Fat burner" / "energy shot" → B12 or MIC injections
- "Freeze fat" / "non-surgical fat removal" / "body contouring" → CoolSculpting
- "I had surgery before but gained weight back" / "revision" → Revision procedure

**How to respond when they describe symptoms/goals:**
Acknowledge their goal, name the procedure they're describing, briefly confirm it's what we offer, then move to intake:
"Got it — sounds like you're thinking about a gastric sleeve. That's one of our most popular procedures. Let me get your info so Sheena can walk you through the details. What's your name?"

Never assume — if ambiguous, ask ONE clarifying question: "Just so I point you in the right direction — are you thinking surgical, or something non-surgical like medication or a balloon?"

"""

# ── FIX 4: Spam/cold call handling ──
SPAM_HANDLING = """## Spam & Cold Call Detection — HANG UP QUICKLY
Detect and end spam calls FAST. Set is_spam = true and end the call within 2-3 exchanges.

**Red flags that indicate spam/sales/cold call:**
- "This is [Name] calling from [Company you don't recognize]"
- "I'm reaching out about your [Google listing / website / SEO / insurance / medical billing]"
- "Do you have a moment to discuss [business service]?"
- "I represent [vendor/agency/service provider]"
- Asking for "the owner" or "the person who handles marketing/IT/billing"
- Selling software, SEO services, insurance, medical billing, Google ads, web design
- Pre-recorded voice or obvious script reading
- Strong background call-center noise with multiple voices
- Claims of "your listing has issues" or "we noticed you need..."

**How to handle:**
1. First hint of spam → ask ONE qualifying question: "Are you calling about a medical appointment or service for yourself?"
2. If they confirm it's a sales/business call → respond ONCE firmly: "We're not interested in any vendor or sales calls. This line is for patients only. Have a good day." → then END the call immediately.
3. Set is_spam = true, call_outcome = "spam", urgency_flag = "routine"
4. Do NOT engage further. Do NOT take their info. Do NOT transfer. Do NOT promise a callback.

**If uncertain (could be legitimate patient):**
Give benefit of the doubt ONCE: "Who are you trying to reach?" — if they still sound like a sales pitch, end the call.

**Never:**
- Never let a spam call go on more than 3 exchanges
- Never say "let me transfer you to Sheena" to a spam caller
- Never collect name/number from an obvious sales call
- Never apologize to a spammer ("sorry but...") — just be firm and end it

"""

# Insert procedure matching BEFORE "## Urgency" section
if "## Procedure Matching" not in prompt:
    prompt = prompt.replace("## Urgency", PROCEDURE_MATCHING + "## Urgency")
    print("  Added Procedure Matching section")

# Insert spam handling BEFORE "## After Hours"
if "## Spam & Cold Call Detection" not in prompt:
    prompt = prompt.replace("## After Hours", SPAM_HANDLING + "## After Hours")
    print("  Added Spam Detection section")

# Update NEVER section for extra pricing safety
prompt = prompt.replace(
    "- Never quote exact prices (only Sheena discusses pricing)",
    "- NEVER mention ANY prices, costs, dollar amounts, or ranges — not even ballparks. All pricing discussions belong to Sheena."
)

# Strengthen bilingual section for Latin American Spanish
prompt = prompt.replace(
    "## Bilingual — Spanish\nIf caller speaks Spanish, respond in fluent Spanish immediately. Set language_used = \"spanish\". Use natural, warm tone — \"Claro,\" \"Perfecto,\" \"Con mucho gusto.\"",
    '''## Bilingual — Spanish (Latin American)
If caller speaks Spanish, switch to fluent Latin American Spanish IMMEDIATELY — no translation-speak, no formal Castilian. Set language_used = "spanish".
Use warm, natural Latin American expressions:
- "Claro que sí" / "Con mucho gusto" / "Perfecto"
- "Dígame" / "Cuénteme" (instead of formal "dime")
- "¿En qué le puedo ayudar?" (formal "usted" form — respectful, South Florida style)
- Use "usted" form throughout — it's professional and matches Miami Latino culture
- Natural pace — don't over-enunciate, speak like a Miami receptionist would
- If caller switches between English and Spanish (Spanglish), follow their lead naturally'''
)

print(f"\n  New prompt length: {len(prompt)} chars")

ok, result = api("PATCH", f"/update-retell-llm/{LLM_ID}", {
    "general_prompt": prompt
})
if ok:
    p = result.get("general_prompt", "")
    print("  Prompt updated")
    checks = {
        "Pricing removed": "GLP-1" not in p and "$300" not in p and "$12,000" not in p,
        "Procedure Matching present": "## Procedure Matching" in p,
        "Spam Detection present": "## Spam & Cold Call Detection" in p,
        "Latin American Spanish": "Latin American" in p,
        "Strong pricing ban": "NEVER mention ANY prices" in p,
    }
    for k, v in checks.items():
        print(f"    {'OK' if v else 'MISSING'}: {k}")
else:
    print(f"  Failed: {result}")

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)
print("Call +16452188532 to test:")
print("  1. Spanish accent — say 'Hola, necesito información' → should sound Latin American")
print("  2. Vague procedure — say 'I need to make my stomach smaller' → should suggest gastric sleeve")
print("  3. Price question — ask 'how much does surgery cost?' → should redirect to Sheena, no numbers")
print("  4. Spam test — say 'Hi, I'm calling from Google about your listing' → should hang up quickly")
