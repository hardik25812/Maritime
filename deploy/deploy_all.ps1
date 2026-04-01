$N8N_URL = "https://n8n.srv1546601.hstgr.cloud"
$N8N_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZmY3OGVjNS03ZDcxLTQ2ODYtYmFlYy1mZTM4NmI2NWE1NGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNzJmNzIxYTMtNmFlZS00OGJkLThlY2MtNWI2YzU3NzlkZGRlIiwiaWF0IjoxNzc0OTg0MzY3LCJleHAiOjE3Nzc1MDAwMDB9.ke_8gHsIieCNCRvxEI-cLCkrCRl7ycDkbk3oIN0HdGU"

$headers = @{
    "X-N8N-API-KEY" = $N8N_KEY
    "Content-Type"  = "application/json"
}

$deployDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = @(
    "wf1_retell_call_handler.json",
    "wf2_missed_call_sms.json",
    "wf3_urgent_escalation.json",
    "wf4_google_review.json"
)

$results = @()

foreach ($file in $files) {
    $path = Join-Path $deployDir $file
    Write-Host "`n--- Deploying: $file ---"
    try {
        $body = Get-Content $path -Raw -Encoding UTF8
        $resp = Invoke-RestMethod -Uri "$N8N_URL/api/v1/workflows" `
            -Headers $headers -Method POST -Body $body -ErrorAction Stop
        Write-Host "  SUCCESS  ID=$($resp.id)  Name='$($resp.name)'  Active=$($resp.active)"
        $results += [PSCustomObject]@{ File=$file; Status="OK"; ID=$resp.id; Name=$resp.name }
    } catch {
        $errMsg = $_.Exception.Message
        Write-Host "  FAILED: $errMsg"
        $results += [PSCustomObject]@{ File=$file; Status="FAIL"; ID=""; Name=$errMsg }
    }
}

Write-Host "`n========= DEPLOY SUMMARY ========="
$results | Format-Table -AutoSize
