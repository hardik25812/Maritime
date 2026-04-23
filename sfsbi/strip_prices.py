import json, urllib.request, re

KEY = "key_70acf8e731936d5abafc26e9d116"
LLM = "llm_cab07a332ad0ee72450127f9ec95"

req = urllib.request.Request(
    f"https://api.retellai.com/get-retell-llm/{LLM}",
    headers={"Authorization": f"Bearer {KEY}"}
)
p = json.loads(urllib.request.urlopen(req).read().decode())["general_prompt"]

# Remove any line containing a $ amount
lines = p.split("\n")
removed = [l for l in lines if "$" in l]
kept = [l for l in lines if "$" not in l]
p2 = "\n".join(kept)

print(f"Removed {len(removed)} line(s):")
for l in removed:
    print(f"  - {l[:100]}")

print(f"\nRemaining '$' count: {p2.count('$')}")

body = json.dumps({"general_prompt": p2}).encode()
req2 = urllib.request.Request(
    f"https://api.retellai.com/update-retell-llm/{LLM}",
    data=body,
    headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    method="PATCH"
)
urllib.request.urlopen(req2)
print("Updated successfully")
