import json, urllib.request, urllib.error, urllib.parse, base64

# Try multiple credential combinations
CONFIGS = [
    ("AC90045bfc00a44cc8de3bebaf7892786f", "39b6ffb195be67ab0969f00611f26f24"),
]

TARGET_NUMBER = "+16452188532"
# Correct webhook URL for custom Twilio number in Retell
RETELL_WEBHOOK = "https://api.retellai.com/twilio-voice-webhook/+16452188532"

for ACCOUNT_SID, AUTH_TOKEN in CONFIGS:
    print(f"\nTrying SID: {ACCOUNT_SID[:20]}...")
    credentials = base64.b64encode(f"{ACCOUNT_SID}:{AUTH_TOKEN}".encode()).decode()
    headers = {"Authorization": f"Basic {credentials}"}

    # Step 1: List numbers
    list_url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/IncomingPhoneNumbers.json"
    req = urllib.request.Request(list_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            numbers = data.get("incoming_phone_numbers", [])
            print(f"  Found {len(numbers)} number(s)")
            for n in numbers:
                num = n["phone_number"]
                sid = n["sid"]
                voice_url = n.get("voice_url", "NOT SET")
                print(f"  Number: {num} | SID: {sid}")
                print(f"  Current Voice URL: {voice_url}")

                if num == TARGET_NUMBER or num.replace(" ", "") == TARGET_NUMBER:
                    print(f"\n  --> Found target number! Updating webhook...")
                    # Step 2: Update webhook
                    update_url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/IncomingPhoneNumbers/{sid}.json"
                    post_data = urllib.parse.urlencode({
                        "VoiceUrl": RETELL_WEBHOOK,
                        "VoiceMethod": "POST"
                    }).encode()
                    update_req = urllib.request.Request(
                        update_url,
                        data=post_data,
                        headers={**headers, "Content-Type": "application/x-www-form-urlencoded"},
                        method="POST"
                    )
                    with urllib.request.urlopen(update_req) as r2:
                        result = json.loads(r2.read().decode())
                        print(f"  SUCCESS! New Voice URL: {result.get('voice_url')}")
                        print(f"  Voice Method: {result.get('voice_method')}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP Error {e.code}: {body[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
