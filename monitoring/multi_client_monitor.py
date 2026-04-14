#!/usr/bin/env python3
"""
Multi-Client Monitoring System
Monitors multiple clients separately based on clients_config.json
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Any
from unified_monitor import UnifiedMonitor

# Get script directory
SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "clients_config.json"


def load_client_config() -> Dict:
    """Load client configuration"""
    if not CONFIG_FILE.exists():
        return {"clients": [], "global": {"telegram_channel": "8546830330", "monitor_all_clients": True}}
    
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)


def monitor_client(client_config: Dict, mode: str = "quick") -> str:
    """Monitor a specific client"""
    client_filter = {
        "name": client_config["name"],
        "tag": client_config.get("n8n", {}).get("tag"),
        "prefix": client_config.get("n8n", {}).get("prefix"),
        "agent_id": client_config.get("retell", {}).get("agent_id")
    }
    
    monitor = UnifiedMonitor(client_filter=client_filter)
    return monitor.get_report(mode)


def monitor_all_clients(mode: str = "quick") -> str:
    """Monitor all enabled clients and generate combined report"""
    config = load_client_config()
    enabled_clients = [c for c in config["clients"] if c.get("enabled", True)]
    
    if not enabled_clients:
        return "⚠️ No enabled clients found in configuration"
    
    reports = []
    
    # Global overview first
    if config.get("global", {}).get("monitor_all_clients", True):
        global_monitor = UnifiedMonitor(client_filter=None)
        global_report = global_monitor.get_report(mode)
        reports.append(global_report)
        reports.append("\n" + "="*50 + "\n")
    
    # Individual client reports
    for client in enabled_clients:
        client_report = monitor_client(client, mode)
        reports.append(client_report)
        reports.append("\n" + "="*50 + "\n")
    
    return "\n".join(reports)


def list_clients() -> str:
    """List all configured clients"""
    config = load_client_config()
    clients = config.get("clients", [])
    
    if not clients:
        return "No clients configured"
    
    output = "📋 Configured Clients:\n"
    output += "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    
    for i, client in enumerate(clients, 1):
        status = "✅ Enabled" if client.get("enabled", True) else "❌ Disabled"
        output += f"{i}. {client['name']} - {status}\n"
        output += f"   n8n tag: {client.get('n8n', {}).get('tag', 'N/A')}\n"
        output += f"   n8n prefix: {client.get('n8n', {}).get('prefix', 'N/A')}\n"
        output += f"   Retell agent: {client.get('retell', {}).get('agent_id', 'N/A')}\n"
        output += "\n"
    
    return output


def main():
    """CLI interface for multi-client monitoring"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Multi-client monitoring system")
    parser.add_argument("mode", choices=["quick", "hourly", "daily", "list"], default="quick", nargs="?", 
                       help="Report mode or 'list' to show clients")
    parser.add_argument("--client", help="Monitor specific client by name")
    parser.add_argument("--all", action="store_true", help="Monitor all enabled clients")
    args = parser.parse_args()
    
    # List clients
    if args.mode == "list":
        print(list_clients())
        return
    
    # Monitor specific client
    if args.client:
        config = load_client_config()
        client_config = next((c for c in config["clients"] if c["name"].lower() == args.client.lower()), None)
        
        if not client_config:
            print(f"❌ Client '{args.client}' not found in configuration")
            print("\nAvailable clients:")
            print(list_clients())
            sys.exit(1)
        
        if not client_config.get("enabled", True):
            print(f"⚠️ Warning: Client '{args.client}' is disabled in configuration")
        
        report = monitor_client(client_config, args.mode)
        print(report)
        return
    
    # Monitor all clients
    if args.all:
        report = monitor_all_clients(args.mode)
        print(report)
        return
    
    # Default: monitor global (all workflows/calls)
    monitor = UnifiedMonitor(client_filter=None)
    report = monitor.get_report(args.mode)
    print(report)


if __name__ == "__main__":
    main()
