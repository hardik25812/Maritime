# Hermes AI Agent Monitoring System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     HERMES AGENT (Reporter)                      │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  n8n Monitor   │  │ Retell Monitor │  │ Transcript QC    │  │
│  │  - Workflows   │  │ - Call Logs    │  │ - AI Responses   │  │
│  │  - Executions  │  │ - Recordings   │  │ - Error Detection│  │
│  │  - Node Status │  │ - Duration     │  │ - Quality Score  │  │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘  │
│           │                   │                    │             │
│           └───────────────────┴────────────────────┘             │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Cron Scheduler   │                        │
│                    │  - Every 15 min    │                        │
│                    │  - Hourly reports  │                        │
│                    │  - Daily summaries │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │ Telegram Reporter  │                        │
│                    │  - Health checks   │                        │
│                    │  - Error alerts    │                        │
│                    │  - Trend analysis  │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Telegram Channel  │
                    │   (Your Reports)   │
                    └───────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   n8n API       │  │   Retell API    │  │  Supabase DB    │
│  - Workflows    │  │  - Calls        │  │  - QC Data      │
│  - Executions   │  │  - Transcripts  │  │  - Metrics      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Components

### 1. n8n Workflow Monitor
**What it checks:**
- Active/inactive workflows
- Recent execution status (success/error)
- Node-level failures
- Execution duration anomalies
- Webhook availability
- Credential validity

**API Endpoints Used:**
- `GET /workflows` - List all workflows
- `GET /executions` - Recent executions
- `GET /executions/{id}` - Execution details with node data

### 2. Retell Call Monitor
**What it checks:**
- Call completion rate
- Average call duration
- Transcript availability
- Recording status
- Agent response quality
- Error patterns in conversations

**API Endpoints Used:**
- `GET /list-calls` - Recent calls
- `GET /get-call/{call_id}` - Call details + transcript
- `GET /list-agents` - Agent status

### 3. Transcript Quality Checker
**What it analyzes:**
- AI response appropriateness
- Information collection completeness
- Sentiment detection
- Error/confusion indicators
- Compliance with scripts
- Customer satisfaction signals

### 4. Cron Schedule
```
Every 15 minutes: Quick health check (n8n + Retell)
Every hour: Detailed analysis + transcript review
Every 4 hours: Trend analysis
Daily at 9 AM: Full report with recommendations
```

## Implementation Plan

### Phase 1: Core Monitoring Scripts
1. `n8n_health_check.py` - n8n workflow monitoring
2. `retell_monitor.py` - Retell call monitoring
3. `transcript_analyzer.py` - AI response quality analysis
4. `telegram_reporter.py` - Formatted Telegram reports

### Phase 2: Hermes Skills
1. `/monitor-n8n` - On-demand n8n check
2. `/monitor-retell` - On-demand Retell check
3. `/analyze-transcripts` - Transcript quality analysis
4. `/health-report` - Full system health report

### Phase 3: Automation
1. Set up Hermes cron jobs
2. Configure Telegram channel delivery
3. Set up alert thresholds
4. Enable predictive error detection

## Data Sources

### n8n API
```
Base URL: https://your-n8n-instance.com/api/v1
Auth: X-N8N-API-KEY header
```

### Retell API
```
Base URL: https://api.retellai.com
Auth: Bearer token
```

### Synta MCP (n8n integration)
- Use MCP tools for n8n workflow inspection
- `mcp0_n8n_list_workflows`
- `mcp0_n8n_manage_executions`
- `mcp0_n8n_validate_workflow`

## Report Format (Telegram)

### Quick Health Check (Every 15 min)
```
🟢 System Health: OK
━━━━━━━━━━━━━━━━━━━━
n8n: 12/12 workflows active
Retell: 23 calls (last hour)
Errors: 0 critical, 1 warning

⚠️ Warning:
- Workflow "SFSBI Intake" slow (45s avg)
```

### Hourly Report
```
📊 Hourly Report - 2:00 PM
━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 n8n Workflows
✅ 12 active, 0 inactive
✅ 156 executions (success: 154, failed: 2)
⚠️ Slow: "SFSBI Intake" (45s avg, +20% vs baseline)

📞 Retell Calls
✅ 23 calls completed
✅ Avg duration: 3m 42s
✅ Transcripts: 23/23 available
⚠️ 1 call with low sentiment score

🤖 AI Quality
✅ Response quality: 94%
✅ Info collection: 91%
⚠️ 2 calls missing property address

🎯 Action Items:
1. Check "SFSBI Intake" workflow performance
2. Review call #abc123 (low sentiment)
```

### Daily Summary (9 AM)
```
📈 Daily Summary - April 13, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 24-Hour Metrics
━━━━━━━━━━━━━━━━
n8n Executions: 1,247 (98.4% success)
Retell Calls: 187 (avg 3m 28s)
AI Quality Score: 93.2%

🔍 Trends
━━━━━━━━
📈 Call volume: +12% vs yesterday
📉 Avg duration: -8s vs yesterday
📊 Success rate: stable

⚠️ Issues Detected
━━━━━━━━━━━━━━━
1. Workflow "Property Lookup" failed 3x
   → Google Sheets timeout
   → Fix: Increase timeout to 30s

2. 5 calls missing urgency_flag
   → Agent not asking urgency question
   → Fix: Update Retell prompt

3. After-hours calls: 12 (expected: 5)
   → Possible timezone issue
   → Investigate

✅ Recommendations
━━━━━━━━━━━━━━━━
1. Scale up n8n instance (CPU at 78%)
2. Add retry logic to Google Sheets node
3. Review Retell agent prompt for urgency
4. Monitor after-hours pattern
```

## Error Detection Patterns

### n8n Errors to Catch
- Workflow execution failures
- Node timeout errors
- Credential expiration
- Webhook failures
- Rate limit hits
- Data validation errors
- Google Sheets schema mismatches

### Retell Errors to Catch
- Call drops/disconnections
- Transcript generation failures
- Low sentiment scores
- Missing required fields
- Agent confusion indicators
- Excessive call duration
- Low audio quality

### AI Response Issues
- Incomplete information collection
- Off-script responses
- Inappropriate tone
- Missing required questions
- Incorrect data extraction
- Poor call flow

## Predictive Alerts

### Early Warning Signals
1. **Degrading Performance**
   - Execution time trending up
   - Success rate trending down
   - Alert before SLA breach

2. **Resource Exhaustion**
   - API rate limit approaching
   - Database connections high
   - Memory/CPU trending up

3. **Quality Degradation**
   - AI response quality dropping
   - Customer sentiment declining
   - Data completeness decreasing

## Configuration Files

### `.env` additions needed
```bash
# n8n API
N8N_API_URL=https://your-n8n.com/api/v1
N8N_API_KEY=your_api_key

# Retell API
RETELL_API_KEY=your_retell_key

# Supabase (for QC data)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Monitoring Config
TELEGRAM_ALERT_CHANNEL=your_channel_id
ALERT_THRESHOLD_ERROR_RATE=0.05
ALERT_THRESHOLD_SLOW_EXECUTION=30
```

### Hermes cron config
```yaml
# Add to ~/.hermes/config.yaml
cron:
  jobs:
    - name: "Quick Health Check"
      schedule: "*/15 * * * *"  # Every 15 minutes
      command: "/monitor-health quick"
      platform: telegram
      
    - name: "Hourly Report"
      schedule: "0 * * * *"  # Every hour
      command: "/monitor-health hourly"
      platform: telegram
      
    - name: "Daily Summary"
      schedule: "0 9 * * *"  # 9 AM daily
      command: "/monitor-health daily"
      platform: telegram
```

## Next Steps

1. **Set up API credentials** for n8n and Retell
2. **Create monitoring scripts** (I'll build these)
3. **Create Hermes skills** for on-demand checks
4. **Configure cron jobs** in Hermes
5. **Test reporting** to Telegram
6. **Fine-tune thresholds** based on your baselines
7. **Add custom checks** for your specific workflows

Would you like me to start building the actual monitoring scripts and Hermes skills now?
