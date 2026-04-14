#!/usr/bin/env python3
"""
Unified Monitoring System
Combines n8n, Retell, and transcript analysis into comprehensive reports
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any

# Import individual monitors
from n8n_health_monitor import N8nHealthMonitor, format_health_report
from retell_call_monitor import RetellCallMonitor, format_call_report


class UnifiedMonitor:
    def __init__(self, client_filter=None):
        self.n8n_monitor = N8nHealthMonitor(client_filter=client_filter)
        self.retell_monitor = RetellCallMonitor(client_filter=client_filter)
        self.client_name = client_filter.get("name", "All Clients") if client_filter else "All Clients"
    
    def quick_health_check(self) -> str:
        """15-minute quick health check"""
        n8n_health = self.n8n_monitor.analyze_workflow_health()
        retell_health = self.retell_monitor.analyze_call_health(hours=1)
        
        # Overall status
        statuses = [n8n_health.get("status"), retell_health.get("status")]
        if "critical" in statuses:
            overall = "🔴 CRITICAL"
        elif "degraded" in statuses or "needs_attention" in statuses:
            overall = "🟡 DEGRADED"
        else:
            overall = "🟢 HEALTHY"
        
        report = f"🏥 {self.client_name} Health Check\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Overall Status: {overall}\n"
        report += f"Time: {datetime.now().strftime('%I:%M %p')}\n\n"
        
        # n8n summary
        n8n_summary = n8n_health.get("summary", {})
        report += f"🔄 n8n Workflows\n"
        report += f"Active: {n8n_summary.get('active_workflows')}/{n8n_summary.get('total_workflows')}\n"
        report += f"Executions: {n8n_summary.get('executions_last_hour')} (last hour)\n"
        report += f"Success Rate: {n8n_summary.get('success_rate')}%\n"
        
        if n8n_summary.get('failed', 0) > 0:
            report += f"⚠️ {n8n_summary['failed']} failures\n"
        
        report += f"\n📞 Retell Calls\n"
        retell_summary = retell_health.get("summary", {})
        report += f"Calls: {retell_summary.get('total_calls')} (last hour)\n"
        report += f"Completed: {retell_summary.get('completed')}\n"
        report += f"Avg Duration: {retell_summary.get('avg_duration_formatted', 'N/A')}\n"
        
        if retell_summary.get('failed', 0) > 0:
            report += f"⚠️ {retell_summary['failed']} failed calls\n"
        
        # Action items
        action_items = []
        
        if n8n_health.get('slow_executions'):
            action_items.append(f"Check slow workflows: {len(n8n_health['slow_executions'])} detected")
        
        if n8n_health.get('failing_workflows'):
            action_items.append(f"Fix failing workflows: {len(n8n_health['failing_workflows'])} affected")
        
        if retell_health.get('issues', {}).get('missing_transcripts', 0) > 0:
            action_items.append(f"Missing transcripts: {retell_health['issues']['missing_transcripts']} calls")
        
        if action_items:
            report += f"\n🎯 Action Items:\n"
            for i, item in enumerate(action_items[:3], 1):
                report += f"{i}. {item}\n"
        
        return report
    
    def hourly_report(self) -> str:
        """Detailed hourly report"""
        n8n_health = self.n8n_monitor.analyze_workflow_health()
        retell_health = self.retell_monitor.analyze_call_health(hours=1)
        transcript_analysis = self.retell_monitor.batch_analyze_transcripts(hours=1)
        
        report = f"📊 {self.client_name} Hourly Report\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Time: {datetime.now().strftime('%B %d, %Y - %I:%M %p')}\n\n"
        
        # n8n section
        report += format_health_report(n8n_health, mode="detailed")
        report += f"\n"
        
        # Retell section
        report += format_call_report(retell_health, mode="detailed")
        report += f"\n"
        
        # Transcript quality
        if "error" not in transcript_analysis:
            report += f"🤖 AI Quality Analysis\n"
            report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            report += f"Calls Analyzed: {transcript_analysis.get('calls_analyzed')}\n"
            report += f"Avg Quality Score: {transcript_analysis.get('avg_quality_score')}%\n"
            report += f"Info Collection Rate: {transcript_analysis.get('avg_collection_rate')}%\n"
            
            sentiment = transcript_analysis.get('sentiment_distribution', {})
            report += f"Sentiment: "
            report += f"😊 {sentiment.get('positive', 0)} | "
            report += f"😐 {sentiment.get('neutral', 0)} | "
            report += f"😞 {sentiment.get('negative', 0)}\n"
            
            if transcript_analysis.get('low_quality_calls', 0) > 0:
                report += f"\n⚠️ {transcript_analysis['low_quality_calls']} calls need review\n"
        
        # Anomalies
        n8n_anomalies = self.n8n_monitor.detect_anomalies(baseline_hours=24)
        if n8n_anomalies.get('has_anomalies'):
            report += f"\n🚨 Anomalies Detected:\n"
            for anomaly in n8n_anomalies['anomalies'][:3]:
                severity_emoji = "🔴" if anomaly['severity'] == "high" else "🟡"
                report += f"{severity_emoji} {anomaly['message']}\n"
        
        return report
    
    def daily_summary(self) -> str:
        """Comprehensive daily summary"""
        n8n_health_24h = self.n8n_monitor.analyze_workflow_health()
        retell_health_24h = self.retell_monitor.analyze_call_health(hours=24)
        transcript_analysis_24h = self.retell_monitor.batch_analyze_transcripts(hours=24)
        patterns = self.retell_monitor.detect_patterns(hours=24)
        
        report = f"📈 {self.client_name} Daily Summary\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"{datetime.now().strftime('%B %d, %Y')}\n\n"
        
        # 24-hour metrics
        report += f"📊 24-Hour Metrics\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        
        n8n_summary = n8n_health_24h.get("summary", {})
        report += f"n8n Executions: {n8n_summary.get('executions_last_hour')} "
        report += f"({n8n_summary.get('success_rate')}% success)\n"
        
        retell_summary = retell_health_24h.get("summary", {})
        report += f"Retell Calls: {retell_summary.get('total_calls')} "
        report += f"(avg {retell_summary.get('avg_duration_formatted', 'N/A')})\n"
        
        if "error" not in transcript_analysis_24h:
            report += f"AI Quality Score: {transcript_analysis_24h.get('avg_quality_score')}%\n"
        
        # Trends
        report += f"\n🔍 Trends & Patterns\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        
        if "error" not in patterns:
            report += f"Peak Call Hour: {patterns.get('peak_hour')}:00\n"
            report += f"After-Hours Calls: {patterns.get('after_hours_calls')}\n"
            
            if patterns.get('has_patterns'):
                for pattern in patterns['patterns_detected']:
                    report += f"📌 {pattern['message']}\n"
        
        # Issues & Recommendations
        report += f"\n⚠️ Issues & Recommendations\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        
        recommendations = []
        
        # n8n recommendations
        if n8n_health_24h.get('failing_workflows'):
            for workflow, errors in list(n8n_health_24h['failing_workflows'].items())[:2]:
                recommendations.append(f"Fix '{workflow}': {len(errors)} failures")
        
        if n8n_health_24h.get('slow_executions'):
            slow_workflows = {}
            for slow in n8n_health_24h['slow_executions']:
                name = slow['workflow_name']
                slow_workflows[name] = slow_workflows.get(name, 0) + 1
            
            for workflow, count in list(slow_workflows.items())[:2]:
                recommendations.append(f"Optimize '{workflow}': {count} slow executions")
        
        # Retell recommendations
        if "error" not in transcript_analysis_24h:
            if transcript_analysis_24h.get('low_quality_calls', 0) > 5:
                recommendations.append(f"Review AI prompts: {transcript_analysis_24h['low_quality_calls']} low-quality calls")
            
            if transcript_analysis_24h.get('incomplete_collection_calls', 0) > 5:
                recommendations.append(f"Improve info collection: {transcript_analysis_24h['incomplete_collection_calls']} incomplete calls")
        
        if recommendations:
            for i, rec in enumerate(recommendations[:5], 1):
                report += f"{i}. {rec}\n"
        else:
            report += f"✅ No major issues detected\n"
        
        return report
    
    def get_report(self, mode: str = "quick") -> str:
        """Get report based on mode"""
        if mode == "quick":
            return self.quick_health_check()
        elif mode == "hourly":
            return self.hourly_report()
        elif mode == "daily":
            return self.daily_summary()
        else:
            return "Invalid mode. Use: quick, hourly, or daily"


def main():
    """CLI interface"""
    import argparse
    parser = argparse.ArgumentParser(description="Unified monitoring system")
    parser.add_argument("mode", choices=["quick", "hourly", "daily"], default="quick", nargs="?", help="Report mode")
    parser.add_argument("--client", help="Client name to filter (e.g., maritime, acme)")
    parser.add_argument("--tag", help="n8n workflow tag filter (e.g., client:maritime)")
    parser.add_argument("--prefix", help="n8n workflow name prefix (e.g., 'Maritime - ')")
    parser.add_argument("--agent-id", help="Retell agent ID filter")
    args = parser.parse_args()
    
    # Build client filter
    client_filter = None
    if args.client or args.tag or args.prefix or args.agent_id:
        client_filter = {
            "name": args.client or "Filtered",
            "tag": args.tag,
            "prefix": args.prefix,
            "agent_id": args.agent_id
        }
    
    monitor = UnifiedMonitor(client_filter=client_filter)
    report = monitor.get_report(args.mode)
    print(report)


if __name__ == "__main__":
    main()
