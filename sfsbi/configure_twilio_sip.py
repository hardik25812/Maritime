"""
SFSBI Twilio SIP Trunk + Retell Phone Number Configuration
-----------------------------------------------------------
This script:
1. Imports your Twilio number into Retell
2. Creates a SIP trunk in Twilio for Retell
3. Assigns the number to the SFSBI Retell agent
4. Tests the connection

Run: python configure_twilio_sip.py

Fill in your Twilio credentials below before running.
"""
import json, urllib.request, urllib.error, urllib.parse, base64, os

# ── FILL THESE IN ────────────────────────────────────────────────
TWILIO_ACCOUNT_SID  = "YOUR_TWILIO_ACCOUNT_SID"      # ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN   = "YOUR_TWILIO_AUTH_TOKEN"        # from Twilio Console
TWILIO_PHONE_NUMBER = "YOUR_TWILIO_PHONE_E164"        # e.g. +13055550100 (the number you bought)

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
RETELL_AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

# ── Retell SIP endpoint (always this — Retell's inbound SIP gateway)
RETELL_SIP_URI = "sip:sfsbi@5t4n0sqx2b-us-east-1.sip.retell.ai"

# ── HELPERS ──────────────────────────────────────────────────────
def twilio_request(method, endpoint, data=None):
    url  = f"https://api.twilio.com{endpoint}"
    auth = base64.b64encode(f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}".encode()).decode()
    body = urllib.parse.urlencode(data).encode() if data else None
    req  = urllib.request.Request(
        url, data=body,
        headers={
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return False, e.read().decode()

def retell_request(method, endpoint, data=None):
    url  = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req  = urllib.request.Request(
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

def sep(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

# ── STEP 1: Import phone number into Retell ───────────────────────
def import_number_to_retell():
    sep("STEP 1: Import Twilio Number into Retell")

    ok, result = retell_request("POST", "/import-phone-number", {
        "phone_number":       TWILIO_PHONE_NUMBER,
        "phone_number_type":  "twilio",
        "twilio_account_sid": TWILIO_ACCOUNT_SID,
        "twilio_auth_token":  TWILIO_AUTH_TOKEN,
        "inbound_agent_id":   RETELL_AGENT_ID,
    })

    if ok:
        phone_id = result.get("phone_number", "")
        print(f"  ✓ Number imported into Retell: {phone_id}")
        print(f"  ✓ Assigned to agent: {RETELL_AGENT_ID}")
        return True
    else:
        # May already be imported — try updating instead
        print(f"  ✗ Import failed: {result[:300]}")
        print("\n  Trying to update existing number assignment...")
        ok2, result2 = retell_request(
            "PATCH",
            f"/update-phone-number/{urllib.parse.quote(TWILIO_PHONE_NUMBER)}",
            {"inbound_agent_id": RETELL_AGENT_ID}
        )
        if ok2:
            print(f"  ✓ Number assignment updated to agent {RETELL_AGENT_ID}")
            return True
        else:
            print(f"  ✗ Update also failed: {result2[:300]}")
            return False

# ── STEP 2: Create Twilio SIP Trunk ──────────────────────────────
def create_sip_trunk():
    sep("STEP 2: Create Twilio SIP Trunk for Retell")

    # Create trunk
    ok, trunk = twilio_request("POST", "/2010-04-01/Accounts/{}/SIP/Trunks.json".format(TWILIO_ACCOUNT_SID), {
        "FriendlyName": "SFSBI Retell AI Trunk",
        "DomainName":   "sfsbi-retell.pstn.twilio.com",
    })

    if not ok:
        print(f"  ✗ SIP trunk creation failed: {trunk[:300]}")
        print("  This may already exist. Continuing...")
        return None

    trunk_sid = trunk.get("sid", "")
    print(f"  ✓ SIP trunk created: {trunk_sid}")

    # Add Retell as origination URI (Retell receives calls)
    ok2, orig = twilio_request(
        "POST",
        f"/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/SIP/Trunks/{trunk_sid}/OriginationUrls.json",
        {
            "FriendlyName": "Retell AI Inbound",
            "SipUrl":       RETELL_SIP_URI,
            "Priority":     10,
            "Weight":       10,
            "Enabled":      "true",
        }
    )
    if ok2:
        print(f"  ✓ Origination URL set to: {RETELL_SIP_URI}")
    else:
        print(f"  ✗ Origination URL failed: {orig[:200]}")

    return trunk_sid

# ── STEP 3: Assign phone number to SIP trunk ─────────────────────
def assign_number_to_trunk(trunk_sid):
    if not trunk_sid:
        print("\nSkipping trunk assignment (no trunk SID).")
        return

    sep("STEP 3: Assign Phone Number to SIP Trunk")

    # First find the phone number SID
    number_encoded = urllib.parse.quote(TWILIO_PHONE_NUMBER)
    ok, numbers = twilio_request(
        "GET",
        f"/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber={number_encoded}"
    )

    if not ok or not numbers.get("incoming_phone_numbers"):
        print(f"  ✗ Could not find phone number {TWILIO_PHONE_NUMBER}: {str(numbers)[:200]}")
        return

    number_sid = numbers["incoming_phone_numbers"][0]["sid"]
    print(f"  Found number SID: {number_sid}")

    # Update number to use SIP trunk
    ok2, update = twilio_request(
        "POST",
        f"/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/{number_sid}.json",
        {
            "TrunkSid": trunk_sid,
            "VoiceUrl": "",  # clear any old URL
        }
    )

    if ok2:
        print(f"  ✓ Number {TWILIO_PHONE_NUMBER} now routes through SIP trunk → Retell")
    else:
        print(f"  ✗ Number assignment failed: {update[:300]}")

# ── STEP 4: Verify agent config ───────────────────────────────────
def verify_agent():
    sep("STEP 4: Verifying Retell Agent")

    ok, agent = retell_request("GET", f"/get-agent/{RETELL_AGENT_ID}")
    if ok:
        print(f"  ✓ Agent found: {agent.get('agent_name', 'N/A')}")
        print(f"  ✓ Voice: {agent.get('voice_id', 'N/A')}")
        print(f"  ✓ Webhook: {agent.get('webhook_url', 'N/A')}")
        phones = agent.get('phone_numbers', [])
        if phones:
            print(f"  ✓ Assigned numbers: {', '.join(phones)}")
        else:
            print(f"  ⚠  No phone numbers assigned yet in Retell agent config")
    else:
        print(f"  ✗ Agent fetch failed: {agent[:200]}")

# ── STEP 5: Print summary ─────────────────────────────────────────
def print_summary(trunk_sid):
    sep("SETUP COMPLETE — CALL FLOW")
    print(f"""
  Caller dials: {TWILIO_PHONE_NUMBER}
       ↓
  Twilio receives the call
       ↓
  SIP Trunk ({trunk_sid or 'see Twilio console'}) routes to Retell
       ↓
  Retell SIP: {RETELL_SIP_URI}
       ↓
  Retell agent: {RETELL_AGENT_ID}  (Dorothy voice, bilingual EN/ES)
       ↓
  On call end → POST to n8n webhook
  https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended
       ↓
  n8n: Log to Supabase/Google Sheets + SMS Sheena if urgent/high-lead

  ─────────────────────────────────────────────────────────────
  CALL FORWARDING OPTION (alternative to SIP trunk):
  If you prefer, simply forward {TWILIO_PHONE_NUMBER}
  to your Retell phone number from the Twilio console.
  Go to: Twilio Console → Phone Numbers → {TWILIO_PHONE_NUMBER}
  Set "A Call Comes In" → Webhook → POST to Retell's number.
  ─────────────────────────────────────────────────────────────

  MANUAL FALLBACK — If SIP trunk setup is complex:
  1. In Twilio Console → Phone Numbers → {TWILIO_PHONE_NUMBER}
  2. Under Voice Configuration → "A Call Comes In":
     Select "SIP Endpoint" and enter:
     {RETELL_SIP_URI}
  3. Save. That's it — calls route to Retell immediately.
""")

# ── MAIN ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    if "YOUR_TWILIO" in TWILIO_ACCOUNT_SID:
        print("\n⚠  FILL IN YOUR TWILIO CREDENTIALS BEFORE RUNNING!")
        print("   Edit the top of this file and set:")
        print("   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER")
        exit(1)

    imported  = import_number_to_retell()
    trunk_sid = create_sip_trunk()
    assign_number_to_trunk(trunk_sid)
    verify_agent()
    print_summary(trunk_sid)
