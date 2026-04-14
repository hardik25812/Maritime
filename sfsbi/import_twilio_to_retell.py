"""
Import Twilio number +16452188532 into Retell and assign to SFSBI agent
"""
import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
RETELL_AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

TWILIO_ACCOUNT_SID = "AC90045bfc00a44cc8de3bebaf7892786f"
TWILIO_AUTH_TOKEN = "39b6ffb195be67ab0969f00611f26f24"
TWILIO_PHONE_NUMBER = "+16452188532"

def retell_request(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        url, data=body,
        headers={
            "Authorization": f"Bearer {RETELL_API_KEY}",
            "Content-Type": "application/json"
        },
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return False, e.read().decode()

print("=" * 60)
print("Importing Twilio number into Retell...")
print("=" * 60)

ok, result = retell_request("POST", "/import-phone-number", {
    "phone_number": TWILIO_PHONE_NUMBER,
    "phone_number_type": "twilio",
    "twilio_account_sid": TWILIO_ACCOUNT_SID,
    "twilio_auth_token": TWILIO_AUTH_TOKEN,
    "inbound_agent_id": RETELL_AGENT_ID,
    "termination_uri": "https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended",
})

if ok:
    print(f"\n✓ SUCCESS: {TWILIO_PHONE_NUMBER} imported to Retell")
    print(f"✓ Assigned to agent: {RETELL_AGENT_ID}")
    print(f"\nRetell response:")
    print(json.dumps(result, indent=2))
else:
    # May already exist — try updating
    print(f"\n⚠ Import failed (may already exist): {result[:300]}")
    print("\nTrying to update existing number assignment...")
    
    ok2, result2 = retell_request(
        "PATCH",
        f"/update-phone-number/{urllib.parse.quote(TWILIO_PHONE_NUMBER)}",
        {"inbound_agent_id": RETELL_AGENT_ID}
    )
    
    if ok2:
        print(f"✓ Number assignment updated to agent {RETELL_AGENT_ID}")
        print(json.dumps(result2, indent=2))
    else:
        print(f"✗ Update also failed: {result2[:300]}")

print("\n" + "=" * 60)
print("NEXT STEP: Configure Twilio Voice webhook")
print("=" * 60)
print(f"\n1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming/{TWILIO_PHONE_NUMBER}")
print(f"2. Under 'Voice Configuration' → 'A Call Comes In':")
print(f"   URL: https://api.retellai.com/twilio-voice-webhook/{RETELL_AGENT_ID}")
print(f"   Method: HTTP POST")
print(f"3. Click 'Save configuration'")
print(f"\nThen test by calling: {TWILIO_PHONE_NUMBER}")
