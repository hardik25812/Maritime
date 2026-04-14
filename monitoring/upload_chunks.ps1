$VPS = "root@187.127.141.170"
$REMOTE = "/root/.hermes/skills/monitoring"

function Upload-File {
    param($LocalPath, $RemotePath)
    $filename = Split-Path $LocalPath -Leaf
    Write-Host "Uploading $filename..."
    
    $bytes = [IO.File]::ReadAllBytes($LocalPath)
    $b64 = [Convert]::ToBase64String($bytes)
    $chunkSize = 50000
    $total = $b64.Length
    $chunks = [math]::Ceiling($total / $chunkSize)
    
    # Start fresh
    ssh -o BatchMode=yes $VPS "rm -f $RemotePath.b64"
    
    for ($i = 0; $i -lt $chunks; $i++) {
        $start = $i * $chunkSize
        $len = [math]::Min($chunkSize, $total - $start)
        $chunk = $b64.Substring($start, $len)
        ssh -o BatchMode=yes $VPS "echo -n '$chunk' >> $RemotePath.b64"
    }
    
    # Decode final file
    ssh -o BatchMode=yes $VPS "base64 -d $RemotePath.b64 > $RemotePath && rm $RemotePath.b64 && echo '$filename OK'"
}

Upload-File "$PSScriptRoot\n8n_health_monitor.py"     "$REMOTE/n8n_health_monitor.py"
Upload-File "$PSScriptRoot\retell_call_monitor.py"    "$REMOTE/retell_call_monitor.py"
Upload-File "$PSScriptRoot\unified_monitor.py"        "$REMOTE/unified_monitor.py"
Upload-File "$PSScriptRoot\multi_client_monitor.py"   "$REMOTE/multi_client_monitor.py"
Upload-File "$PSScriptRoot\clients_config.json"       "$REMOTE/clients_config.json"

Write-Host "`nTesting..."
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py list"
ssh -o BatchMode=yes $VPS "cd $REMOTE && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick"

Write-Host "`n✅ ALL FILES DEPLOYED!"
