$VPS = "root@187.127.141.170"
$REMOTE = "/root/.hermes/skills/monitoring"

Write-Host "Uploading multi_client_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\multi_client_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/multi_client_monitor.py && echo MC_OK"

Write-Host "Uploading clients_config.json..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\clients_config.json"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/clients_config.json && echo CFG_OK"

Write-Host "Uploading updated n8n_health_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\n8n_health_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/n8n_health_monitor.py && echo N8N_OK"

Write-Host "Uploading updated retell_call_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\retell_call_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/retell_call_monitor.py && echo RTL_OK"

Write-Host "Uploading updated unified_monitor.py..."
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\unified_monitor.py"))
ssh -o BatchMode=yes $VPS "echo $b64 | base64 -d > $REMOTE/unified_monitor.py && echo UNI_OK"

Write-Host "Testing..."
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py list"

Write-Host "Done!"
