import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
LLM_ID = "llm_cab07a332ad0ee72450127f9ec95"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def api(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json"
    }, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

# Get current prompt
ok, llm = api("GET", f"/get-retell-llm/{LLM_ID}")
if not ok:
    print(f"Failed to get LLM: {llm}")
    exit(1)

old_prompt = llm["general_prompt"]

# Fix 1: Add name identity to the Identity section
new_prompt = old_prompt.replace(
    "## Identity\nYou are the AI receptionist for South Florida Surgery",
    "## Identity\nYour name is Dorothy. Always use this name when asked. You are the receptionist for South Florida Surgery"
)

# Fix 2: Update the NEVER section to handle "are you real?" better
new_prompt = new_prompt.replace(
    '- Never say "I\'m just an AI" or mention you\'re not human',
    '- Never say "I\'m just an AI" or mention you\'re not human\n- If asked your name, say "I\'m Dorothy" — nothing more\n- If asked "are you a real person?", say "I\'m Dorothy, the receptionist here. How can I help you today?" and redirect'
)

print("=" * 60)
print("PROMPT DIFF")
print("=" * 60)
# Show changed lines
old_lines = old_prompt.split("\n")
new_lines = new_prompt.split("\n")
for i, (o, n) in enumerate(zip(old_lines, new_lines)):
    if o != n:
        print(f"Line {i+1}:")
        print(f"  OLD: {o}")
        print(f"  NEW: {n}")
# Show extra lines
if len(new_lines) > len(old_lines):
    for i in range(len(old_lines), len(new_lines)):
        print(f"Line {i+1} (added): {new_lines[i]}")

# Update LLM with fixed prompt
print("\n" + "=" * 60)
print("UPDATING LLM PROMPT")
print("=" * 60)
ok, result = api("PATCH", f"/update-retell-llm/{LLM_ID}", {
    "general_prompt": new_prompt,
    "model_temperature": 0.2  # Lower from 0.3 for more consistent responses
})
if ok:
    print("LLM prompt updated!")
    print(f"  Model temp: {result.get('model_temperature')}")
    print(f"  Prompt length: {len(result.get('general_prompt', ''))}")
else:
    print(f"LLM update failed: {result}")

# Optimize agent for lower latency
print("\n" + "=" * 60)
print("OPTIMIZING AGENT FOR LATENCY")
print("=" * 60)
ok, agent = api("PATCH", f"/update-agent/{AGENT_ID}", {
    "responsiveness": 1.0,       # Was 0.9 — faster response
    "voice_temperature": 0.5,    # Was 0.7 — more consistent = faster TTS
    "enable_dynamic_responsiveness": True,
    "opt_out_sensitive_data_storage": False,
    "normalize_for_speech": True
})
if ok:
    print("Agent optimized!")
    print(f"  Responsiveness: {agent.get('responsiveness')}")
    print(f"  Voice temp: {agent.get('voice_temperature')}")
else:
    print(f"Agent update failed: {agent}")

print("\nDone! Dorothy will now say her name when asked, and latency should improve.")
