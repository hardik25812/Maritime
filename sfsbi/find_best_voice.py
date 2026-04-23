import json, urllib.request

req = urllib.request.Request(
    "https://api.retellai.com/list-voices",
    headers={"Authorization": "Bearer key_70acf8e731936d5abafc26e9d116"}
)
voices = json.loads(urllib.request.urlopen(req).read().decode())

# Look for FEMALE voices that are multilingual OR English+Spanish capable, EXCLUDING Indian accent
print("=" * 100)
print("CANDIDATE FEMALE VOICES (multilingual or Latin-American localized)")
print("=" * 100)

candidates = []
for v in voices:
    gender = str(v.get("gender", "")).lower()
    if gender != "female":
        continue
    name = str(v.get("voice_name", ""))
    accent = str(v.get("accent", ""))
    lang = str(v.get("language", ""))
    provider = str(v.get("provider", ""))
    full = (name + accent + lang).lower()

    # Filter: no Indian/British, prefer American/Latin/multilingual
    if "indian" in full or "british" in full or "australian" in full:
        continue

    # Keep: anything marked Latin, Hispanic, multi, American with Spanish capability, or multilingual voices
    interesting = any(k in full for k in [
        "latin", "hispanic", "multi", "spanish", "americano", "bilingual"
    ])
    # Also keep premium ElevenLabs American female voices (they handle multilingual via turbo_v2_5)
    if not interesting and provider == "elevenlabs" and "american" in accent.lower():
        interesting = True

    if interesting:
        candidates.append(v)

for v in candidates[:40]:
    print(f"{str(v.get('voice_id')):60} | {str(v.get('voice_name')):35} | accent={str(v.get('accent')):20} | lang={str(v.get('language')):15} | {v.get('provider')}")

print(f"\nTotal candidates: {len(candidates)}")
