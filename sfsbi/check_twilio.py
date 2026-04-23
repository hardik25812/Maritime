import json, urllib.request, urllib.error, base64

ACCOUNT_SID = "AC90045bfc00a44cc8de3bebaf7892786f"
AUTH_TOKEN = "39b6ffb195be67ab0969f00611f26f24"
PHONE_NUMBER = "+16452188532"

credentials = base64.b64encode(f"{ACCOUNT_SID}:{AUTH_TOKEN}".encode()).decode()

# List all phone numbers to find the SID
url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/IncomingPhoneNumbers.json"
req = urllib.request.Request(url, headers={"Authorization": f"Basic {credentials}"})

try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        numbers = data.get("incoming_phone_numbers", [])
        print(f"Found {len(numbers)} number(s):")
        for n in numbers:
            print(f"\nNumber: {n['phone_number']}")
            print(f"SID: {n['sid']}")
            print(f"Voice URL: {n.get('voice_url', 'NOT SET')}")
            print(f"Voice Method: {n.get('voice_method', 'NOT SET')}")
            print(f"Voice App SID: {n.get('voice_application_sid', 'NONE')}")
            print(f"SMS URL: {n.get('sms_url', 'NOT SET')}")
except urllib.error.HTTPError as e:
    print(f"Error: {e.code} - {e.read().decode()}")
