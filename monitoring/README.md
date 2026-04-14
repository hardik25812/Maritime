# Hermes AI Agent Monitoring System

Automated monitoring and reporting for n8n workflows, Retell AI calls, and transcript quality analysis.

## What This Does

Your Hermes agent becomes a **24/7 reporter** that:

✅ Monitors n8n workflow health (executions, failures, slow nodes)  
✅ Tracks Retell call quality (duration, completion, transcripts)  
✅ Analyzes AI responses (quality, sentiment, data collection)  
✅ Detects errors before they become problems  
✅ Sends automated reports to Telegram  
✅ Provides on-demand health checks  

## Quick Start

### 1. Upload Files to VPS

```powershell
# From Windows (local machine)
cd C:\Users\hardi\Downloads\Maritimw\monitoring

scp *.py root@187.127.141.170:/root/.hermes/skills/monitoring/
scp *.sh root@187.127.141.170:/root/.hermes/skills/monitoring/
scp *.md root@187.127.141.170:/root/.hermes/skills/monitoring/
```

### 2. Run Setup on VPS

```bash
# SSH into VPS
ssh root@187.127.141.170

# Run setup script
cd /root/.hermes/skills/monitoring
chmod +x setup_monitoring.sh
./setup_monitoring.sh
```

### 3. Configure API Keys

Edit `/root/.hermes/.env` and add:

```bash
N8N_API_URL=https://your-n8n.com/api/v1
N8N_API_KEY=your_api_key
RETELL_API_KEY=your_retell_key
TELEGRAM_ALERT_CHANNEL=8546830330
```

### 4. Test It

```bash
cd /root/.hermes/skills/monitoring
python3 unified_monitor.py quick
```

You should see a health report and receive it in Telegram!

## What Gets Monitored

### n8n Workflows
- Active/inactive status
- Execution success rate
- Failed workflows with error details
- Slow executions (>30s)
- Node-level failures
- Anomaly detection

### Retell Calls
- Call completion rate
- Average call duration
- Transcript availability
- Call volume patterns
- After-hours detection
- Quality metrics

### AI Transcript Quality
- Information collection completeness
- Required field extraction
- Sentiment analysis (positive/neutral/negative)
- Error/confusion indicators
- Response appropriateness
- Call flow quality

## Automated Reports

### Every 15 Minutes - Quick Check
```
🟢 System Health: HEALTHY
━━━━━━━━━━━━━━━━━━━━
n8n: 12/12 workflows active
Retell: 23 calls (last hour)
Errors: 0 critical, 1 warning
```

### Every Hour - Detailed Report
```
📊 Hourly System Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
n8n: 156 executions (98.7% success)
Retell: 23 calls (avg 3m 42s)
AI Quality: 94%
⚠️ 1 slow workflow detected
```

### Daily at 9 AM - Full Summary
```
📈 Daily Summary Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
n8n: 1,247 executions (98.4% success)
Retell: 187 calls
Trends: Call volume +12%
Issues: 3 workflows need attention
```

## On-Demand Commands

Talk to Hermes in Telegram:

```
/monitor-health quick     → Quick health check
/monitor-health hourly    → Detailed report
/monitor-health daily     → Full summary

/monitor-n8n              → n8n workflow status
/monitor-retell           → Retell call status
/analyze-transcripts 24   → Analyze last 24h of calls
```

## Files Included

```
monitoring/
├── n8n_health_monitor.py      # n8n workflow monitoring
├── retell_call_monitor.py     # Retell call monitoring
├── unified_monitor.py         # Combined monitoring + reports
├── setup_monitoring.sh        # Automated setup script
├── SKILL.md                   # Hermes skill documentation
├── DEPLOYMENT_GUIDE.md        # Detailed deployment guide
└── README.md                  # This file
```

## Architecture

```
┌─────────────────────────────────────────┐
│         HERMES AGENT (Reporter)         │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ n8n API  │  │Retell API│  │Telegram││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │             │             │     │
│       └─────────────┴─────────────┘     │
│                  │                      │
│         ┌────────▼────────┐             │
│         │ Unified Monitor │             │
│         └────────┬────────┘             │
│                  │                      │
│         ┌────────▼────────┐             │
│         │  Cron Scheduler │             │
│         │  - Every 15 min │             │
│         │  - Hourly       │             │
│         │  - Daily        │             │
│         └─────────────────┘             │
└─────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Telegram Reports│
        └─────────────────┘
```

## Error Detection

The system automatically detects:

### n8n Issues
- Workflow execution failures
- Node timeout errors
- Credential expiration
- Webhook failures
- Google Sheets schema mismatches
- API rate limits

### Retell Issues
- Call drops/disconnections
- Missing transcripts
- Low sentiment scores
- Incomplete information collection
- Agent confusion
- Excessive call duration

### AI Quality Issues
- Off-script responses
- Missing required questions
- Poor call flow
- Customer dissatisfaction signals

## Customization

### Change Monitoring Frequency

Edit `/root/.hermes/config.yaml`:

```yaml
# More frequent (every 5 minutes)
schedule: "*/5 * * * *"

# Less frequent (every 30 minutes)
schedule: "*/30 * * * *"
```

### Adjust Alert Thresholds

Edit `/root/.hermes/.env`:

```bash
# Alert at 2% error rate (more sensitive)
ALERT_THRESHOLD_ERROR_RATE=0.02

# Alert at 10% error rate (less sensitive)
ALERT_THRESHOLD_ERROR_RATE=0.10
```

## Troubleshooting

### No reports in Telegram?

```bash
# Check Hermes is running
screen -ls

# Test monitoring manually
cd /root/.hermes/skills/monitoring
python3 unified_monitor.py quick

# Check logs
tail -f /root/.hermes/logs/gateway.out
```

### API errors?

```bash
# Verify credentials
cat /root/.hermes/.env | grep -E "N8N_API|RETELL_API"

# Test n8n API
curl -H "X-N8N-API-KEY: your_key" https://your-n8n.com/api/v1/workflows

# Test Retell API
curl -H "Authorization: Bearer your_key" https://api.retellai.com/list-calls
```

## Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **SKILL.md** - Hermes skill documentation
- **hermes-monitoring-system.md** - Architecture overview

## Requirements

- VPS with Hermes agent installed
- n8n instance with API access
- Retell AI account with API key
- Telegram bot configured
- Python 3.7+
- `requests` and `python-dotenv` packages

## Support

For issues:
1. Check logs: `/root/.hermes/logs/`
2. Test scripts manually
3. Verify API credentials
4. Check Hermes gateway status

## Version

v1.0.0 - Initial release (April 13, 2026)

---

**Made with ❤️ for automated AI agent monitoring**
