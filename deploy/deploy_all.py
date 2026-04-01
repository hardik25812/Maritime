import json, urllib.request, urllib.error, os, sys

N8N_URL = "https://n8n.srv1546601.hstgr.cloud"
N8N_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZmY3OGVjNS03ZDcxLTQ2ODYtYmFlYy1mZTM4NmI2NWE1NGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNzJmNzIxYTMtNmFlZS00OGJkLThlY2MtNWI2YzU3NzlkZGRlIiwiaWF0IjoxNzc0OTg0MzY3LCJleHAiOjE3Nzc1MDAwMDB9.ke_8gHsIieCNCRvxEI-cLCkrCRl7ycDkbk3oIN0HdGU"

DEPLOY_DIR = os.path.dirname(os.path.abspath(__file__))

FILES = [
    "wf1_retell_call_handler.json",
    "wf2_missed_call_sms.json",
    "wf3_urgent_escalation.json",
    "wf4_google_review.json",
]

def deploy_workflow(filepath):
    with open(filepath, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    # Remove read-only fields not accepted on POST
    for field in ("active", "id", "createdAt", "updatedAt", "versionId", "tags"):
        data.pop(field, None)
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{N8N_URL}/api/v1/workflows",
        data=body,
        headers={"X-N8N-API-KEY": N8N_KEY, "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return True, result.get("id"), result.get("name")
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        return False, None, err

def activate_workflow(wf_id):
    req = urllib.request.Request(
        f"{N8N_URL}/api/v1/workflows/{wf_id}/activate",
        data=b"{}",
        headers={"X-N8N-API-KEY": N8N_KEY, "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True
    except urllib.error.HTTPError as e:
        return False

def delete_workflow(wf_id):
    req = urllib.request.Request(
        f"{N8N_URL}/api/v1/workflows/{wf_id}",
        headers={"X-N8N-API-KEY": N8N_KEY},
        method="DELETE"
    )
    try:
        with urllib.request.urlopen(req):
            return True
    except:
        return False

# Delete the test workflow
print("Cleaning up test workflow 'sufPTVd8Wupr97Ge'...")
if delete_workflow("sufPTVd8Wupr97Ge"):
    print("  Deleted.")

print("\n" + "="*60)
print("DEPLOYING IETI WORKFLOWS TO n8n")
print("="*60)

results = []
for fname in FILES:
    fpath = os.path.join(DEPLOY_DIR, fname)
    print(f"\n--- {fname} ---")
    ok, wf_id, info = deploy_workflow(fpath)
    if ok:
        print(f"  Created  ID={wf_id}  Name={info}")
        # Activate the workflow
        if activate_workflow(wf_id):
            print(f"  Activated ✓")
        else:
            print(f"  Activation skipped (needs credentials first)")
        results.append({"file": fname, "status": "OK", "id": wf_id, "name": info})
    else:
        print(f"  FAILED: {info[:200]}")
        results.append({"file": fname, "status": "FAIL", "id": "", "error": info[:200]})

print("\n" + "="*60)
print("DEPLOY SUMMARY")
print("="*60)
for r in results:
    status = "✓" if r["status"] == "OK" else "✗"
    print(f"  {status} {r['file']}")
    if r["status"] == "OK":
        print(f"    ID:   {r['id']}")
        print(f"    Name: {r['name']}")
    else:
        print(f"    ERR:  {r.get('error','')}")

# Save IDs for reference
ids_path = os.path.join(DEPLOY_DIR, "deployed_ids.json")
with open(ids_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nIDs saved to: {ids_path}")
