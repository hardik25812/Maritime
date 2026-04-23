import json, urllib.request, urllib.error

KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def api(method, endpoint, data=None):
    req = urllib.request.Request(
        f"https://api.retellai.com{endpoint}",
        data=json.dumps(data).encode() if data else None,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        method=method
    )
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:400]}"

# Enable signed URL for recording + ensure webhook events include call_ended with recording
updates = {
    "opt_in_signed_url": True,   # ensures recording_url in webhook is a signed playable URL
    "webhook_url": "https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended",
    "enable_transcription_formatting": True,  # cleaner transcript output
}

ok, result = api("PATCH", f"/update-agent/{AGENT_ID}", updates)
if ok:
    print("Recording URL (signed) enabled:")
    print(f"  opt_in_signed_url: {result.get('opt_in_signed_url')}")
    print(f"  webhook_url: {result.get('webhook_url')}")
    print(f"  enable_transcription_formatting: {result.get('enable_transcription_formatting')}")
else:
    print(f"FAIL: {result}")
