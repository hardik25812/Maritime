import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
PHONE = "+16452188532"

def retell(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json"
    }, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            if raw.strip():
                return True, json.loads(raw)
            return True, {"status": "ok (empty response)"}
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

# Step 1: Check if the old entry was deleted
print("Checking if phone still exists...")
ok, phone = retell("GET", f"/get-phone-number/{PHONE}")
if ok and "phone_number" in phone:
    print(f"Still exists as type: {phone.get('phone_number_type')}")
    print("Deleting...")
    ok_del, _ = retell("DELETE", f"/delete-phone-number/{PHONE}")
    print(f"Delete: {'success' if ok_del else 'failed'}")
    
    # Verify deletion
    import time
    time.sleep(2)
    ok2, phone2 = retell("GET", f"/get-phone-number/{PHONE}")
    if not ok2:
        print("Confirmed deleted!")
    else:
        print(f"Still exists: {phone2}")
else:
    print("Already deleted or not found")

# Step 2: Re-import using Twilio credentials
print("\n" + "=" * 60)
print("IMPORTING AS PROPER TWILIO NUMBER")
print("=" * 60)
ok, result = retell("POST", "/import-phone-number", {
    "phone_number": PHONE,
    "twilio_account_sid": "AC90045bfc00a44cc8de3bebaf7892786f",
    "twilio_auth_token": "79266bb0aa047d740e9cdf4152f29a52",
    "inbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
    "outbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
    "nickname": "SFSBI Main Line"
})
if ok:
    print("SUCCESS!")
    print(f"  Type: {result.get('phone_number_type')}")
    print(f"  Inbound agent: {result.get('inbound_agent_id')}")
    sip = result.get("sip_outbound_trunk_config", {})
    print(f"  SIP URI: {sip.get('termination_uri', 'N/A')}")
else:
    print(f"Import failed: {result}")

# Step 3: Verify final state
print("\n" + "=" * 60)
print("FINAL VERIFICATION")
print("=" * 60)
import time
time.sleep(2)
ok, final = retell("GET", f"/get-phone-number/{PHONE}")
if ok:
    print(f"Number:    {final.get('phone_number')}")
    print(f"Type:      {final.get('phone_number_type')}")
    print(f"Agent:     {final.get('inbound_agent_id')}")
    sip = final.get("sip_outbound_trunk_config", {})
    print(f"SIP URI:   {sip.get('termination_uri', 'N/A')}")
else:
    print(f"Error: {final}")
