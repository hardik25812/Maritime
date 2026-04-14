# Twilio Voice Webhook Fix for +16452188532

## Current Issue
Twilio shows "application error" when calling +16452188532

## Root Cause
The webhook URL format is wrong. Since the number was imported as "custom" type (not retell-twilio), Twilio needs the phone number in the webhook URL, not the agent ID.

## Fix

Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming/[YOUR_PHONE_SID]

**Change this:**
```
https://api.retellai.com/twilio-voice-webhook/agent_dfd95700637dad9769ebf4fa24
```

**To this:**
```
https://api.retellai.com/twilio-voice-webhook/+16452188532
```

Method: HTTP POST

## Why This Works
- Retell's API expects the phone number in the URL path for custom Twilio integrations
- The agent assignment is already configured in Retell (verified via list-phone-numbers API)
- The phone number `+16452188532` is mapped to `agent_dfd95700637dad9769ebf4fa24` in Retell
- Twilio → Retell webhook → Agent → n8n webhook → Supabase

## Test
After saving, call +16452188532 — Dorothy should answer immediately.
