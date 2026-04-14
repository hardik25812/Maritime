# Quick upload script - uploads all monitoring files to VPS
$VPS = "root@187.127.141.170"
$REMOTE = "/root/.hermes/skills/monitoring"

Write-Host "Creating remote directory..."
ssh -o BatchMode=yes $VPS "mkdir -p $REMOTE"

Write-Host "Uploading n8n_health_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\n8n_health_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/n8n_health_monitor.py"

Write-Host "Uploading retell_call_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\retell_call_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/retell_call_monitor.py"

Write-Host "Uploading unified_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\unified_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/unified_monitor.py"

Write-Host "Configuring .env..."
$env_config = @"

# ============ MONITORING CONFIG ============
N8N_API_URL=https://n8n.srv1546601.hstgr.cloud/api/v1
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZmY3OGVjNS03ZDcxLTQ2ODYtYmFlYy1mZTM4NmI2NWE1NGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOWE5OWE4ZTctYjZhYS00YjJjLWIyNzEtNjkxYTc1ZmVhZjQ4IiwiaWF0IjoxNzc2MDY5NjI2fQ.w1Z7MUZWGwzVEH0lEnCc3lbDm6K2B4RjAI2dBi2_Suk
RETELL_API_KEY=key_70acf8e731936d5abafc26e9d116
TELEGRAM_ALERT_CHANNEL=8546830330
# ==========================================
"@
$b64env = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($env_config))
ssh -o BatchMode=yes $VPS "echo $b64env | base64 -d >> /root/.hermes/.env"

Write-Host "Testing n8n monitor..."
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 n8n_health_monitor.py 2>&1 | head -20"

Write-Host "Testing unified monitor..."
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick 2>&1"

Write-Host "`n✅ Upload complete! Now add cron jobs to /root/.hermes/config.yaml manually"
