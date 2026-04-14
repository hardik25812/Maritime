# Upload multi-client monitoring files to VPS
$VPS = "root@187.127.141.170"
$REMOTE = "/root/.hermes/skills/monitoring"

Write-Host "Uploading updated monitoring scripts..."

# Upload updated Python scripts
Write-Host "  → n8n_health_monitor.py (with client filtering)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\n8n_health_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/n8n_health_monitor.py"

Write-Host "  → retell_call_monitor.py (with client filtering)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\retell_call_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/retell_call_monitor.py"

Write-Host "  → unified_monitor.py (with client filtering)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\unified_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/unified_monitor.py"

Write-Host "  → multi_client_monitor.py (NEW)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\multi_client_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/multi_client_monitor.py && chmod +x $REMOTE/multi_client_monitor.py"

Write-Host "  → clients_config.json (NEW)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\clients_config.json"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/clients_config.json"

Write-Host "  → MULTI_CLIENT_SETUP.md (documentation)..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\MULTI_CLIENT_SETUP.md"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/MULTI_CLIENT_SETUP.md"

Write-Host "`n✅ All files uploaded!"
Write-Host "`nTesting multi-client monitoring..."

Write-Host "`n--- List configured clients ---"
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py list"

Write-Host "`n--- Test global monitoring (all clients) ---"
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick 2>&1 | head -20"

Write-Host "`n--- Test specific client (Maritime) ---"
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py quick --client Maritime 2>&1 | head -20"

Write-Host "`n✅ MULTI-CLIENT MONITORING DEPLOYED!"
Write-Host "`nNext steps:"
Write-Host "  1. Edit clients_config.json with your actual client data"
Write-Host "  2. Add tags to your n8n workflows (e.g., 'client:maritime')"
Write-Host "  3. Get Retell agent IDs from Retell dashboard"
Write-Host "  4. Test: ssh root@187.127.141.170 'cd /root/.hermes/skills/monitoring && python3 multi_client_monitor.py list'"
Write-Host "`nDocumentation: /root/.hermes/skills/monitoring/MULTI_CLIENT_SETUP.md"
