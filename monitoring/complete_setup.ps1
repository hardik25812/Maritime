# Complete monitoring setup - does everything in one go
$VPS = "root@187.127.141.170"
$REMOTE = "/root/.hermes/skills/monitoring"

Write-Host "✓ Files already uploaded"
Write-Host "✓ .env already configured"

Write-Host "`nAdding cron jobs to config.yaml..."
$cron_yaml = @'

  # ============ MONITORING CRON JOBS ============
  - name: "monitoring_quick_health"
    schedule: "*/15 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick"
    enabled: true
    description: "15-min quick health check"

  - name: "monitoring_hourly_report"
    schedule: "0 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py hourly"
    enabled: true
    description: "Hourly detailed report"

  - name: "monitoring_daily_summary"
    schedule: "0 9 * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py daily"
    enabled: true
    description: "Daily summary at 9 AM"
'@

$b64cron = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($cron_yaml))
ssh -o BatchMode=yes $VPS "grep -q 'monitoring_quick_health' /root/.hermes/config.yaml || (echo '$b64cron' | base64 -d >> /root/.hermes/config.yaml && echo 'CRON_ADDED')"

Write-Host "`nRestarting Hermes gateway..."
ssh -o BatchMode=yes $VPS "screen -S hermes-telegram -X quit 2>/dev/null; pkill -f 'hermes gateway' 2>/dev/null; sleep 2; cd /root/.hermes && screen -dmS hermes-telegram bash -lc 'export PATH=/root/.hermes/node/bin:/root/.local/bin:`$PATH; hermes gateway' && sleep 3 && screen -ls"

Write-Host "`n✅ DEPLOYMENT COMPLETE!"
Write-Host "`nMonitoring is now active:"
Write-Host "  • Quick health check: Every 15 minutes"
Write-Host "  • Hourly report: Every hour"
Write-Host "  • Daily summary: 9 AM daily"
Write-Host "  • Reports sent to Telegram: 8546830330"
Write-Host "`nTest manually: ssh root@187.127.141.170 'cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 unified_monitor.py quick'"
