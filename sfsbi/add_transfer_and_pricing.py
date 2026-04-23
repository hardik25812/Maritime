import json, urllib.request, urllib.error

KEY = "key_70acf8e731936d5abafc26e9d116"
LLM = "llm_cab07a332ad0ee72450127f9ec95"

# PLACEHOLDER — swap this with Sheena's real number when received
SHEENA_NUMBER = "+16452188532"  # PLACEHOLDER — using SFSBI Twilio num. Replace with Sheena's real cell when received.

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
        return False, f"{e.code}: {e.read().decode()[:500]}"

# Fetch current LLM
ok, llm = api("GET", f"/get-retell-llm/{LLM}")
if not ok:
    print(f"FAIL: {llm}"); exit(1)

prompt = llm["general_prompt"]

# ─────────────────────────────────────────
# 1. Strengthen pricing refusal for insistent callers
# ─────────────────────────────────────────
INSIST_SECTION = """## Pricing — When Caller Insists
If a caller pushes back and keeps asking for prices after your first deflection, hold the line politely but firmly. Never give numbers, even under pressure.

**Escalation ladder (use in order):**
1. First ask: "Pricing depends on your specific needs. Sheena will walk you through exact costs when she calls you back. Can I get your name and number?"
2. If they push again: "I understand you want to know upfront. Our pricing is customized based on your consultation — body composition, goals, and which option fits you best. Sheena can usually call back the same day with exact numbers. What's the best number to reach you?"
3. If they still insist: "I'm not able to share pricing on this call — that's something Sheena handles directly so you get accurate information for your situation. If you'd like to know costs, leaving your number is the fastest way."
4. If they refuse to leave info and only want prices: "I completely understand. The best next step is for Sheena to give you a call — she's usually available within a few hours. Would that work?"
5. If they still won't give info: Close warmly — "No problem at all. You're welcome to call back anytime. Have a great day."

NEVER say: "It costs around..." / "Starting at..." / "Ballpark..." / any dollar figure.
NEVER cave under pressure. Sheena handles all pricing personally. This is firm.

"""

if "## Pricing — When Caller Insists" not in prompt:
    # Insert before "## Handling Objections"
    prompt = prompt.replace("## Handling Objections", INSIST_SECTION + "## Handling Objections")
    print("Added pricing insistence section")

# ─────────────────────────────────────────
# 2. Add call transfer section
# ─────────────────────────────────────────
TRANSFER_SECTION = f"""## Call Transfer to Sheena
You CAN transfer calls to Sheena when appropriate. Use the `transfer_to_sheena` function.

**Transfer the call when caller says:**
- "I want to speak to a real person / human"
- "Can I talk to someone / the manager / the owner"
- "Put me through to Sheena"
- "I don't want to talk to an AI"
- "Is there someone live I can speak with?"
- Patient with urgent medical concern (also set urgency_flag)
- Existing patient calling about a scheduled procedure or recovery issue

**How to transfer:**
1. Acknowledge warmly: "Of course, let me get you to Sheena right now."
2. Briefly confirm name if not already collected: "Who should I tell her is calling?"
3. Call the `transfer_to_sheena` function.
4. Stay on briefly in case the transfer fails.

**If transfer fails (Sheena doesn't pick up or line busy):**
"Looks like Sheena is on another call. Let me take your name and number — I'll make sure she calls you right back. What's the best number?"
Then collect intake and set wants_human = true so she knows to prioritize.

**Don't transfer:**
- Spam/sales calls (handle per Spam section — end the call)
- Simple questions you can answer (services, hours, general info)
- Callers who haven't indicated they want a person

"""

if "## Call Transfer to Sheena" not in prompt:
    prompt = prompt.replace("## Ending Calls", TRANSFER_SECTION + "## Ending Calls")
    print("Added call transfer section")

# Remove the old "Never transfer" line from NEVER section
prompt = prompt.replace(
    "- Never transfer calls (we have no transfer capability)\n",
    ""
)
prompt = prompt.replace(
    "- Never transfer calls (we have no transfer capability)",
    ""
)

# ─────────────────────────────────────────
# 3. Update LLM with new prompt + transfer tool
# ─────────────────────────────────────────
existing_tools = llm.get("general_tools", []) or []
# Remove any old transfer_to_sheena tool (we'll re-add fresh)
existing_tools = [t for t in existing_tools if t.get("name") != "transfer_to_sheena"]

transfer_tool = {
    "type": "transfer_call",
    "name": "transfer_to_sheena",
    "description": "Transfer the call to Sheena, the office coordinator, when the caller requests to speak with a human, manager, or specific person.",
    "transfer_destination": {
        "type": "predefined",
        "number": SHEENA_NUMBER
    },
    "transfer_option": {
        "type": "cold_transfer",
        "public_handoff_option": {
            "message": "Connecting you to Sheena now, one moment please."
        }
    }
}

existing_tools.append(transfer_tool)

ok, result = api("PATCH", f"/update-retell-llm/{LLM}", {
    "general_prompt": prompt,
    "general_tools": existing_tools
})

if ok:
    print("\nLLM updated successfully")
    p = result.get("general_prompt", "")
    tools = result.get("general_tools", [])
    print(f"Prompt length: {len(p)} chars")
    print(f"Tools count: {len(tools)}")
    for t in tools:
        print(f"  - {t.get('name')} ({t.get('type')})")
    print(f"\n  Pricing insist section: {'OK' if '## Pricing — When Caller Insists' in p else 'MISSING'}")
    print(f"  Transfer section:       {'OK' if '## Call Transfer to Sheena' in p else 'MISSING'}")
    print(f"  Old 'never transfer' removed: {'OK' if 'Never transfer calls' not in p else 'STILL THERE'}")
    print(f"  No dollar signs:        {'OK' if '$' not in p else 'FAIL - has $'}")
else:
    print(f"FAIL: {result}")

print(f"\nNOTE: Transfer number is placeholder {SHEENA_NUMBER}")
print("      Run update_sheena_number.py once you get the real number")
