#!/usr/bin/env python3
"""
n8n Workflow Health Monitor
Checks workflow status, executions, and node-level health
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json


class N8nHealthMonitor:
    def __init__(self, client_filter=None):
        self.api_url = os.getenv("N8N_API_URL", "http://localhost:5678/api/v1")
        self.api_key = os.getenv("N8N_API_KEY")
        self.headers = {
            "X-N8N-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        self.client_filter = client_filter  # Dict: {"tag": "client:maritime", "prefix": "Maritime"}
        
    def _make_request(self, endpoint: str, method: str = "GET", data: dict = None) -> dict:
        """Make API request to n8n"""
        url = f"{self.api_url}/{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=30)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_workflows(self) -> List[Dict]:
        """Get all workflows (filtered by client if specified)"""
        result = self._make_request("workflows")
        if "error" in result:
            return []
        workflows = result.get("data", [])
        
        # Apply client filter
        if self.client_filter:
            filtered = []
            for w in workflows:
                # Filter by tag
                if self.client_filter.get("tag"):
                    tags = w.get("tags", [])
                    tag_names = [t.get("name") if isinstance(t, dict) else t for t in tags]
                    if self.client_filter["tag"] not in tag_names:
                        continue
                
                # Filter by name prefix
                if self.client_filter.get("prefix"):
                    if not w.get("name", "").startswith(self.client_filter["prefix"]):
                        continue
                
                filtered.append(w)
            return filtered
        
        return workflows
    
    def get_recent_executions(self, hours: int = 1, limit: int = 100) -> List[Dict]:
        """Get recent workflow executions (filtered by client if specified)"""
        result = self._make_request(f"executions?limit={limit}")
        if "error" in result:
            return []
        
        executions = result.get("data", [])
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Get client workflow IDs if filtering
        client_workflow_ids = None
        if self.client_filter:
            client_workflows = self.get_workflows()
            client_workflow_ids = {w.get("id") for w in client_workflows}
        
        # Filter by time and client
        recent = []
        for exec in executions:
            try:
                exec_time = datetime.fromisoformat(exec.get("startedAt", "").replace("Z", "+00:00"))
                if exec_time.replace(tzinfo=None) > cutoff_time:
                    # Filter by client workflow IDs
                    if client_workflow_ids is not None:
                        if exec.get("workflowId") not in client_workflow_ids:
                            continue
                    recent.append(exec)
            except:
                pass
        
        return recent
    
    def get_execution_details(self, execution_id: str) -> Dict:
        """Get detailed execution info including node data"""
        return self._make_request(f"executions/{execution_id}")
    
    def analyze_workflow_health(self) -> Dict[str, Any]:
        """Comprehensive workflow health analysis"""
        workflows = self.get_workflows()
        executions = self.get_recent_executions(hours=1)
        
        # Categorize workflows
        active_workflows = [w for w in workflows if w.get("active", False)]
        inactive_workflows = [w for w in workflows if not w.get("active", False)]
        
        # Analyze executions
        successful = [e for e in executions if e.get("finished") and not e.get("stoppedAt")]
        failed = [e for e in executions if e.get("stoppedAt") or e.get("data", {}).get("resultData", {}).get("error")]
        running = [e for e in executions if not e.get("finished")]
        
        # Calculate success rate
        total_completed = len(successful) + len(failed)
        success_rate = (len(successful) / total_completed * 100) if total_completed > 0 else 0
        
        # Find slow executions (>30s)
        slow_executions = []
        for exec in successful:
            start = datetime.fromisoformat(exec.get("startedAt", "").replace("Z", "+00:00"))
            end = datetime.fromisoformat(exec.get("stoppedAt", "").replace("Z", "+00:00"))
            duration = (end - start).total_seconds()
            if duration > 30:
                slow_executions.append({
                    "workflow_id": exec.get("workflowId"),
                    "workflow_name": exec.get("workflowData", {}).get("name", "Unknown"),
                    "duration": duration,
                    "execution_id": exec.get("id")
                })
        
        # Detect failing workflows
        failing_workflows = {}
        for exec in failed:
            workflow_name = exec.get("workflowData", {}).get("name", "Unknown")
            if workflow_name not in failing_workflows:
                failing_workflows[workflow_name] = []
            failing_workflows[workflow_name].append({
                "execution_id": exec.get("id"),
                "error": exec.get("data", {}).get("resultData", {}).get("error", {}).get("message", "Unknown error"),
                "time": exec.get("stoppedAt")
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_workflows": len(workflows),
                "active_workflows": len(active_workflows),
                "inactive_workflows": len(inactive_workflows),
                "executions_last_hour": len(executions),
                "successful": len(successful),
                "failed": len(failed),
                "running": len(running),
                "success_rate": round(success_rate, 2)
            },
            "slow_executions": slow_executions,
            "failing_workflows": failing_workflows,
            "status": "healthy" if success_rate > 95 and len(failed) < 5 else "degraded" if success_rate > 80 else "critical"
        }
    
    def check_specific_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Deep dive into a specific workflow"""
        workflow = self._make_request(f"workflows/{workflow_id}")
        if "error" in workflow:
            return {"error": f"Workflow not found: {workflow_id}"}
        
        # Get recent executions for this workflow
        all_executions = self.get_recent_executions(hours=24, limit=50)
        workflow_executions = [e for e in all_executions if e.get("workflowId") == workflow_id]
        
        # Analyze node-level failures
        node_failures = {}
        for exec in workflow_executions:
            if exec.get("data", {}).get("resultData", {}).get("error"):
                error_data = exec["data"]["resultData"]["error"]
                node_name = error_data.get("node", {}).get("name", "Unknown")
                if node_name not in node_failures:
                    node_failures[node_name] = 0
                node_failures[node_name] += 1
        
        return {
            "workflow_name": workflow.get("name"),
            "workflow_id": workflow_id,
            "active": workflow.get("active"),
            "executions_24h": len(workflow_executions),
            "node_failures": node_failures,
            "last_execution": workflow_executions[0] if workflow_executions else None
        }
    
    def detect_anomalies(self, baseline_hours: int = 24) -> Dict[str, Any]:
        """Detect performance anomalies vs baseline"""
        recent = self.get_recent_executions(hours=1)
        baseline = self.get_recent_executions(hours=baseline_hours)
        
        # Calculate baseline metrics
        baseline_success_rate = len([e for e in baseline if e.get("finished") and not e.get("stoppedAt")]) / len(baseline) * 100 if baseline else 0
        recent_success_rate = len([e for e in recent if e.get("finished") and not e.get("stoppedAt")]) / len(recent) * 100 if recent else 0
        
        anomalies = []
        
        # Success rate drop
        if recent_success_rate < baseline_success_rate - 10:
            anomalies.append({
                "type": "success_rate_drop",
                "severity": "high",
                "message": f"Success rate dropped from {baseline_success_rate:.1f}% to {recent_success_rate:.1f}%"
            })
        
        # Execution volume spike/drop
        baseline_rate = len(baseline) / baseline_hours
        recent_rate = len(recent)
        if recent_rate > baseline_rate * 2:
            anomalies.append({
                "type": "execution_spike",
                "severity": "medium",
                "message": f"Execution rate spiked: {recent_rate} vs baseline {baseline_rate:.1f}/hour"
            })
        elif recent_rate < baseline_rate * 0.5 and baseline_rate > 5:
            anomalies.append({
                "type": "execution_drop",
                "severity": "medium",
                "message": f"Execution rate dropped: {recent_rate} vs baseline {baseline_rate:.1f}/hour"
            })
        
        return {
            "anomalies": anomalies,
            "baseline_period_hours": baseline_hours,
            "has_anomalies": len(anomalies) > 0
        }


def format_health_report(health_data: Dict[str, Any], mode: str = "quick") -> str:
    """Format health data for Telegram"""
    status_emoji = {
        "healthy": "🟢",
        "degraded": "🟡",
        "critical": "🔴"
    }
    
    status = health_data.get("status", "unknown")
    summary = health_data.get("summary", {})
    
    if mode == "quick":
        report = f"{status_emoji.get(status, '⚪')} n8n Health: {status.upper()}\n"
        report += f"━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Workflows: {summary.get('active_workflows')}/{summary.get('total_workflows')} active\n"
        report += f"Executions: {summary.get('executions_last_hour')} (last hour)\n"
        report += f"Success Rate: {summary.get('success_rate')}%\n"
        
        if summary.get('failed', 0) > 0:
            report += f"\n⚠️ {summary.get('failed')} failed executions\n"
        
        if health_data.get('slow_executions'):
            report += f"\n🐌 {len(health_data['slow_executions'])} slow executions detected\n"
    
    elif mode == "detailed":
        report = f"📊 n8n Detailed Report\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Status: {status_emoji.get(status, '⚪')} {status.upper()}\n\n"
        
        report += f"📈 Metrics (Last Hour)\n"
        report += f"Total Executions: {summary.get('executions_last_hour')}\n"
        report += f"✅ Successful: {summary.get('successful')}\n"
        report += f"❌ Failed: {summary.get('failed')}\n"
        report += f"🔄 Running: {summary.get('running')}\n"
        report += f"Success Rate: {summary.get('success_rate')}%\n\n"
        
        if health_data.get('slow_executions'):
            report += f"🐌 Slow Executions:\n"
            for slow in health_data['slow_executions'][:3]:
                report += f"  • {slow['workflow_name']}: {slow['duration']:.1f}s\n"
        
        if health_data.get('failing_workflows'):
            report += f"\n❌ Failing Workflows:\n"
            for workflow, errors in list(health_data['failing_workflows'].items())[:3]:
                report += f"  • {workflow}: {len(errors)} failures\n"
                if errors:
                    report += f"    Error: {errors[0]['error'][:50]}...\n"
    
    return report


if __name__ == "__main__":
    monitor = N8nHealthMonitor()
    health = monitor.analyze_workflow_health()
    print(json.dumps(health, indent=2))
    print("\n" + "="*50 + "\n")
    print(format_health_report(health, mode="detailed"))
