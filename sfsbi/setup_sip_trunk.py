import json, urllib.request, urllib.error, urllib.parse, base64, time

TWILIO_SID = "AC90045bfc00a44cc8de3bebaf7892786f"
TWILIO_TOKEN = "79266bb0aa047d740e9cdf4152f29a52"
RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
PHONE = "+16452188532"
PHONE_SID = "PNfbe1b85cc5685d66c36b829769e8df23"

creds = base64.b64encode(f"{TWILIO_SID}:{TWILIO_TOKEN}".encode()).decode()
twilio_headers = {"Authorization": f"Basic {creds}", "Content-Type": "application/x-www-form-urlencoded"}

def twilio_post(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, headers=twilio_headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

def twilio_get(url):
    req = urllib.request.Request(url, headers={"Authorization": f"Basic {creds}"})
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

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
            return True, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:500]}"

# ============================================================
# STEP 1: Create Elastic SIP Trunk
# ============================================================
print("STEP 1: Creating Elastic SIP Trunk...")
ok, trunk = twilio_post(
    f"https://trunking.twilio.com/v1/Trunks",
    {"FriendlyName": "SFSBI-Retell-SIP-Trunk", "Secure": "false"}
)
if ok:
    trunk_sid = trunk["sid"]
    print(f"  Trunk SID: {trunk_sid}")
else:
    print(f"  Error: {trunk}")
    exit(1)

time.sleep(1)

# ============================================================
# STEP 2: Set Origination URI (inbound → Retell SIP server)
# ============================================================
print("\nSTEP 2: Setting Origination URI to sip:sip.retellai.com...")
ok, orig = twilio_post(
    f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}/OriginationUrls",
    {
        "FriendlyName": "Retell-SIP-Inbound",
        "SipUrl": "sip:sip.retellai.com",
        "Priority": "1",
        "Weight": "1",
        "Enabled": "true"
    }
)
if ok:
    print(f"  Origination URL set: {orig.get('sip_url')}")
else:
    print(f"  Error: {orig}")

time.sleep(1)

# ============================================================
# STEP 3: Set Termination (for outbound) + IP whitelist
# ============================================================
print("\nSTEP 3: Setting Termination...")
# First check existing termination
ok, term_check = twilio_get(f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}/Termination")
if ok:
    print(f"  Current termination URI: {term_check.get('sip_url', 'not set')}")

# Set termination SIP URL
ok, term = twilio_post(
    f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}/Termination",
    {"SipUrl": f"{trunk_sid}.pstn.twilio.com"}
)
if ok:
    termination_uri = term.get("sip_url", f"{trunk_sid}.pstn.twilio.com")
    print(f"  Termination URI: {termination_uri}")
else:
    # Use the standard format
    termination_uri = f"{trunk_sid}.pstn.twilio.com"
    print(f"  Termination setup: {term}")
    print(f"  Using default URI: {termination_uri}")

time.sleep(1)

# ============================================================
# STEP 4: Whitelist Retell SIP IPs (CIDR: 18.98.16.120/30)
# ============================================================
print("\nSTEP 4: Whitelisting Retell SIP IPs...")
# Create an IP Access Control List
ok, acl = twilio_post(
    f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/SIP/IpAccessControlLists.json",
    {"FriendlyName": "Retell-SIP-Whitelist"}
)
if ok:
    acl_sid = acl["sid"]
    print(f"  ACL SID: {acl_sid}")
    
    # Add Retell IPs (18.98.16.120/30 = .120, .121, .122, .123)
    for ip in ["18.98.16.120", "18.98.16.121", "18.98.16.122", "18.98.16.123"]:
        ok_ip, _ = twilio_post(
            f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/SIP/IpAccessControlLists/{acl_sid}/IpAddresses.json",
            {"FriendlyName": f"Retell-{ip}", "IpAddress": ip, "CidrPrefixLength": "32"}
        )
        print(f"  Added IP {ip}: {'OK' if ok_ip else 'skip'}")
    
    # Associate ACL with trunk
    ok_assoc, _ = twilio_post(
        f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}/IpAccessControlLists",
        {"IpAccessControlListSid": acl_sid}
    )
    print(f"  ACL linked to trunk: {'OK' if ok_assoc else 'already linked'}")
else:
    print(f"  ACL error: {acl}")

time.sleep(1)

# ============================================================
# STEP 5: Move phone number to SIP Trunk
# ============================================================
print("\nSTEP 5: Moving +16452188532 to SIP Trunk...")
ok, moved = twilio_post(
    f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}/PhoneNumbers",
    {"PhoneNumberSid": PHONE_SID}
)
if ok:
    print(f"  Number assigned to trunk: OK")
else:
    print(f"  Error: {moved}")

time.sleep(2)

# ============================================================
# STEP 6: Get the actual termination URI
# ============================================================
print("\nSTEP 6: Getting termination URI...")
ok, trunk_info = twilio_get(f"https://trunking.twilio.com/v1/Trunks/{trunk_sid}")
if ok:
    term_uri_full = trunk_info.get("termination_sip_uri", "")
    print(f"  Full termination URI: {term_uri_full}")
    if term_uri_full:
        termination_uri = term_uri_full
else:
    print(f"  Could not get trunk info: {trunk_info}")

# ============================================================  
# STEP 7: Import phone number to Retell with termination URI
# ============================================================
print(f"\nSTEP 7: Importing to Retell with termination URI: {termination_uri}")
ok, result = retell("POST", "/import-phone-number", {
    "phone_number": PHONE,
    "termination_uri": termination_uri,
    "inbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
    "outbound_agent_id": "agent_dfd95700637dad9769ebf4fa24",
    "nickname": "SFSBI Main Line"
})
if ok:
    print(f"  SUCCESS!")
    print(f"  Type: {result.get('phone_number_type')}")
    print(f"  Inbound agent: {result.get('inbound_agent_id')}")
    sip = result.get("sip_outbound_trunk_config", {})
    print(f"  SIP term URI: {sip.get('termination_uri', 'N/A')}")
else:
    print(f"  Import failed: {result}")

# ============================================================
# STEP 8: Final verification
# ============================================================
print("\n" + "=" * 60)
print("FINAL VERIFICATION")
print("=" * 60)
time.sleep(2)
ok, final = retell("GET", f"/get-phone-number/{PHONE}")
if ok:
    print(f"Number:  {final.get('phone_number')}")
    print(f"Type:    {final.get('phone_number_type')}")
    print(f"Agent:   {final.get('inbound_agent_id')}")
    sip = final.get("sip_outbound_trunk_config", {})
    print(f"SIP URI: {sip.get('termination_uri', 'N/A')}")
    print("\nDONE! Now call +16452188532 to test.")
else:
    print(f"Error: {final}")

print(f"\n*** IMPORTANT ***")
print(f"After running this, the Twilio Voice webhook is NO LONGER NEEDED.")
print(f"The SIP trunk handles routing directly. You can clear the Voice URL in Twilio Console.")
print(f"Calls route: Twilio → SIP Trunk → Retell Origination URI → Agent")
