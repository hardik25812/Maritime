# Multi-Client Monitoring Setup

## Overview

The monitoring system now supports **per-client filtering** so you can track each client's workflows and calls separately.

## How It Works

### Client Identification

Clients are identified by:
1. **n8n workflow tags** - e.g., `client:maritime`, `client:acme`
2. **n8n workflow name prefix** - e.g., `Maritime - Lead Capture`
3. **Retell agent ID** - Each client has their own Retell AI agent

### Configuration File

Edit `clients_config.json` to define your clients:

```json
{
  "clients": [
    {
      "name": "Maritime",
      "n8n": {
        "tag": "client:maritime",
        "prefix": "Maritime - "
      },
      "retell": {
        "agent_id": "agent_maritime_xxx"
      },
      "telegram_channel": "8546830330",
      "enabled": true
    }
  ]
}
```

## Usage

### Monitor All Clients (Global View)
```bash
python3 unified_monitor.py quick
python3 unified_monitor.py hourly
python3 unified_monitor.py daily
```

### Monitor Specific Client
```bash
# By client name (from config)
python3 multi_client_monitor.py quick --client Maritime
python3 multi_client_monitor.py hourly --client "ACME Corp"

# By filters (manual)
python3 unified_monitor.py quick --client Maritime --tag client:maritime --prefix "Maritime - " --agent-id agent_xxx
```

### Monitor All Clients Separately
```bash
python3 multi_client_monitor.py quick --all
python3 multi_client_monitor.py hourly --all
```

### List Configured Clients
```bash
python3 multi_client_monitor.py list
```

## Report Examples

### Global Report (All Clients)
```
🏥 All Clients Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status: 🟢 HEALTHY
Time: 02:30 PM

🔄 n8n Workflows
Active: 25/30
Executions: 156 (last hour)
Success Rate: 98.7%

📞 Retell Calls
Calls: 45 (last hour)
Completed: 43
Avg Duration: 3m 42s
```

### Per-Client Report
```
🏥 Maritime Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status: 🟢 HEALTHY
Time: 02:30 PM

🔄 n8n Workflows
Active: 8/10
Executions: 42 (last hour)
Success Rate: 100%

📞 Retell Calls
Calls: 15 (last hour)
Completed: 15
Avg Duration: 4m 12s
```

## Automated Monitoring

### Option 1: Global Monitoring (Current Setup)
Monitors all clients together - good for overall system health.

Cron jobs already configured in `/root/.hermes/config.yaml`:
- Every 15 min: Quick check (all clients)
- Every hour: Detailed report (all clients)
- Daily 9 AM: Summary (all clients)

### Option 2: Per-Client Monitoring
Monitor each client separately with individual reports.

Add to `/root/.hermes/config.yaml`:

```yaml
  # Maritime client monitoring
  - name: "maritime_quick_health"
    schedule: "*/15 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py quick --client Maritime"
    enabled: true

  - name: "maritime_hourly_report"
    schedule: "0 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py hourly --client Maritime"
    enabled: true

  # ACME client monitoring
  - name: "acme_quick_health"
    schedule: "*/15 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py quick --client 'ACME Corp'"
    enabled: true
```

### Option 3: Combined Monitoring
Monitor all clients in one report showing each separately.

```yaml
  - name: "all_clients_quick_health"
    schedule: "*/15 * * * *"
    command: "cd /root/.hermes/skills/monitoring && /root/.hermes/hermes-agent/venv/bin/python3 multi_client_monitor.py quick --all"
    enabled: true
```

## Setup Steps

### 1. Configure Your Clients

Edit `clients_config.json` with your actual client data:

```bash
ssh root@187.127.141.170
cd /root/.hermes/skills/monitoring
nano clients_config.json
```

Update:
- Client names
- n8n tags (must match tags in your n8n workflows)
- n8n prefixes (must match workflow naming convention)
- Retell agent IDs (get from Retell dashboard)

### 2. Tag Your n8n Workflows

In n8n, add tags to workflows:
- Go to workflow settings
- Add tag: `client:maritime` (or your client identifier)
- Save workflow

### 3. Test Client Filtering

```bash
# List clients
python3 multi_client_monitor.py list

# Test specific client
python3 multi_client_monitor.py quick --client Maritime

# Test all clients
python3 multi_client_monitor.py quick --all
```

### 4. Update Cron Jobs (Optional)

If you want per-client monitoring instead of global:

```bash
nano /root/.hermes/config.yaml
```

Replace existing monitoring cron jobs with per-client versions (see Option 2 above).

Then restart Hermes:
```bash
screen -S hermes-telegram -X quit
cd /root/.hermes && screen -dmS hermes-telegram bash -c 'export PATH=/root/.hermes/node/bin:/root/.local/bin:$PATH && hermes gateway'
```

## Best Practices

### Naming Conventions

**n8n Workflows:**
- Use consistent prefixes: `Maritime - Lead Capture`, `Maritime - Booking Flow`
- Add client tags: `client:maritime`
- Both methods work together for redundancy

**Retell Agents:**
- One agent per client
- Name agents clearly: `Maritime AI Receptionist`, `ACME Support Bot`

### Monitoring Strategy

**Small Setup (1-3 clients):**
- Use global monitoring (current setup)
- Check per-client reports manually when needed

**Medium Setup (4-10 clients):**
- Use combined monitoring (`--all` flag)
- Get one report showing all clients separately

**Large Setup (10+ clients):**
- Use per-client cron jobs
- Each client gets individual monitoring
- Different Telegram channels per client (optional)

## Troubleshooting

### No data for specific client

1. **Check n8n tags:**
   ```bash
   # List all workflows and their tags
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" https://n8n.srv1546601.hstgr.cloud/api/v1/workflows
   ```

2. **Check workflow names:**
   - Ensure workflows start with correct prefix
   - Case-sensitive matching

3. **Check Retell agent ID:**
   ```bash
   # List recent calls and their agent IDs
   curl -H "Authorization: Bearer $RETELL_API_KEY" https://api.retellai.com/list-calls
   ```

### Client not found error

- Check spelling in `clients_config.json`
- Client names are case-sensitive
- Use `python3 multi_client_monitor.py list` to see exact names

## Migration from Global to Per-Client

Current setup monitors everything globally. To migrate:

1. **Keep global monitoring running** (don't break existing setup)
2. **Add client configs** to `clients_config.json`
3. **Test per-client reports** manually first
4. **Add per-client cron jobs** alongside global ones
5. **Monitor both for 24h** to ensure accuracy
6. **Remove global cron jobs** once confident

## Support

For issues or questions about multi-client monitoring, check:
- `clients_config.json` - Client definitions
- `/root/.hermes/.env` - API credentials
- `/root/.hermes/config.yaml` - Cron job configuration
