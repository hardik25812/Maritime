import json, urllib.request, urllib.error

RETELL_KEY = "key_70acf8e731936d5abafc26e9d116"
LLM_ID = "llm_cab07a332ad0ee72450127f9ec95"

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
        return False, e.read().decode()

ok, llm = api("GET", f"/get-retell-llm/{LLM_ID}")
if not ok:
    print(f"Failed: {llm}")
    exit(1)

prompt = llm["general_prompt"]

# ── PRICING SECTION (replaces vague "Sheena discusses pricing" references) ──
PRICING_SECTION = """
## Pricing & Services — REFERENCE ONLY (never quote without context)
Use this to answer general "how much does it cost?" questions with ballpark ranges.
Always say "these are starting prices — Sheena will give you exact costs on your consultation call."

**Weight Loss Medications (monthly):**
- GLP-1 injections: starts at $300/month
- Phentermine: starts at $150/month
- B12 injections: $20/week
- MIC fat burner (lipotropic): $10/week

**Surgical Procedures:**
- Orbera Balloon: $6,500–$7,000
- Gastric Band (Lap-Band): $10,000–$12,000
- Gastric Sleeve: $12,000–$16,500
- Revision Procedures: starts at $11,000

**Body Contouring:**
- CoolSculpting: ~$400 per area per session

All surgical pricing is all-inclusive. We are cash-pay only — no insurance, no surprise bills.
Payment plans and HSA/FSA accepted.

## BMI Qualification Guidelines
Use these ONLY if caller asks "do I qualify?" or mentions their BMI.
Do NOT volunteer this info unprompted.

- **Orbera Balloon:** BMI 30–40
- **Lap-Band:** BMI 30–40
- **Gastric Sleeve:**
  - BMI 30–35 WITH health conditions (diabetes, hypertension, sleep apnea)
  - BMI 35–55 WITHOUT conditions
- **Unsure?** Say: "Based on what you've described, you may be a candidate — Sheena can confirm on your consultation call."
- If BMI is below minimum: "We'd recommend starting with our medical weight loss program — GLP-1 or Phentermine — and reassessing once you're closer to the surgical range."

"""

# Insert BEFORE the "## Handling Objections" section
if "## Pricing & Services" not in prompt:
    prompt = prompt.replace("## Handling Objections", PRICING_SECTION + "## Handling Objections")
    print("Inserted pricing + BMI section")
else:
    print("Pricing section already exists — skipping insert")

# Also update the pricing objection response to reference real numbers
prompt = prompt.replace(
    'Price concerns: "Our pricing is all-inclusive with no hidden fees. Sheena can go over exact costs and payment plans when she calls you back."',
    'Price concerns: Give the ballpark range for their service of interest from the Pricing section, then say "That\'s all-inclusive — Sheena will walk you through exact costs and payment options on your call."'
)

print(f"New prompt length: {len(prompt)} chars")

ok, result = api("PATCH", f"/update-retell-llm/{LLM_ID}", {
    "general_prompt": prompt
})

if ok:
    print("Prompt updated successfully!")
    print(f"Model: {result.get('model')}")
    print(f"Prompt length: {len(result.get('general_prompt', ''))} chars")
    # Confirm BMI section is in there
    if "BMI Qualification" in result.get("general_prompt", ""):
        print("BMI section confirmed in prompt")
    if "GLP-1" in result.get("general_prompt", ""):
        print("Pricing section confirmed in prompt")
else:
    print(f"Update failed: {result}")
