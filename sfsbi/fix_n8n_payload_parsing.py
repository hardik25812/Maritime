"""
Fix n8n WF1 Code node: was reading raw.call instead of raw.body.call
This caused ALL fields (recording_url, transcript, caller_name, etc.) to be empty.

Root cause: Retell sends webhook as:
  { headers, params, query, body: { event: "call_analyzed", call: { ...all data... } } }

The old code did:
  const d = raw.call || raw   <-- raw.call is undefined! falls back to raw (headers object)

The fix:
  const body = raw.body || raw
  const d = body.call || body   <-- correctly gets body.call

This fix was applied directly in n8n via MCP on 2026-04-24.
Run this script only if the workflow needs to be re-applied from scratch.
"""
import json, urllib.request, urllib.error

N8N_BASE = "https://n8n.srv1546601.hstgr.cloud"
WORKFLOW_ID = "y2W0q5h4WIG0tBTh"

FIXED_CODE = """// Retell webhook: { headers, params, query, body: { event, call: {...} } }
const raw = $input.first().json;

// Correctly navigate: body.call is the call object
const body = raw.body || raw;
const d = body.call || body;

const vars = d.retell_llm_dynamic_variables || {};
const analysis = d.call_analysis || {};
const customData = analysis.custom_analysis_data || {};

const callerName   = customData.caller_name || vars.caller_name || '';
const callerPhone  = customData.caller_phone || vars.caller_phone || d.from_number || '';
const svcInterest  = customData.service_interest || vars.service_interest || 'unknown';
const howHeard     = customData.how_heard_about_us || vars.how_heard_about_us || '';
const langUsed     = customData.language_used || vars.language_used || 'english';
const urgencyFlag  = customData.urgency_flag || vars.urgency_flag || 'routine';
const callType     = customData.call_type || vars.call_type || 'new_inquiry';
const afterHours   = customData.after_hours === true || customData.after_hours === 'true' || vars.after_hours === true || vars.after_hours === 'true';
const isSpam       = customData.is_spam === true || customData.is_spam === 'true' || vars.is_spam === true || vars.is_spam === 'true';
const wantsHuman   = customData.wants_human === true || customData.wants_human === 'true' || vars.wants_human === true || vars.wants_human === 'true';
const bmiMentioned = customData.bmi_mentioned || vars.bmi_mentioned || '';
const intakeDone   = customData.intake_collected === true || customData.intake_collected === 'true' || (callerName.length > 0 && callerPhone.length > 0);

const startTs = parseInt(d.start_timestamp) || 0;
const endTs   = parseInt(d.end_timestamp)   || 0;
const durSecs = (startTs > 0 && endTs > 0) ? Math.round((endTs - startTs) / 1000) : (d.duration_ms ? Math.round(d.duration_ms / 1000) : 0);

const leadScore   = customData.lead_score   || 'medium';
const callOutcome = customData.call_outcome || (intakeDone ? 'intake_collected' : 'question_answered_only');
const callSummary = customData.call_summary || analysis.call_summary || '';

return [{ json: {
  received_at:           new Date().toISOString(),
  call_id:               d.call_id || ('unknown-' + Date.now()),
  agent_id:              d.agent_id || 'agent_dfd95700637dad9769ebf4fa24',
  call_status:           d.call_status || '',
  caller_name:           callerName,
  caller_phone:          callerPhone,
  service_interest:      svcInterest,
  how_heard:             howHeard,
  language_used:         langUsed,
  urgency_flag:          urgencyFlag,
  call_type:             callType,
  after_hours:           afterHours,
  is_spam:               isSpam,
  wants_human:           wantsHuman,
  bmi_mentioned:         bmiMentioned,
  intake_collected:      intakeDone,
  lead_score:            leadScore,
  call_outcome:          callOutcome,
  call_summary:          callSummary,
  user_sentiment:        analysis.user_sentiment || 'unknown',
  call_duration_seconds: durSecs,
  recording_url:         d.recording_url || '',
  transcript:            (d.transcript || '').substring(0, 3000)
}}];"""

print("Fix already applied in n8n via MCP.")
print("The code above is the corrected version.")
print(f"Workflow: {WORKFLOW_ID}")
print("Node: Code - Parse Retell Payload")
print()
print("What was broken:")
print("  OLD: const d = raw.call || raw")
print("       raw = {headers, params, query, body} -- raw.call is undefined!")
print()
print("  NEW: const body = raw.body || raw")
print("       const d = body.call || body")
print("       body.call = the actual Retell call object with recording_url, transcript, etc.")
