import json, urllib.request

SUPABASE_URL = "https://xoxpslsbnkxcthdmfbwn.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHBzbHNibmt4Y3RoZG1mYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzgxNjEsImV4cCI6MjA5MTIxNDE2MX0.CjS0V9s9jGTN_qdAZV96fQIEd0GFzQnZKukLxABnffc"

url = f"{SUPABASE_URL}/rest/v1/call_logs?order=received_at.desc&limit=5"
req = urllib.request.Request(url, headers={
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}"
})

with urllib.request.urlopen(req) as r:
    rows = json.loads(r.read().decode())
    print(f"Total rows returned: {len(rows)}")
    if len(rows) == 0:
        print("\nNO CALLS LOGGED IN SUPABASE!")
        print("The n8n WF1 webhook may not be firing after calls.")
    for row in rows:
        summary = str(row.get("call_summary", "-"))
        if len(summary) > 100:
            summary = summary[:100] + "..."
        print(f"\nCall ID:   {row.get('call_id', '-')}")
        print(f"Name:      {row.get('caller_name', '-')}")
        print(f"Phone:     {row.get('caller_phone', '-')}")
        print(f"Service:   {row.get('service_interest', '-')}")
        print(f"Lead:      {row.get('lead_score', '-')}")
        print(f"Duration:  {row.get('call_duration_seconds', 0)}s")
        print(f"Received:  {row.get('received_at', '-')}")
        print(f"Summary:   {summary}")
