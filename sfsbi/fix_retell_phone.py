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
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

# Step 1: Check current phone config
print("=" * 60)
print("CURRENT RETELL PHONE CONFIG")
print("=" * 60)
ok, phone = retell("GET", f"/get-phone-number/{PHONE}")
if ok:
    print(json.dumps(phone, indent=2))
else:
    print(f"Error: {phone}")

# Step 2: Delete the bad custom phone number
print("\n" + "=" * 60)
print("DELETING BAD CUSTOM PHONE ENTRY")
print("=" * 60)
ok, result = retell("DELETE", f"/delete-phone-number/{PHONE}")
if ok:
    print("Deleted successfully")
else:
    print(f"Delete result: {result}")

# Step 3: Re-import as proper Twilio number using import-phone-number
print("\n" + "=" * 60)
print("RE-IMPORTING AS TWILIO PHONE NUMBER")
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
    print("SUCCESS! Phone imported properly:")
    print(f"  Type: {result.get('phone_number_type')}")
    print(f"  Inbound agent: {result.get('inbound_agent_id')}")
    sip = result.get("sip_outbound_trunk_config", {})
    print(f"  SIP termination URI: {sip.get('termination_uri', 'N/A')}")
    print(f"\n  Full response:")
    print(json.dumps(result, indent=2))
else:
    print(f"Import failed: {result}")
    
    # If import fails, try creating as custom with correct SIP
    print("\nTrying alternative: update existing custom number...")
    ok2, result2 = retell("PATCH", f"/update-phone-number/{PHONE}", {
        "inbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
        "outbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
        "nickname": "SFSBI Main Line"
    })
    if ok2:
        print("Updated phone number:")
        print(json.dumps(result2, indent=2))
    else:
        print(f"Update also failed: {result2}")
