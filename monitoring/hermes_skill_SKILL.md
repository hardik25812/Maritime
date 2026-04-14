# AI Agent Monitoring Skill

Monitor n8n workflows, Retell calls, and AI transcript quality with automated health checks and Telegram reporting.

## Installation

```bash
# On your VPS where Hermes is running
cd /root/.hermes/skills
mkdir -p monitoring
cd monitoring

# Upload the monitoring scripts
# - n8n_health_monitor.py
# - retell_call_monitor.py
# - unified_monitor.py

chmod +x *.py

# Install dependencies
pip install requests python-dotenv
```

## Configuration

Add to `/root/.hermes/.env`:

```bash
# n8n API Configuration
N8N_API_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_n8n_api_key

# Retell API Configuration
RETELL_API_KEY=your_retell_api_key

# Monitoring Thresholds
ALERT_THRESHOLD_ERROR_RATE=0.05
ALERT_THRESHOLD_SLOW_EXECUTION=30
ALERT_THRESHOLD_QUALITY_SCORE=70

# Telegram Channel for Reports
TELEGRAM_ALERT_CHANNEL=8546830330
```

## Usage

### On-Demand Monitoring

```bash
# Quick health check
hermes chat -q "/monitor-health quick"

# Hourly detailed report
hermes chat -q "/monitor-health hourly"

# Daily summary
hermes chat -q "/monitor-health daily"

# Check specific n8n workflow
hermes chat -q "/monitor-n8n workflow_id_here"

# Analyze specific Retell call
hermes chat -q "/monitor-retell call_id_here"
```

### Automated Cron Jobs

Add to `/root/.hermes/config.yaml`:

```yaml
cron:
  jobs:
    - name: "Quick Health Check"
      schedule: "*/15 * * * *"  # Every 15 minutes
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py quick"
      platform: telegram
      channel: "8546830330"
      
    - name: "Hourly Report"
      schedule: "0 * * * *"  # Every hour
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py hourly"
      platform: telegram
      channel: "8546830330"
      
    - name: "Daily Summary"
      schedule: "0 9 * * *"  # 9 AM daily
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py daily"
      platform: telegram
      channel: "8546830330"
```

## Skill Commands

### /monitor-health [mode]

Comprehensive system health check.

**Modes:**
- `quick` - Fast 15-minute check (default)
- `hourly` - Detailed hourly analysis
- `daily` - Full daily summary with trends

**Example:**
```
User: /monitor-health quick
Hermes: 🟢 System Health: HEALTHY
━━━━━━━━━━━━━━━━━━━━
n8n: 12/12 workflows active
Retell: 23 calls (last hour)
Errors: 0 critical, 1 warning
```

### /monitor-n8n [workflow_id]

Deep dive into n8n workflow health.

**Without workflow_id:** Shows all workflows
**With workflow_id:** Analyzes specific workflow

**Example:**
```
User: /monitor-n8n
Hermes: 📊 n8n Workflows
━━━━━━━━━━━━━━━━━━━━
Active: 12/12
Success Rate: 98.4%
Slow: 2 workflows
Failed: 1 workflow
```

### /monitor-retell [call_id]

Analyze Retell call quality and transcripts.

**Without call_id:** Shows recent calls summary
**With call_id:** Deep analysis of specific call

**Example:**
```
User: /monitor-retell abc123
Hermes: 📞 Call Analysis: abc123
━━━━━━━━━━━━━━━━━━━━━━━━━
Duration: 3m 42s
Quality Score: 87%
Info Collection: 92%
Sentiment: Positive
Issues: None
```

### /analyze-transcripts [hours]

Batch analyze recent call transcripts.

**Default:** Last 1 hour
**hours:** Number of hours to analyze

**Example:**
```
User: /analyze-transcripts 24
Hermes: 🤖 Transcript Analysis (24h)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Calls Analyzed: 187
Avg Quality: 93.2%
Info Collection: 91.4%
Sentiment: 😊 142 | 😐 38 | 😞 7
Low Quality: 8 calls need review
```

## What Gets Monitored

### n8n Workflows
- ✅ Active/inactive status
- ✅ Execution success rate
- ✅ Node-level failures
- ✅ Execution duration (slow detection)
- ✅ Error patterns
- ✅ Anomaly detection vs baseline

### Retell Calls
- ✅ Call completion rate
- ✅ Average call duration
- ✅ Transcript availability
- ✅ Recording status
- ✅ Call volume patterns
- ✅ After-hours detection

### AI Transcript Quality
- ✅ Response appropriateness
- ✅ Information collection completeness
- ✅ Required field extraction
- ✅ Sentiment analysis
- ✅ Error/confusion indicators
- ✅ Call flow quality

## Alert Thresholds

### Critical Alerts (🔴)
- n8n success rate < 80%
- Retell completion rate < 70%
- AI quality score < 60%
- 5+ workflow failures in 1 hour

### Warning Alerts (🟡)
- n8n success rate < 95%
- Retell completion rate < 90%
- AI quality score < 80%
- Slow executions (>30s)
- Missing transcripts

### Healthy Status (🟢)
- n8n success rate > 95%
- Retell completion rate > 90%
- AI quality score > 80%
- No critical issues

## Report Examples

### Quick Check (Every 15 min)
```
🟢 System Health: HEALTHY
━━━━━━━━━━━━━━━━━━━━
Time: 2:15 PM

🔄 n8n Workflows
Active: 12/12
Executions: 42 (last hour)
Success Rate: 98%

📞 Retell Calls
Calls: 23 (last hour)
Completed: 22
Avg Duration: 3m 42s

🎯 Action Items:
1. Check slow workflows: 2 detected
```

### Hourly Report
```
📊 Hourly System Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
April 13, 2026 - 2:00 PM

🔄 n8n Workflows
━━━━━━━━━━━━━━━━━━━━
Status: 🟢 HEALTHY
Executions: 156 (98.7% success)
Slow: "SFSBI Intake" (45s avg)

📞 Retell Calls
━━━━━━━━━━━━━━━━━━━━
Status: 🟢 HEALTHY
Total: 23 calls
Completed: 22
Avg Duration: 3m 42s

🤖 AI Quality Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━
Calls Analyzed: 22
Avg Quality Score: 94%
Info Collection Rate: 91%
Sentiment: 😊 18 | 😐 3 | 😞 1

⚠️ 1 call needs review
```

### Daily Summary (9 AM)
```
📈 Daily Summary Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
April 13, 2026

📊 24-Hour Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━
n8n Executions: 1,247 (98.4% success)
Retell Calls: 187 (avg 3m 28s)
AI Quality Score: 93.2%

🔍 Trends & Patterns
━━━━━━━━━━━━━━━━━━━━━━━━━
Peak Call Hour: 14:00
After-Hours Calls: 12
📌 High after-hours volume (6.4%)

⚠️ Issues & Recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Fix 'Property Lookup': 3 failures
2. Optimize 'SFSBI Intake': 12 slow executions
3. Review AI prompts: 8 low-quality calls
4. Improve info collection: 11 incomplete calls
```

## Error Detection Patterns

### n8n Errors Caught
- Workflow execution failures
- Node timeout errors
- Credential expiration
- Webhook failures
- Rate limit hits
- Google Sheets schema mismatches
- API connection errors

### Retell Issues Caught
- Call drops/disconnections
- Transcript generation failures
- Low sentiment scores
- Missing required fields
- Agent confusion indicators
- Excessive call duration
- Low audio quality

### AI Quality Issues
- Incomplete information collection
- Off-script responses
- Inappropriate tone
- Missing required questions
- Incorrect data extraction
- Poor call flow
- Customer dissatisfaction signals

## Predictive Alerts

The system detects early warning signals:

1. **Degrading Performance**
   - Execution time trending up
   - Success rate trending down
   - Alert before SLA breach

2. **Resource Exhaustion**
   - API rate limit approaching
   - High error rates
   - Unusual traffic patterns

3. **Quality Degradation**
   - AI response quality dropping
   - Customer sentiment declining
   - Data completeness decreasing

## Integration with Synta MCP

For advanced n8n monitoring, the skill can use Synta MCP tools:

```python
# Example: Using MCP for workflow validation
from mcp import MCPClient

mcp = MCPClient()
workflows = mcp.call("mcp0_n8n_list_workflows")
for workflow in workflows:
    validation = mcp.call("mcp0_n8n_validate_workflow", {"id": workflow["id"]})
    if validation["errors"]:
        # Alert on validation errors
        send_alert(f"Workflow {workflow['name']} has validation errors")
```

## Troubleshooting

### No data returned
- Check API credentials in `.env`
- Verify n8n/Retell API endpoints are accessible
- Check network connectivity from VPS

### Cron jobs not running
- Verify cron syntax in `config.yaml`
- Check Hermes gateway is running: `screen -ls`
- Check logs: `tail -f /root/.hermes/logs/gateway.out`

### Missing transcripts
- Retell transcripts may take 1-2 minutes to generate
- Check Retell API quota/limits
- Verify call completed successfully

## Advanced Usage

### Custom Thresholds

Edit monitoring scripts to customize thresholds:

```python
# In n8n_health_monitor.py
SLOW_EXECUTION_THRESHOLD = 30  # seconds
ERROR_RATE_THRESHOLD = 0.05    # 5%

# In retell_call_monitor.py
MIN_CALL_DURATION = 60         # seconds
QUALITY_SCORE_THRESHOLD = 70   # percentage
```

### Add Custom Checks

Extend the monitors with your own checks:

```python
# In unified_monitor.py
def custom_check(self):
    # Your custom monitoring logic
    # Check Supabase data, external APIs, etc.
    pass
```

## Support

For issues or questions:
1. Check logs: `/root/.hermes/logs/`
2. Test scripts manually: `python3 unified_monitor.py quick`
3. Verify API credentials
4. Check Hermes gateway status

## Version

v1.0.0 - Initial release
