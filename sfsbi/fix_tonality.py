"""
Fix tonality variations in SFSBI agent voice
Adjusting voice_temperature and prosody settings
"""
import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def retell_api(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {RETELL_API_KEY}",
        "Content-Type": "application/json"
    }, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return False, e.read().decode()

print("Fixing voice tonality variations...")

ok, result = retell_api("PATCH", f"/update-agent/{AGENT_ID}", {
    "voice_temperature": 0.7,  # Lower from 1.0 to reduce pitch variations
    "voice_speed": 1.0,
    "enable_dynamic_voice_speed": True,
    "responsiveness": 0.9,
    "enable_dynamic_responsiveness": True,
    "interruption_sensitivity": 0.8,
    "enable_backchannel": True,
    "backchannel_frequency": 0.5,
    "backchannel_words": ["mm-hmm", "yeah", "right", "got it", "sure"],
    "ambient_sound": "call-center",
    "ambient_sound_volume": 0.3,  # Lower from 0.4 to reduce background interference
    "normalize_for_speech": True
})

if ok:
    print("✓ Voice tonality fixed!")
    print("  - voice_temperature: 1.0 → 0.7 (more consistent pitch)")
    print("  - ambient_sound_volume: 0.4 → 0.3 (less background noise)")
    print("\nTest by calling +16452188532")
else:
    print(f"✗ Update failed: {result[:500]}")
