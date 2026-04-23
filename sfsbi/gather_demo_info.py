import json, urllib.request

RETELL_KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def api(endpoint):
    req = urllib.request.Request(
        f"https://api.retellai.com{endpoint}",
        headers={"Authorization": f"Bearer {RETELL_KEY}"}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())

print("=" * 60)
print("RETELL AGENT CONFIG")
print("=" * 60)
agent = api(f"/get-agent/{AGENT_ID}")
print(f"Agent Name:     {agent.get('agent_name', '-')}")
print(f"Agent ID:       {AGENT_ID}")
print(f"Voice ID:       {agent.get('voice_id', '-')}")
print(f"Language:       {agent.get('language', '-')}")
print(f"Responsiveness: {agent.get('responsiveness', '-')}")
print(f"Voice Temp:     {agent.get('voice_temperature', '-')}")
print(f"Backchannel:    {agent.get('enable_backchannel', '-')}")
print(f"Ambient Sound:  {agent.get('ambient_sound', '-')}")
print(f"Webhook URL:    {agent.get('webhook_url', '-')}")

# LLM
llm_id = agent.get("response_engine", {}).get("llm_id") or agent.get("llm_id", "")
print(f"LLM ID:         {llm_id}")

# Post-call analysis fields
pcf = agent.get("post_call_analysis_data", [])
print(f"\nPost-Call Analysis Fields ({len(pcf)}):")
for f in pcf:
    print(f"  - {f.get('name', '?')} ({f.get('type', '?')}): {f.get('description', '')[:80]}")

print("\n" + "=" * 60)
print("RETELL PHONE NUMBER")
print("=" * 60)
phones = api("/list-phone-numbers")
for p in phones:
    if "+16452188532" in str(p.get("phone_number", "")):
        print(f"Number:    {p.get('phone_number')}")
        print(f"Type:      {p.get('phone_number_type')}")
        print(f"Agent:     {p.get('inbound_agent_id')}")
        print(f"SIP URI:   {p.get('sip_trunk_termination_uri')}")

# Get LLM prompt
if llm_id:
    print("\n" + "=" * 60)
    print("LLM / SYSTEM PROMPT")
    print("=" * 60)
    llm = api(f"/get-retell-llm/{llm_id}")
    print(f"Model:       {llm.get('model', '-')}")
    print(f"Temperature: {llm.get('model_temperature', '-')}")
    prompt = llm.get("general_prompt", "")
    print(f"Prompt length: {len(prompt)} chars")
    print(f"Begin message: {llm.get('begin_message', '-')}")
    # Count sections
    sections = [l for l in prompt.split("\n") if l.startswith("## ")]
    print(f"Prompt sections: {len(sections)}")
    for s in sections:
        print(f"  {s}")

# Supabase call count
print("\n" + "=" * 60)
print("SUPABASE DATA")
print("=" * 60)
SUPABASE_URL = "https://xoxpslsbnkxcthdmfbwn.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHBzbHNibmt4Y3RoZG1mYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzgxNjEsImV4cCI6MjA5MTIxNDE2MX0.CjS0V9s9jGTN_qdAZV96fQIEd0GFzQnZKukLxABnffc"
url = f"{SUPABASE_URL}/rest/v1/call_logs?select=count"
req = urllib.request.Request(url, headers={
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Prefer": "count=exact"
})
with urllib.request.urlopen(req) as r:
    count_header = r.headers.get("content-range", "")
    rows = json.loads(r.read().decode())
    print(f"Total call logs: {count_header}")

print("\n" + "=" * 60)
print("LIVE URLS")
print("=" * 60)
print(f"Dashboard:    https://sfsbi-dashboard.vercel.app")
print(f"n8n WF1:      https://n8n.srv1546601.hstgr.cloud/workflow/y2W0q5h4WIG0tBTh")
print(f"n8n WF2:      https://n8n.srv1546601.hstgr.cloud/workflow/4ZdkoKrWd5tG0cIF")
print(f"n8n WF3:      https://n8n.srv1546601.hstgr.cloud/workflow/nnAZYMRIJzbEs5aV")
print(f"Retell Agent: https://app.retellai.com/agents/{AGENT_ID}")
print(f"Twilio Phone: +16452188532")
print(f"Supabase:     https://supabase.com/dashboard/project/xoxpslsbnkxcthdmfbwn")
