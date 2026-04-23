import json, urllib.request, urllib.error

KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def api(method, endpoint, data=None):
    req = urllib.request.Request(
        f"https://api.retellai.com{endpoint}",
        data=json.dumps(data).encode() if data else None,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        method=method
    )
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, f"{e.code}: {e.read().decode()[:400]}"

# ─────────────────────────────────────────
# Pick new voice: Paola — American female with Latina name,
# works well with eleven_turbo_v2_5 multilingual for Spanish.
# This should sound cleanly American in English (no Indian tint)
# while still speaking natural Spanish when switched.
# ─────────────────────────────────────────
NEW_VOICE = "11labs-Paola"

updates = {
    "voice_id": NEW_VOICE,
    "voice_model": "eleven_turbo_v2_5",     # multilingual, fast
    "language": "multi",                     # auto-detect EN/ES
    "voice_temperature": 0.8,                # natural variation, less robotic
    "voice_speed": 1.0,                      # normal pace

    # ── INTERRUPTION TUNING ──
    "interruption_sensitivity": 0.95,        # stop talking FAST when caller speaks
    "responsiveness": 1.0,                   # respond as quickly as possible
    "enable_backchannel": True,              # keeps "mm-hmm" active
    "backchannel_frequency": 0.7,            # slightly less, avoids over-talking
    "backchannel_words": ["yeah", "uh-huh", "right", "okay", "claro", "ajá"],

    # Keep ambient realism but lower so voice is cleaner
    "ambient_sound": "call-center",
    "ambient_sound_volume": 0.4,

    # Faster end-of-turn detection so she doesn't drone on
    "end_call_after_silence_ms": 15000,
}

print("Updating agent with fixes:")
print(f"  Voice: {NEW_VOICE} (was 11labs-Hailey-Latin-America-Spanish-localized)")
print(f"  Model: eleven_turbo_v2_5 (multilingual)")
print(f"  Language: multi (auto EN/ES)")
print(f"  Interruption sensitivity: 0.95 (was default ~0.5)")
print(f"  Responsiveness: 1.0 (fastest)")
print(f"  Ambient sound volume: 0.4 (was 1.0)")

ok, result = api("PATCH", f"/update-agent/{AGENT_ID}", updates)

if ok:
    print("\nSUCCESS")
    for key in ["voice_id", "voice_model", "language", "voice_temperature",
                "interruption_sensitivity", "responsiveness",
                "ambient_sound", "ambient_sound_volume"]:
        print(f"  {key}: {result.get(key)}")
else:
    print(f"\nFAIL: {result}")
    # Fallback: try Nia as alternative
    print("\nTrying fallback voice: 11labs-Nia")
    updates["voice_id"] = "11labs-Nia"
    ok2, result2 = api("PATCH", f"/update-agent/{AGENT_ID}", updates)
    if ok2:
        print(f"Fallback OK: voice_id = {result2.get('voice_id')}")
    else:
        print(f"Fallback failed: {result2}")
