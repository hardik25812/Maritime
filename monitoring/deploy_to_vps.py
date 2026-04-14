#!/usr/bin/env python3
"""
Deploy monitoring scripts to VPS via SSH using base64 encoding.
Run: python deploy_to_vps.py
"""
import subprocess
import base64
import os

VPS = "root@187.127.141.170"
REMOTE_DIR = "/root/.hermes/skills/monitoring"

files = {
    "n8n_health_monitor.py": open("n8n_health_monitor.py", "rb").read(),
    "retell_call_monitor.py": open("retell_call_monitor.py", "rb").read(),
    "unified_monitor.py": open("unified_monitor.py", "rb").read(),
}

def ssh(cmd, check=True):
    r = subprocess.run(["ssh", VPS, cmd], capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        print("STDERR:", r.stderr.strip())
    return r

# Step 1: Create remote dir
ssh(f"mkdir -p {REMOTE_DIR}")

# Step 2: Upload each file via base64
for filename, content in files.items():
    b64 = base64.b64encode(content).decode()
    remote_path = f"{REMOTE_DIR}/{filename}"
    cmd = f"echo '{b64}' | base64 -d > {remote_path} && echo 'Wrote {filename}'"
    ssh(cmd)

# Step 3: Write .env additions
env_additions = """
# ============ MONITORING CONFIG ============
N8N_API_URL=https://n8n.srv1546601.hstgr.cloud/api/v1
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZmY3OGVjNS03ZDcxLTQ2ODYtYmFlYy1mZTM4NmI2NWE1NGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOWE5OWE4ZTctYjZhYS00YjJjLWIyNzEtNjkxYTc1ZmVhZjQ4IiwiaWF0IjoxNzc2MDY5NjI2fQ.w1Z7MUZWGwzVEH0lEnCc3lbDm6K2B4RjAI2dBi2_Suk
RETELL_API_KEY=key_70acf8e731936d5abafc26e9d116
TELEGRAM_ALERT_CHANNEL=8546830330
ALERT_THRESHOLD_ERROR_RATE=0.05
ALERT_THRESHOLD_SLOW_EXECUTION=30
ALERT_THRESHOLD_QUALITY_SCORE=70
# ==========================================
"""

b64env = base64.b64encode(env_additions.encode()).decode()
ssh(f"echo '{b64env}' | base64 -d >> /root/.hermes/.env && echo 'ENV_UPDATED'")

# Step 4: Add cron jobs to config.yaml
cron_block = """
cron:
  jobs:
    - name: "Quick Health Check"
      schedule: "*/15 * * * *"
      command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick"
      platform: telegram
      channel: "8546830330"
      enabled: true

    - name: "Hourly Report"
      schedule: "0 * * * *"
      command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py hourly"
      platform: telegram
      channel: "8546830330"
      enabled: true

    - name: "Daily Summary"
      schedule: "0 9 * * *"
      command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py daily"
      platform: telegram
      channel: "8546830330"
      enabled: true
"""

# Only add if not already there
check = ssh("grep -q 'Quick Health Check' /root/.hermes/config.yaml && echo EXISTS || echo MISSING", check=False)
if "MISSING" in check.stdout:
    b64cron = base64.b64encode(cron_block.encode()).decode()
    ssh(f"echo '{b64cron}' | base64 -d >> /root/.hermes/config.yaml && echo 'CRON_ADDED'")
else:
    print("Cron jobs already in config.yaml — skipping")

# Step 5: Test the monitoring scripts
print("\n--- Testing n8n monitor ---")
ssh(f"cd {REMOTE_DIR} && /root/.hermes/hermes-agent/venv/bin/python3 n8n_health_monitor.py 2>&1 | head -30")

print("\n--- Testing Retell monitor ---")
ssh(f"cd {REMOTE_DIR} && /root/.hermes/hermes-agent/venv/bin/python3 retell_call_monitor.py 2>&1 | head -30")

print("\n--- Testing unified monitor (quick) ---")
ssh(f"cd {REMOTE_DIR} && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick 2>&1")

print("\n--- Restarting Hermes gateway ---")
ssh("screen -S hermes-telegram -X quit || true")
ssh("pkill -f 'hermes gateway' || true")
import time; time.sleep(2)
ssh("cd /root/.hermes && screen -dmS hermes-telegram bash -lc 'export PATH=/root/.hermes/node/bin:/root/.local/bin:$PATH; hermes gateway'")
import time; time.sleep(3)
ssh("screen -ls && ps aux | grep 'hermes gateway' | grep -v grep")

print("\n✅ DEPLOYMENT COMPLETE")
