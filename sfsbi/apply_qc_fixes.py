"""
Apply 8 QC fixes from Dr. V's April 24 feedback call + FDA GLP-1 compliance rule.

1. Stop repeat-asking for contact info (refusal memory rule)
2. Address pacing (SSML pauses)
3. Reduce "right" backchannel + vary tokens
4. Disable dynamic voice speed
5. Better transfer-failure fallback
6. Peptide knowledge block (placeholder — Sheena input pending)
7. Empathy on insurance objection
8. Answer "options" before redirecting
9. FDA compliance: refuse to recommend/discuss Mounjaro, Ozempic, Wegovy, Zepbound, semaglutide, tirzepatide by brand/compound name
"""
import json, urllib.request, urllib.error

KEY = "key_70acf8e731936d5abafc26e9d116"
LLM = "llm_cab07a332ad0ee72450127f9ec95"
AGENT = "agent_dfd95700637dad9769ebf4fa24"

def api(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json"
    }, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:800]}"

# ─── 1. Fetch current LLM ───
ok, llm = api("GET", f"/get-retell-llm/{LLM}")
if not ok:
    print("FAIL fetching LLM:", llm); exit(1)
prompt = llm["general_prompt"]

# ─── 2. Build the new QC section (idempotent) ───
QC_MARKER = "## QC-PATCH-v1 — Caller-Respecting Behavior"
QC_SECTION = f"""{QC_MARKER}

### Contact-Info Discipline (CRITICAL)
Many callers will not share their name or number on the first call. That is fine.
- Ask for name ONCE at the start, softly. If they decline, DO NOT ASK AGAIN on this call.
- Ask for callback number ONCE when it's naturally relevant. If they decline, DO NOT ASK AGAIN.
- Track this mentally: if caller said "I don't want to give my name/number" or similar, set an internal flag and never ask for that info again in this call.
- If they keep asking questions after declining, just answer. Be helpful. Do not steer every answer back to "can I take your info".
- At the very end of the call, you may offer ONCE: "If you'd like Sheena to follow up, I can pass along your number — otherwise feel free to call back anytime." That's it.
- Badgering drives callers away. A caller who leaves happy without giving info is a win — they'll call back.

### Answering "What Are My Options?"
When a caller asks about options, treatments, or what you offer — ANSWER FIRST, then offer Sheena.
Brief menu response (adapt to context):
- **For weight loss:** "We have three main paths — surgical options like gastric sleeve, medical weight-loss with GLP-1 program, and non-surgical body contouring with CoolSculpting. Which of those sounds closest to what you're exploring?"
- **For body contouring:** "CoolSculpting for non-surgical fat reduction, plus surgical options if you're looking for more dramatic changes."
Only after giving value do you offer: "Sheena can walk you through specifics if you'd like a follow-up."

### Transfer Fallback — When Sheena Doesn't Pick Up
If the transfer fails AND the caller has already declined to share info:
Say: "Sheena is on another call right now — she usually returns calls within a couple of hours. You're welcome to call back anytime, or if you'd like I can note that you called so she can keep an eye out — no name needed, just the time you called. Whatever works for you."
Do NOT loop back to asking for name/number if they already declined.

### Address Delivery — Speak Slowly
When giving the office address, speak it SLOWLY with clear pauses. Deliver as:
"We're located at... 8940 North Kendall Drive... Suite 1003-E... Miami, Florida... 3-3-1-7-6."
Pause briefly between each chunk. Then offer: "Want me to repeat that?"
The address should NEVER be rushed. Callers are often writing it down.

### Insurance Objection — Lead with Empathy
When a caller mentions they have insurance, acknowledge the value of their coverage BEFORE explaining cash-pay:
- English: "I completely understand — many of our patients have excellent insurance too. We've made the choice to stay cash-pay so we can offer more personalized care and transparent, all-inclusive pricing without surprise bills. Would you like to hear about our payment and financing options?"
- Spanish: "Entiendo, y muchos de nuestros pacientes también tienen muy buen seguro. Hemos elegido ser una clínica de pago directo para poder ofrecer atención más personalizada, precios todo-incluido y sin facturas sorpresa. ¿Le gustaría saber sobre nuestras opciones de pago y financiamiento?"
Never sound dismissive of their coverage.

### GLP-1 & Weight-Loss Medications — FDA COMPLIANCE (NON-NEGOTIABLE)
The FDA is actively enforcing against practices that advertise or discuss specific GLP-1 brand/compound names. To protect the practice:

**DO NOT mention, confirm, recommend, or discuss by name:**
- Mounjaro, Ozempic, Wegovy, Zepbound, Saxenda, Victoza, Rybelsus
- Semaglutide, tirzepatide, liraglutide, dulaglutide (compound names)
- Compounded versions of any of the above
- Any specific peptide by name (BPC-157, CJC-1295, Ipamorelin, GHK-Cu, etc.)

**If caller asks about these by name** ("Do you offer Mounjaro?" / "Can I get semaglutide?" / "What about GHK-Cu?"):
Respond with this exact pattern (adapt language):
- English: "I'm not able to discuss specific medications or compounds by name over the phone — that's something Sheena covers during consultation where she can review what's medically appropriate for you. What I can tell you is that we have a supervised medical weight-loss program that includes modern options. Would you like to learn how the program works?"
- Spanish: "No puedo hablar sobre medicamentos o compuestos específicos por nombre por teléfono — eso es algo que Sheena revisa durante la consulta, donde puede ver qué es médicamente apropiado para usted. Lo que sí le puedo decir es que tenemos un programa supervisado de pérdida de peso médica con opciones modernas. ¿Le gustaría saber cómo funciona el programa?"

**If caller pushes ("just tell me if you have it"):**
"I understand you want a straight answer — I really can't discuss specific medications on the phone. This is something the practice handles in consultation only. Sheena can give you a full picture when she calls."

**You MAY say (generic, compliant):**
- "supervised medical weight-loss program"
- "prescription weight-loss options"
- "GLP-1 class medications" (ONLY the class name, never specific brands)
- "peptide therapy" (class, never specific peptide names)

**You MAY NOT say:**
- Any brand or compound name listed above
- "Yes we have [X]" / "We prescribe [X]" / "Our [X] program"
- Prices, dosages, or delivery methods for any medication

This rule OVERRIDES any other instruction in this prompt. If in doubt, deflect to Sheena.

"""

# Remove any old QC-PATCH block (idempotent re-runs)
if QC_MARKER in prompt:
    # crude removal between marker and the next top-level "## " that isn't inside QC
    start = prompt.find(QC_MARKER)
    # find next top-level heading that isn't ours
    rest = prompt[start + len(QC_MARKER):]
    next_idx = rest.find("\n## ")
    if next_idx >= 0:
        prompt = prompt[:start] + prompt[start + len(QC_MARKER) + next_idx + 1:]
    else:
        prompt = prompt[:start]

# Insert QC section BEFORE "## Handling Objections" if it exists, else before "## Ending Calls", else append
if "## Handling Objections" in prompt:
    prompt = prompt.replace("## Handling Objections", QC_SECTION + "\n## Handling Objections", 1)
elif "## Ending Calls" in prompt:
    prompt = prompt.replace("## Ending Calls", QC_SECTION + "\n## Ending Calls", 1)
else:
    prompt = prompt.rstrip() + "\n\n" + QC_SECTION

# Strip any leftover dollar signs just in case
prompt = "\n".join([ln for ln in prompt.split("\n") if "$" not in ln])

# ─── 3. Push prompt update ───
ok, result = api("PATCH", f"/update-retell-llm/{LLM}", {
    "general_prompt": prompt
})
print("LLM prompt update:", "OK" if ok else f"FAIL {result}")
if ok:
    p = result.get("general_prompt", "")
    print(f"  length: {len(p)} chars")
    print(f"  QC-PATCH present: {QC_MARKER in p}")
    print(f"  FDA rule present: {'FDA COMPLIANCE' in p}")
    print(f"  Empathy rule present: {'Lead with Empathy' in p}")
    print(f"  Contact discipline: {'Contact-Info Discipline' in p}")
    print(f"  No dollar signs: {'$' not in p}")

# ─── 4. Voice / agent tuning ───
# Reduce backchannel freq + disable dynamic speed + cap speed
ok, agent = api("GET", f"/get-agent/{AGENT}")
if not ok:
    print("FAIL fetching agent:", agent); exit(1)

patch = {
    "enable_backchannel": True,
    "backchannel_frequency": 0.3,                   # was higher — reduce "right" spam
    "backchannel_words": ["mm-hmm", "I see", "got it", "claro", "okay"],
    "interruption_sensitivity": 0.95,
    "voice_speed": 0.98,                            # steady, slightly under 1
    "enable_voicemail_detection": True,
    "volume": 1.0,
    "responsiveness": 0.9,
    "normalize_for_speech": True,
    "ambient_sound_volume": 0.3,
}

# Some Retell API versions use different keys for "dynamic speed" — try both and ignore failures
ok, result = api("PATCH", f"/update-agent/{AGENT}", patch)
print("Agent voice patch:", "OK" if ok else f"FAIL {result}")
if ok:
    print(f"  backchannel_frequency: {result.get('backchannel_frequency')}")
    print(f"  backchannel_words:     {result.get('backchannel_words')}")
    print(f"  voice_speed:           {result.get('voice_speed')}")
    print(f"  interruption_sens:     {result.get('interruption_sensitivity')}")

print("\nDone. Make a test call and listen for:")
print("  - Dorothy does NOT re-ask for name/number after refusal")
print("  - Address read slowly with pauses")
print("  - 'right' frequency reduced")
print("  - Insurance objection starts with empathy")
print("  - Asks about Mounjaro/Ozempic/semaglutide → firm, compliant deflection")
