# Hermes Monitoring System - Deployment Guide

Complete guide to deploy the AI agent monitoring system on your VPS.

## Prerequisites

- VPS with Hermes agent installed (187.127.141.170)
- SSH access configured (passwordless)
- n8n instance with API access
- Retell AI account with API key
- Telegram bot configured with Hermes

## Quick Start (5 minutes)

```bash
# 1. SSH into your VPS
ssh root@187.127.141.170

# 2. Create monitoring directory
cd /root/.hermes/skills
mkdir -p monitoring
cd monitoring

# 3. Download setup script (we'll upload files from local)
# Files will be uploaded via SCP from your local machine

# 4. Run setup
chmod +x setup_monitoring.sh
./setup_monitoring.sh
```

## Step-by-Step Deployment

### Step 1: Upload Monitoring Scripts to VPS

From your local machine (Windows):

```powershell
# Navigate to monitoring folder
cd C:\Users\hardi\Downloads\Maritimw\monitoring

# Upload all Python scripts to VPS
scp n8n_health_monitor.py root@187.127.141.170:/root/.hermes/skills/monitoring/
scp retell_call_monitor.py root@187.127.141.170:/root/.hermes/skills/monitoring/
scp unified_monitor.py root@187.127.141.170:/root/.hermes/skills/monitoring/
scp setup_monitoring.sh root@187.127.141.170:/root/.hermes/skills/monitoring/

# Upload skill documentation
scp hermes_skill_SKILL.md root@187.127.141.170:/root/.hermes/skills/monitoring/SKILL.md
```

### Step 2: Configure API Credentials

SSH into VPS and edit `.env`:

```bash
ssh root@187.127.141.170
nano /root/.hermes/.env
```

Add these lines:

```bash
# n8n API Configuration
N8N_API_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_n8n_api_key_here

# Retell API Configuration
RETELL_API_KEY=your_retell_api_key_here

# Monitoring Configuration
TELEGRAM_ALERT_CHANNEL=8546830330
ALERT_THRESHOLD_ERROR_RATE=0.05
ALERT_THRESHOLD_SLOW_EXECUTION=30
ALERT_THRESHOLD_QUALITY_SCORE=70
```

Save and exit (Ctrl+X, Y, Enter).

### Step 3: Install Python Dependencies

```bash
cd /root/.hermes/skills/monitoring
pip3 install requests python-dotenv
```

### Step 4: Test Monitoring Scripts

```bash
# Test n8n monitor
python3 n8n_health_monitor.py

# Test Retell monitor
python3 retell_call_monitor.py

# Test unified monitor
python3 unified_monitor.py quick
```

You should see JSON output and formatted reports.

### Step 5: Configure Hermes Cron Jobs

Edit Hermes config:

```bash
nano /root/.hermes/config.yaml
```

Add cron jobs section (or update existing):

```yaml
cron:
  jobs:
    - name: "Quick Health Check"
      schedule: "*/15 * * * *"  # Every 15 minutes
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py quick"
      platform: telegram
      channel: "8546830330"
      enabled: true
      
    - name: "Hourly Report"
      schedule: "0 * * * *"  # Every hour
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py hourly"
      platform: telegram
      channel: "8546830330"
      enabled: true
      
    - name: "Daily Summary"
      schedule: "0 9 * * *"  # 9 AM daily
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py daily"
      platform: telegram
      channel: "8546830330"
      enabled: true
```

Save and exit.

### Step 6: Restart Hermes Gateway

```bash
# Stop current gateway
screen -S hermes-telegram -X quit

# Start new gateway with updated config
cd /root/.hermes
screen -dmS hermes-telegram bash -lc 'export PATH=/root/.hermes/node/bin:/root/.local/bin:$PATH; hermes gateway'

# Verify it's running
screen -ls
ps aux | grep "hermes gateway"
```

### Step 7: Test Cron Jobs

```bash
# Manually trigger a cron job to test
cd /root/.hermes/skills/monitoring
python3 unified_monitor.py quick

# Check if report appears in Telegram
# You should receive a message in your Telegram channel
```

### Step 8: Verify Automated Reports

Wait 15 minutes and check your Telegram channel. You should receive:
- Quick health check every 15 minutes
- Hourly detailed report on the hour
- Daily summary at 9 AM

## Configuration Details

### n8n API Setup

1. **Get API Key:**
   - Log into your n8n instance
   - Go to Settings → API
   - Generate new API key
   - Copy the key

2. **Find API URL:**
   - Your n8n URL + `/api/v1`
   - Example: `https://n8n.yourdomain.com/api/v1`

3. **Test API Access:**
   ```bash
   curl -H "X-N8N-API-KEY: your_key" https://n8n.yourdomain.com/api/v1/workflows
   ```

### Retell API Setup

1. **Get API Key:**
   - Log into Retell dashboard
   - Go to Settings → API Keys
   - Copy your API key

2. **Test API Access:**
   ```bash
   curl -H "Authorization: Bearer your_key" https://api.retellai.com/list-calls
   ```

### Telegram Channel Setup

Your Telegram channel ID is already configured: `8546830330`

To change it:
1. Get your channel ID from Hermes
2. Update `TELEGRAM_ALERT_CHANNEL` in `.env`
3. Update `channel` in cron jobs in `config.yaml`

## Customization

### Adjust Monitoring Frequency

Edit cron schedules in `config.yaml`:

```yaml
# Every 5 minutes (more frequent)
schedule: "*/5 * * * *"

# Every 30 minutes (less frequent)
schedule: "*/30 * * * *"

# Every 6 hours
schedule: "0 */6 * * *"

# Twice daily (9 AM and 5 PM)
schedule: "0 9,17 * * *"
```

### Customize Alert Thresholds

Edit `.env`:

```bash
# More sensitive (alert sooner)
ALERT_THRESHOLD_ERROR_RATE=0.02  # Alert at 2% error rate
ALERT_THRESHOLD_SLOW_EXECUTION=20  # Alert at 20s
ALERT_THRESHOLD_QUALITY_SCORE=85  # Alert below 85%

# Less sensitive (fewer alerts)
ALERT_THRESHOLD_ERROR_RATE=0.10  # Alert at 10% error rate
ALERT_THRESHOLD_SLOW_EXECUTION=60  # Alert at 60s
ALERT_THRESHOLD_QUALITY_SCORE=60  # Alert below 60%
```

### Add Custom Checks

Edit `unified_monitor.py` and add your own monitoring logic:

```python
def custom_supabase_check(self):
    """Check Supabase database health"""
    import os
    from supabase import create_client
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )
    
    # Check recent QC data
    result = supabase.table("call_logs").select("*").limit(10).execute()
    
    return {
        "status": "healthy" if len(result.data) > 0 else "warning",
        "recent_records": len(result.data)
    }
```

## Monitoring What Gets Checked

### Every 15 Minutes (Quick Check)
- n8n workflow status (active/inactive)
- Recent execution count
- Success rate
- Failed executions
- Retell call count
- Call completion rate
- Critical errors

### Every Hour (Detailed Report)
- All quick check items
- Slow execution detection
- Node-level failures
- Transcript availability
- AI quality scores
- Sentiment analysis
- Specific error messages
- Anomaly detection

### Daily (Full Summary)
- 24-hour metrics
- Trend analysis
- Peak usage times
- After-hours patterns
- Quality degradation
- Recommendations
- Action items

## Troubleshooting

### Issue: No reports in Telegram

**Check:**
```bash
# 1. Verify Hermes gateway is running
screen -ls
ps aux | grep "hermes gateway"

# 2. Check cron jobs are enabled
cat /root/.hermes/config.yaml | grep -A 20 "cron:"

# 3. Test manual execution
cd /root/.hermes/skills/monitoring
python3 unified_monitor.py quick

# 4. Check Hermes logs
tail -f /root/.hermes/logs/gateway.out
```

### Issue: API errors in reports

**Check:**
```bash
# 1. Verify API credentials
cat /root/.hermes/.env | grep -E "N8N_API|RETELL_API"

# 2. Test n8n API manually
curl -H "X-N8N-API-KEY: your_key" https://your-n8n.com/api/v1/workflows

# 3. Test Retell API manually
curl -H "Authorization: Bearer your_key" https://api.retellai.com/list-calls

# 4. Check network connectivity
ping api.retellai.com
```

### Issue: Python import errors

**Fix:**
```bash
# Install missing dependencies
pip3 install requests python-dotenv

# Verify installation
python3 -c "import requests; import dotenv; print('OK')"
```

### Issue: Cron jobs not executing

**Check:**
```bash
# 1. Verify cron syntax
hermes cron list

# 2. Check Hermes version supports cron
hermes --version

# 3. Manually test cron command
cd /root/.hermes/skills/monitoring && python3 unified_monitor.py quick

# 4. Check for errors in logs
grep -i error /root/.hermes/logs/*.log
```

## Maintenance

### Update Monitoring Scripts

```bash
# 1. Backup current scripts
cd /root/.hermes/skills/monitoring
cp -r . ../monitoring_backup_$(date +%Y%m%d)

# 2. Upload new versions from local machine
scp *.py root@187.127.141.170:/root/.hermes/skills/monitoring/

# 3. Test new scripts
python3 unified_monitor.py quick

# 4. Restart Hermes if needed
screen -S hermes-telegram -X quit
cd /root/.hermes && screen -dmS hermes-telegram bash -lc 'hermes gateway'
```

### View Historical Data

Monitoring reports are sent to Telegram, which serves as your historical log.

To save reports locally:

```bash
# Redirect output to log file
cd /root/.hermes/skills/monitoring
python3 unified_monitor.py daily >> /root/.hermes/logs/monitoring_$(date +%Y%m%d).log
```

### Backup Configuration

```bash
# Backup monitoring setup
tar -czf monitoring_backup_$(date +%Y%m%d).tar.gz \
  /root/.hermes/skills/monitoring \
  /root/.hermes/.env \
  /root/.hermes/config.yaml

# Download backup to local machine
scp root@187.127.141.170:/root/monitoring_backup_*.tar.gz .
```

## Advanced Features

### Integration with Synta MCP

Use MCP tools for advanced n8n monitoring:

```python
# Add to unified_monitor.py
def check_with_mcp(self):
    """Use Synta MCP for workflow validation"""
    import subprocess
    import json
    
    # Call MCP tool via Hermes
    result = subprocess.run(
        ["hermes", "chat", "-q", "Use mcp0_n8n_validate_workflow to check all workflows"],
        capture_output=True,
        text=True
    )
    
    return result.stdout
```

### Predictive Alerting

Add trend analysis to predict issues:

```python
def predict_issues(self, hours=24):
    """Predict potential issues based on trends"""
    recent = self.get_recent_executions(hours=1)
    baseline = self.get_recent_executions(hours=hours)
    
    # Calculate trend
    recent_error_rate = calculate_error_rate(recent)
    baseline_error_rate = calculate_error_rate(baseline)
    
    if recent_error_rate > baseline_error_rate * 1.5:
        return {
            "alert": "Error rate trending up",
            "prediction": "Possible system degradation in next 2 hours"
        }
```

### Custom Notifications

Send alerts to multiple channels:

```python
def send_critical_alert(message):
    """Send to multiple channels for critical issues"""
    # Telegram
    send_to_telegram(message)
    
    # Email (if configured)
    send_email(message)
    
    # Slack (if configured)
    send_to_slack(message)
```

## Next Steps

1. ✅ Deploy monitoring system
2. ✅ Configure API credentials
3. ✅ Set up cron jobs
4. ✅ Test reports in Telegram
5. 🔄 Monitor for 24 hours
6. 🔄 Adjust thresholds based on baseline
7. 🔄 Add custom checks for your workflows
8. 🔄 Set up alerting rules
9. 🔄 Document your specific monitoring needs

## Support & Resources

- **Hermes Documentation:** https://hermes-agent.nousresearch.com/docs/
- **n8n API Docs:** https://docs.n8n.io/api/
- **Retell API Docs:** https://docs.retellai.com/
- **Synta MCP:** Use `hermes mcp` commands

## Version History

- **v1.0.0** (2026-04-13) - Initial release
  - n8n workflow monitoring
  - Retell call monitoring
  - Transcript quality analysis
  - Automated Telegram reporting
  - Cron job integration
