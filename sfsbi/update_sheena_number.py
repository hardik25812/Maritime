"""Swap the transfer destination to Sheena's real number.
Usage: edit SHEENA_NUMBER below, then run:   python update_sheena_number.py
"""
import json, urllib.request, urllib.error, sys

KEY = "key_70acf8e731936d5abafc26e9d116"
LLM = "llm_cab07a332ad0ee72450127f9ec95"

# ── PASTE SHEENA'S REAL NUMBER HERE (E.164 format, e.g. +13055550123) ──
SHEENA_NUMBER = sys.argv[1] if len(sys.argv) > 1 else "+16452188532"

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
        return False, f"{e.code}: {e.read().decode()[:300]}"

ok, llm = api("GET", f"/get-retell-llm/{LLM}")
if not ok:
    print(f"Failed to fetch LLM: {llm}"); exit(1)

tools = llm.get("general_tools", []) or []
updated = False
for t in tools:
    if t.get("name") == "transfer_to_sheena":
        old = t.get("transfer_destination", {}).get("number")
        t["transfer_destination"]["number"] = SHEENA_NUMBER
        print(f"Transfer number: {old}  →  {SHEENA_NUMBER}")
        updated = True

if not updated:
    print("transfer_to_sheena tool not found — run add_transfer_and_pricing.py first")
    exit(1)

ok, result = api("PATCH", f"/update-retell-llm/{LLM}", {"general_tools": tools})
if ok:
    print("Updated. Verify on dashboard or test call.")
else:
    print(f"Update failed: {result}")
