import json, urllib.request

SB = "https://xoxpslsbnkxcthdmfbwn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHBzbHNibmt4Y3RoZG1mYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzgxNjEsImV4cCI6MjA5MTIxNDE2MX0.CjS0V9s9jGTN_qdAZV96fQIEd0GFzQnZKukLxABnffc"

req = urllib.request.Request(
    f"{SB}/rest/v1/call_logs?select=call_id,caller_name,recording_url,received_at,call_duration_seconds&order=received_at.desc&limit=10",
    headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"}
)
data = json.loads(urllib.request.urlopen(req).read().decode())

print(f"Showing {len(data)} most recent calls:\n")
print(f"{'Date':20} | {'Name':20} | {'Dur':5} | {'Recording'}")
print("-" * 90)

has_rec = 0
no_rec = 0
for c in data:
    rec = c.get("recording_url")
    status = "OK" if rec else "MISSING"
    if rec: has_rec += 1
    else: no_rec += 1
    name = (c.get("caller_name") or "-")[:20]
    dt = (c.get("received_at") or "")[:19]
    dur = c.get("call_duration_seconds") or 0
    rec_preview = (rec[:40] + "...") if rec else "(empty)"
    print(f"{dt:20} | {name:20} | {dur:5} | {status:8} {rec_preview}")

print(f"\nTotal with recording: {has_rec} / {len(data)}")
print(f"Total missing: {no_rec} / {len(data)}")
