import json, urllib.request, urllib.error, urllib.parse, base64

ACCOUNT_SID = "AC90045bfc00a44cc8de3bebaf7892786f"
AUTH_TOKEN = "79266bb0aa047d740e9cdf4152f29a52"
credentials = base64.b64encode(f"{ACCOUNT_SID}:{AUTH_TOKEN}".encode()).decode()
headers = {"Authorization": f"Basic {credentials}"}

# 1. Check the number config
print("=" * 60)
print("TWILIO NUMBER CONFIG")
print("=" * 60)
url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber=%2B16452188532"
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        nums = data.get("incoming_phone_numbers", [])
        if nums:
            n = nums[0]
            print(f"Number:          {n['phone_number']}")
            print(f"SID:             {n['sid']}")
            print(f"Voice URL:       {n.get('voice_url')}")
            print(f"Voice Method:    {n.get('voice_method')}")
            print(f"Voice App SID:   {n.get('voice_application_sid', 'NONE')}")
            print(f"Status Callback: {n.get('status_callback', 'NONE')}")
            
            # Check if voice_application_sid is set — this overrides voice_url!
            app_sid = n.get("voice_application_sid")
            if app_sid and app_sid.strip():
                print(f"\n*** WARNING: voice_application_sid is SET to: {app_sid}")
                print("*** This OVERRIDES the Voice URL! Must clear it.")
            else:
                print(f"\nNo voice_application_sid — Voice URL should work.")
        else:
            print("Number not found!")
except urllib.error.HTTPError as e:
    print(f"Error: {e.code} - {e.read().decode()[:300]}")

# 2. Check recent calls for error details
print("\n" + "=" * 60)
print("RECENT CALL LOGS (last 5)")
print("=" * 60)
calls_url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Calls.json?To=%2B16452188532&PageSize=5"
req2 = urllib.request.Request(calls_url, headers=headers)
try:
    with urllib.request.urlopen(req2) as r:
        data = json.loads(r.read().decode())
        calls = data.get("calls", [])
        if calls:
            for c in calls:
                print(f"\nCall SID:    {c['sid']}")
                print(f"From:        {c.get('from_formatted', c.get('from'))}")
                print(f"Status:      {c.get('status')}")
                print(f"Duration:    {c.get('duration')}s")
                print(f"Date:        {c.get('date_created')}")
                print(f"Direction:   {c.get('direction')}")
        else:
            print("No recent calls found")
except urllib.error.HTTPError as e:
    print(f"Error: {e.code} - {e.read().decode()[:300]}")

# 3. Check Twilio debugger for errors
print("\n" + "=" * 60)
print("TWILIO ERROR ALERTS (last 5)")
print("=" * 60)
alerts_url = f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Notifications.json?PageSize=5&MessageDate>2026-04-14"
req3 = urllib.request.Request(alerts_url, headers=headers)
try:
    with urllib.request.urlopen(req3) as r:
        data = json.loads(r.read().decode())
        notifs = data.get("notifications", [])
        if notifs:
            for n in notifs:
                print(f"\nError Code:  {n.get('error_code')}")
                print(f"Message:     {n.get('message_text', '')[:200]}")
                print(f"Date:        {n.get('date_created')}")
                print(f"More Info:   {n.get('more_info')}")
        else:
            print("No recent error alerts")
except urllib.error.HTTPError as e:
    print(f"Error: {e.code} - {e.read().decode()[:300]}")
