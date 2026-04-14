#!/usr/bin/env python3
"""
Retell AI Call Monitor
Monitors call quality, transcripts, and AI agent performance
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json


class RetellCallMonitor:
    def __init__(self, client_filter=None):
        self.api_url = "https://api.retellai.com"
        self.api_key = os.getenv("RETELL_API_KEY")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.client_filter = client_filter  # Dict: {"agent_id": "agent_xxx"}
    
    def _make_request(self, endpoint: str, method: str = "GET", params: dict = None) -> dict:
        """Make API request to Retell"""
        url = f"{self.api_url}/{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, headers=self.headers, params=params, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=self.headers, json=params, timeout=30)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_recent_calls(self, hours: int = 1, limit: int = 100) -> List[Dict]:
        """Get recent calls (filtered by client if specified)"""
        result = self._make_request("list-calls", params={"limit": limit})
        if "error" in result:
            return []
        
        calls = result.get("calls", [])
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Filter by time and client agent_id
        recent = []
        for call in calls:
            try:
                call_time = datetime.fromisoformat(call.get("start_timestamp", "").replace("Z", "+00:00"))
                if call_time.replace(tzinfo=None) > cutoff_time:
                    # Filter by agent_id if specified
                    if self.client_filter and self.client_filter.get("agent_id"):
                        if call.get("agent_id") != self.client_filter["agent_id"]:
                            continue
                    recent.append(call)
            except:
                pass
        
        return recent
    
    def get_call_details(self, call_id: str) -> Dict:
        """Get detailed call info including transcript"""
        return self._make_request(f"get-call/{call_id}")
    
    def analyze_call_health(self, hours: int = 1) -> Dict[str, Any]:
        """Comprehensive call health analysis"""
        calls = self.get_recent_calls(hours=hours)
        
        if not calls:
            return {
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total_calls": 0,
                    "status": "no_data"
                }
            }
        
        # Categorize calls
        completed = [c for c in calls if c.get("call_status") == "ended"]
        in_progress = [c for c in calls if c.get("call_status") == "in_progress"]
        failed = [c for c in calls if c.get("call_status") in ["error", "failed"]]
        
        # Calculate metrics
        total_duration = sum([c.get("call_duration", 0) for c in completed])
        avg_duration = total_duration / len(completed) if completed else 0
        
        # Analyze transcripts
        missing_transcripts = []
        low_quality_calls = []
        
        for call in completed:
            call_id = call.get("call_id")
            
            # Check transcript availability
            if not call.get("transcript") and not call.get("transcript_object"):
                missing_transcripts.append(call_id)
            
            # Check call quality indicators
            duration = call.get("call_duration", 0)
            if duration < 30:  # Very short calls might indicate issues
                low_quality_calls.append({
                    "call_id": call_id,
                    "reason": "very_short",
                    "duration": duration
                })
        
        # Calculate completion rate
        total_attempted = len(calls)
        completion_rate = (len(completed) / total_attempted * 100) if total_attempted > 0 else 0
        
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_calls": len(calls),
                "completed": len(completed),
                "in_progress": len(in_progress),
                "failed": len(failed),
                "completion_rate": round(completion_rate, 2),
                "avg_duration_seconds": round(avg_duration, 1),
                "avg_duration_formatted": f"{int(avg_duration // 60)}m {int(avg_duration % 60)}s"
            },
            "issues": {
                "missing_transcripts": len(missing_transcripts),
                "low_quality_calls": len(low_quality_calls)
            },
            "missing_transcript_ids": missing_transcripts[:5],
            "low_quality_call_details": low_quality_calls[:5],
            "status": "healthy" if completion_rate > 90 and len(failed) < 3 else "degraded" if completion_rate > 70 else "critical"
        }
    
    def analyze_transcript_quality(self, call_id: str) -> Dict[str, Any]:
        """Deep analysis of a single call transcript"""
        call_details = self.get_call_details(call_id)
        
        if "error" in call_details:
            return {"error": f"Call not found: {call_id}"}
        
        transcript = call_details.get("transcript", "")
        transcript_obj = call_details.get("transcript_object", [])
        
        # Extract conversation turns
        agent_turns = []
        user_turns = []
        
        for turn in transcript_obj:
            role = turn.get("role", "")
            content = turn.get("content", "")
            
            if role == "agent":
                agent_turns.append(content)
            elif role == "user":
                user_turns.append(content)
        
        # Quality indicators
        quality_score = 100
        issues = []
        
        # Check for required information collection (customize based on your use case)
        required_fields = ["name", "phone", "address", "concern"]
        collected_fields = []
        
        transcript_lower = transcript.lower()
        for field in required_fields:
            if field in transcript_lower:
                collected_fields.append(field)
        
        collection_rate = (len(collected_fields) / len(required_fields)) * 100
        
        if collection_rate < 75:
            quality_score -= 20
            issues.append(f"Incomplete info collection: {collection_rate:.0f}%")
        
        # Check for error indicators
        error_phrases = ["i don't understand", "can you repeat", "i'm not sure", "error", "sorry"]
        error_count = sum([transcript_lower.count(phrase) for phrase in error_phrases])
        
        if error_count > 2:
            quality_score -= 15
            issues.append(f"Multiple confusion indicators: {error_count}")
        
        # Check call duration
        duration = call_details.get("call_duration", 0)
        if duration < 60:
            quality_score -= 10
            issues.append("Very short call duration")
        elif duration > 600:
            quality_score -= 5
            issues.append("Unusually long call")
        
        # Sentiment analysis (basic)
        negative_words = ["angry", "frustrated", "upset", "terrible", "awful", "bad"]
        positive_words = ["great", "good", "thank", "appreciate", "helpful"]
        
        negative_count = sum([transcript_lower.count(word) for word in negative_words])
        positive_count = sum([transcript_lower.count(word) for word in positive_words])
        
        sentiment = "neutral"
        if positive_count > negative_count + 2:
            sentiment = "positive"
        elif negative_count > positive_count + 2:
            sentiment = "negative"
            quality_score -= 10
            issues.append("Negative sentiment detected")
        
        return {
            "call_id": call_id,
            "duration": duration,
            "agent_turns": len(agent_turns),
            "user_turns": len(user_turns),
            "quality_score": max(0, quality_score),
            "collection_rate": round(collection_rate, 1),
            "collected_fields": collected_fields,
            "missing_fields": [f for f in required_fields if f not in collected_fields],
            "sentiment": sentiment,
            "issues": issues,
            "transcript_length": len(transcript)
        }
    
    def batch_analyze_transcripts(self, hours: int = 1) -> Dict[str, Any]:
        """Analyze multiple recent call transcripts"""
        calls = self.get_recent_calls(hours=hours)
        completed_calls = [c for c in calls if c.get("call_status") == "ended"]
        
        analyses = []
        for call in completed_calls[:20]:  # Limit to 20 most recent
            call_id = call.get("call_id")
            analysis = self.analyze_transcript_quality(call_id)
            if "error" not in analysis:
                analyses.append(analysis)
        
        if not analyses:
            return {"error": "No completed calls to analyze"}
        
        # Aggregate metrics
        avg_quality = sum([a["quality_score"] for a in analyses]) / len(analyses)
        avg_collection = sum([a["collection_rate"] for a in analyses]) / len(analyses)
        
        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        for a in analyses:
            sentiment_counts[a["sentiment"]] += 1
        
        # Find problematic calls
        low_quality = [a for a in analyses if a["quality_score"] < 70]
        incomplete_collection = [a for a in analyses if a["collection_rate"] < 75]
        
        return {
            "timestamp": datetime.now().isoformat(),
            "calls_analyzed": len(analyses),
            "avg_quality_score": round(avg_quality, 1),
            "avg_collection_rate": round(avg_collection, 1),
            "sentiment_distribution": sentiment_counts,
            "low_quality_calls": len(low_quality),
            "incomplete_collection_calls": len(incomplete_collection),
            "low_quality_call_ids": [a["call_id"] for a in low_quality][:5],
            "status": "healthy" if avg_quality > 80 and avg_collection > 80 else "needs_attention"
        }
    
    def detect_patterns(self, hours: int = 24) -> Dict[str, Any]:
        """Detect patterns and anomalies in call data"""
        calls = self.get_recent_calls(hours=hours)
        
        if len(calls) < 10:
            return {"error": "Insufficient data for pattern detection"}
        
        # Time-based patterns
        hour_distribution = {}
        for call in calls:
            call_time = datetime.fromisoformat(call.get("start_timestamp", "").replace("Z", "+00:00"))
            hour = call_time.hour
            hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
        
        # Find peak hours
        peak_hour = max(hour_distribution, key=hour_distribution.get)
        
        # After-hours calls (assuming business hours 9-17)
        after_hours = [c for c in calls if datetime.fromisoformat(c.get("start_timestamp", "").replace("Z", "+00:00")).hour not in range(9, 17)]
        
        # Duration patterns
        durations = [c.get("call_duration", 0) for c in calls if c.get("call_status") == "ended"]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Detect outliers (calls >2x average duration)
        long_calls = [c for c in calls if c.get("call_duration", 0) > avg_duration * 2]
        
        patterns = []
        
        if len(after_hours) > len(calls) * 0.2:
            patterns.append({
                "type": "high_after_hours_volume",
                "severity": "medium",
                "message": f"{len(after_hours)} after-hours calls ({len(after_hours)/len(calls)*100:.1f}%)"
            })
        
        if long_calls:
            patterns.append({
                "type": "unusually_long_calls",
                "severity": "low",
                "message": f"{len(long_calls)} calls >2x average duration"
            })
        
        return {
            "peak_hour": peak_hour,
            "after_hours_calls": len(after_hours),
            "avg_duration": round(avg_duration, 1),
            "patterns_detected": patterns,
            "has_patterns": len(patterns) > 0
        }


def format_call_report(health_data: Dict[str, Any], mode: str = "quick") -> str:
    """Format call health data for Telegram"""
    status_emoji = {
        "healthy": "🟢",
        "degraded": "🟡",
        "critical": "🔴",
        "needs_attention": "🟡"
    }
    
    status = health_data.get("status", "unknown")
    summary = health_data.get("summary", {})
    
    if mode == "quick":
        report = f"{status_emoji.get(status, '⚪')} Retell Health: {status.upper()}\n"
        report += f"━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Calls: {summary.get('total_calls')} (last hour)\n"
        report += f"Completed: {summary.get('completed')}\n"
        report += f"Avg Duration: {summary.get('avg_duration_formatted', 'N/A')}\n"
        report += f"Completion Rate: {summary.get('completion_rate', 0)}%\n"
        
        issues = health_data.get("issues", {})
        if issues.get("missing_transcripts", 0) > 0:
            report += f"\n⚠️ {issues['missing_transcripts']} calls missing transcripts\n"
        
        if issues.get("low_quality_calls", 0) > 0:
            report += f"⚠️ {issues['low_quality_calls']} low quality calls\n"
    
    elif mode == "detailed":
        report = f"📞 Retell Detailed Report\n"
        report += f"━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        report += f"Status: {status_emoji.get(status, '⚪')} {status.upper()}\n\n"
        
        report += f"📊 Call Metrics\n"
        report += f"Total: {summary.get('total_calls')}\n"
        report += f"✅ Completed: {summary.get('completed')}\n"
        report += f"🔄 In Progress: {summary.get('in_progress')}\n"
        report += f"❌ Failed: {summary.get('failed')}\n"
        report += f"Completion Rate: {summary.get('completion_rate')}%\n"
        report += f"Avg Duration: {summary.get('avg_duration_formatted')}\n\n"
        
        issues = health_data.get("issues", {})
        if issues.get("missing_transcripts") or issues.get("low_quality_calls"):
            report += f"⚠️ Issues:\n"
            if issues.get("missing_transcripts"):
                report += f"  • {issues['missing_transcripts']} missing transcripts\n"
            if issues.get("low_quality_calls"):
                report += f"  • {issues['low_quality_calls']} low quality calls\n"
    
    return report


if __name__ == "__main__":
    monitor = RetellCallMonitor()
    health = monitor.analyze_call_health(hours=1)
    print(json.dumps(health, indent=2))
    print("\n" + "="*50 + "\n")
    print(format_call_report(health, mode="detailed"))
