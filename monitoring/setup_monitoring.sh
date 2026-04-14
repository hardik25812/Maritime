#!/bin/bash
# Hermes Monitoring System Setup Script
# Run this on your VPS to set up automated monitoring

set -e

echo "🚀 Hermes Monitoring System Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (or with sudo)${NC}"
    exit 1
fi

# Check if Hermes is installed
if [ ! -d "/root/.hermes" ]; then
    echo -e "${RED}Hermes not found at /root/.hermes${NC}"
    echo "Please install Hermes first: https://hermes-agent.nousresearch.com/docs/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Hermes installation found"

# Create monitoring directory
MONITORING_DIR="/root/.hermes/skills/monitoring"
mkdir -p "$MONITORING_DIR"
cd "$MONITORING_DIR"

echo -e "${GREEN}✓${NC} Created monitoring directory: $MONITORING_DIR"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install requests python-dotenv >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Python dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Some dependencies may have failed to install"
fi

# Check if monitoring scripts exist
REQUIRED_FILES=("n8n_health_monitor.py" "retell_call_monitor.py" "unified_monitor.py")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠ Missing monitoring scripts:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    echo "Please upload these files to $MONITORING_DIR"
    echo "From your local machine, run:"
    echo "  scp monitoring/*.py root@187.127.141.170:$MONITORING_DIR/"
    exit 1
fi

echo -e "${GREEN}✓${NC} All monitoring scripts found"

# Make scripts executable
chmod +x *.py
echo -e "${GREEN}✓${NC} Scripts made executable"

# Check .env configuration
echo ""
echo "🔧 Checking configuration..."

ENV_FILE="/root/.hermes/.env"
MISSING_VARS=()

# Check for required environment variables
if ! grep -q "N8N_API_URL" "$ENV_FILE" 2>/dev/null; then
    MISSING_VARS+=("N8N_API_URL")
fi

if ! grep -q "N8N_API_KEY" "$ENV_FILE" 2>/dev/null; then
    MISSING_VARS+=("N8N_API_KEY")
fi

if ! grep -q "RETELL_API_KEY" "$ENV_FILE" 2>/dev/null; then
    MISSING_VARS+=("RETELL_API_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Missing configuration in $ENV_FILE:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please add these to $ENV_FILE:"
    echo ""
    echo "# n8n API Configuration"
    echo "N8N_API_URL=https://your-n8n-instance.com/api/v1"
    echo "N8N_API_KEY=your_n8n_api_key"
    echo ""
    echo "# Retell API Configuration"
    echo "RETELL_API_KEY=your_retell_api_key"
    echo ""
    echo "# Monitoring Configuration"
    echo "TELEGRAM_ALERT_CHANNEL=8546830330"
    echo ""
    read -p "Press Enter to edit .env now, or Ctrl+C to exit and edit manually..."
    nano "$ENV_FILE"
else
    echo -e "${GREEN}✓${NC} Configuration found in .env"
fi

# Test monitoring scripts
echo ""
echo "🧪 Testing monitoring scripts..."

# Test n8n monitor
echo -n "  Testing n8n monitor... "
if python3 n8n_health_monitor.py >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (may need API credentials)${NC}"
fi

# Test Retell monitor
echo -n "  Testing Retell monitor... "
if python3 retell_call_monitor.py >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (may need API credentials)${NC}"
fi

# Test unified monitor
echo -n "  Testing unified monitor... "
if python3 unified_monitor.py quick >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (may need API credentials)${NC}"
fi

# Check if cron jobs are configured
echo ""
echo "⏰ Checking cron job configuration..."

CONFIG_FILE="/root/.hermes/config.yaml"

if grep -q "Quick Health Check" "$CONFIG_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Cron jobs already configured"
else
    echo -e "${YELLOW}⚠${NC} Cron jobs not configured"
    echo ""
    echo "Add this to $CONFIG_FILE:"
    echo ""
    cat << 'EOF'
cron:
  jobs:
    - name: "Quick Health Check"
      schedule: "*/15 * * * *"
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py quick"
      platform: telegram
      channel: "8546830330"
      enabled: true
      
    - name: "Hourly Report"
      schedule: "0 * * * *"
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py hourly"
      platform: telegram
      channel: "8546830330"
      enabled: true
      
    - name: "Daily Summary"
      schedule: "0 9 * * *"
      command: "cd /root/.hermes/skills/monitoring && python3 unified_monitor.py daily"
      platform: telegram
      channel: "8546830330"
      enabled: true
EOF
    echo ""
    read -p "Press Enter to edit config.yaml now, or Ctrl+C to skip..."
    nano "$CONFIG_FILE"
fi

# Offer to restart Hermes gateway
echo ""
echo "🔄 Hermes Gateway Restart"
echo ""
read -p "Restart Hermes gateway to apply changes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping current gateway..."
    screen -S hermes-telegram -X quit 2>/dev/null || true
    pkill -f "hermes gateway" 2>/dev/null || true
    sleep 2
    
    echo "Starting new gateway..."
    cd /root/.hermes
    screen -dmS hermes-telegram bash -lc 'export PATH=/root/.hermes/node/bin:/root/.local/bin:$PATH; hermes gateway'
    sleep 3
    
    if screen -ls | grep -q "hermes-telegram"; then
        echo -e "${GREEN}✓${NC} Hermes gateway restarted successfully"
    else
        echo -e "${RED}✗${NC} Failed to restart gateway"
        echo "Try manually: screen -dmS hermes-telegram bash -lc 'hermes gateway'"
    fi
fi

# Final summary
echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Verify API credentials in /root/.hermes/.env"
echo "2. Check cron jobs in /root/.hermes/config.yaml"
echo "3. Test monitoring:"
echo "   cd $MONITORING_DIR"
echo "   python3 unified_monitor.py quick"
echo ""
echo "4. Monitor Telegram channel (8546830330) for reports"
echo ""
echo "📚 Documentation: $MONITORING_DIR/SKILL.md"
echo "🔧 Deployment Guide: $MONITORING_DIR/DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Your AI agents are now being monitored!"
echo ""
