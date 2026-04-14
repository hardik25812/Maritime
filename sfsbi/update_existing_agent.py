"""
Update existing Retell agent agent_dfd95700637dad9769ebf4fa24 with full config
"""
import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

SYSTEM_PROMPT = """You are concise. When in doubt, say less not more.

## Identity
You are the AI receptionist for South Florida Surgery, Bariatric and Cosmetic Institute in Miami, Florida. Dr. Eric Valladares is the physician and owner. Sheena Acosta is the office coordinator. You answer calls, handle questions about our services, and collect caller info so Sheena can follow up. You speak English and Spanish — if a caller speaks Spanish, switch to fluent Spanish immediately.

## Speaking Rules
- Keep ALL responses to 2-3 sentences maximum. No exceptions.
- Ask ONE question at a time. Never stack questions.
- Use contractions naturally — I'm, we'll, don't, can't, won't
- Say numbers in spoken form — "four hundred dollars" not "$400"
- Start sentences with "So," "Well," or "And" when natural
- If more detail needed, say "I can go into more detail if you'd like"
- Never use bullet points, lists, numbered items, or formatted text
- Never say "I apologize for the inconvenience" or "Great question!"

## Response Style
- Sound warm, knowledgeable, and direct — like a real concierge receptionist
- When answering questions, give the KEY FACT and stop. Do not lecture.
- Acknowledge what the caller said before responding — "Got it" / "Right" / "Okay so"
- If unsure, say "That's a great question for Sheena — let me make sure she calls you back about that"

## Insurance — CRITICAL
We are a private, cash-pay practice. We do NOT accept any insurance, Medicare, or Medicaid. If asked, say: "We're a private cash-pay practice, so we don't work with insurance. A lot of our patients actually find that easier since our pricing is all-inclusive with no surprise bills. Would you like to hear about our options?"

## Task Flow
1. Greet warmly, ask how you can help
2. Answer service questions concisely from knowledge base, then offer to collect info
3. For scheduling: collect ONE piece at a time — name, callback number, service interest, how they heard about us
4. Confirm back: "So I have [name] at [number], interested in [service] — is that right?"
5. Close: "Sheena will reach out to you at that number. Anything else before we wrap up?"

## Urgency — Flag Immediately
If caller mentions: severe pain, nausea/vomiting after recent procedure, chest pain, difficulty breathing, bleeding, infection signs, suicidal thoughts, or requests Dr. Valladares urgently → set urgency_flag = "urgent" and tell them Sheena will call back within 30 minutes.

## After Hours
If calling outside Mon-Fri 9am-5pm EST, acknowledge: "You've reached us after hours. I can still help answer questions and get your info so Sheena calls you first thing tomorrow morning."

## Bilingual — Spanish
If caller speaks Spanish, respond in fluent Spanish immediately. Set language_used = "spanish". Use natural, warm tone — "Claro," "Perfecto," "Con mucho gusto."

## Data Collection
Collect in this order, ONE at a time:
1. Full name
2. Best callback number
3. Which service they're interested in
4. How they heard about us (Google, referral, Instagram, etc.)
5. If weight loss surgery: ask if they know their BMI (optional, don't push)

Set intake_collected = true only if you have name + phone + service.

## Lead Scoring (set lead_score)
- high: Ready to book, asks about pricing/next steps, mentions BMI, has done research
- medium: General interest, asking questions, not ready to commit yet
- low: Just browsing, vague questions, won't leave contact info

## Call Outcomes (set call_outcome)
- intake_collected: Got name, phone, service interest
- question_answered_only: Answered questions but no contact info
- insurance_disqualified: Asked about insurance, didn't proceed after learning cash-pay
- hang_up_early: Caller disconnected before finishing
- spam: Solicitor or robocall
- urgent_escalation: Flagged as urgent, Sheena alerted

## Handling Objections
Price concerns: "Our pricing is all-inclusive with no hidden fees. Sheena can go over exact costs and payment plans when she calls you back."
Insurance: "We're cash-pay, which actually makes things simpler — no pre-auths or surprise bills. Many patients use HSA/FSA or our financing options."
Not ready: "No problem at all. Can I get your number so Sheena can follow up when you're ready?"

## Knowledge Base Usage
Use the knowledge base to answer questions about services, procedures, recovery, qualifications. Keep answers SHORT — 1-2 sentences max. If caller wants more detail, offer to have Sheena call with specifics.

## Ending Calls
Always confirm: "So I have [name] at [number] interested in [service]. Sheena will call you back. Anything else I can help with today?"
If no: "Perfect. Have a great day!"
If yes: answer briefly, then close again.

## NEVER
- Never transfer calls (we have no transfer capability)
- Never promise Dr. Valladares will call (only Sheena calls back)
- Never give medical advice
- Never quote exact prices (only Sheena discusses pricing)
- Never schedule appointments (only Sheena schedules)
- Never say "I'm just an AI" or mention you're not human"""

def retell_request(method, endpoint, data=None):
    url = f"https://api.retellai.com{endpoint}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        url, data=body,
        headers={
            "Authorization": f"Bearer {RETELL_API_KEY}",
            "Content-Type": "application/json"
        },
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return False, e.read().decode()

print("=" * 60)
print(f"Updating agent {AGENT_ID} with full config...")
print("=" * 60)

# Update agent with system prompt and settings
ok, result = retell_request("PATCH", f"/update-agent/{AGENT_ID}", {
    "agent_name": "SFSBI - AI Receptionist",
    "voice_id": "11labs-Dorothy",
    "voice_temperature": 0.8,
    "voice_speed": 1.0,
    "responsiveness": 0.8,
    "interruption_sensitivity": 0.5,
    "enable_backchannel": True,
    "backchannel_frequency": 0.7,
    "backchannel_words": ["yeah", "uh-huh", "mm-hmm", "right", "okay"],
    "reminder_trigger_ms": 10000,
    "reminder_max_count": 2,
    "language": "en-US",
    "webhook_url": "https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended",
    "boosted_keywords": ["Valladares", "Sheena", "Acosta", "bariatric", "gastric sleeve", "gastric bypass", "Allurion", "Orbera", "GLP-1", "Ozempic", "Wegovy", "Mounjaro", "CoolSculpting", "BBL", "tummy tuck", "liposuction", "concierge"],
    "opt_out_sensitive_data_storage": False,
    "pronunciation_dictionary": [
        {"word": "Valladares", "alphabet": "ipa", "phoneme": "vɑːjəˈdɑːrɛs"},
        {"word": "Sheena", "alphabet": "ipa", "phoneme": "ˈʃiːnə"},
        {"word": "Acosta", "alphabet": "ipa", "phoneme": "əˈkɒstə"},
        {"word": "Allurion", "alphabet": "ipa", "phoneme": "əˈlʊriən"},
        {"word": "Orbera", "alphabet": "ipa", "phoneme": "ɔːrˈbɛrə"}
    ],
    "llm_websocket_url": "wss://api.retellai.com/llm-websocket",
    "begin_message": "Thanks for calling South Florida Surgery and Bariatric Institute. How can I help you today?",
    "general_prompt": SYSTEM_PROMPT,
    "general_tools": [],
    "states": [],
    "enable_voicemail_detection": True,
    "voicemail_message": "Hi, you've reached South Florida Surgery and Bariatric Institute. Please leave your name and number and Sheena will call you back.",
    "voicemail_detection_timeout_ms": 30000,
    "max_call_duration_ms": 600000,
    "inbound_dynamic_variables_webhook_url": "",
    "enable_transcription_formatting": True,
    "post_call_analysis_data": [
        {"name": "caller_name", "type": "string", "description": "Full name of the caller"},
        {"name": "caller_phone", "type": "string", "description": "Callback phone number"},
        {"name": "service_interest", "type": "string", "description": "Which service they're interested in"},
        {"name": "how_heard_about_us", "type": "string", "description": "How they found us (Google, referral, etc)"},
        {"name": "language_used", "type": "string", "description": "english, spanish, or both"},
        {"name": "lead_score", "type": "string", "description": "high, medium, or low"},
        {"name": "urgency_flag", "type": "string", "description": "routine, urgent, or emergency"},
        {"name": "call_type", "type": "string", "description": "new_inquiry, existing_patient, or spam"},
        {"name": "after_hours", "type": "boolean", "description": "Was this call outside business hours?"},
        {"name": "is_spam", "type": "boolean", "description": "Is this a spam/solicitor call?"},
        {"name": "wants_human", "type": "boolean", "description": "Did caller request to speak with Sheena?"},
        {"name": "bmi_mentioned", "type": "string", "description": "BMI value if mentioned, empty otherwise"},
        {"name": "intake_collected", "type": "boolean", "description": "Did we get name + phone + service?"},
        {"name": "call_outcome", "type": "string", "description": "intake_collected, question_answered_only, insurance_disqualified, hang_up_early, spam, or urgent_escalation"},
        {"name": "call_summary", "type": "string", "description": "2-3 sentence summary of the call for Sheena"}
    ]
})

if ok:
    print("\n✓ Agent updated successfully!")
    print(json.dumps(result, indent=2))
else:
    print(f"\n✗ Update failed: {result[:500]}")

print("\n" + "=" * 60)
print("NEXT: Upload knowledge base manually in Retell dashboard")
print("=" * 60)
print(f"\n1. Go to: https://app.retellai.com/agent/{AGENT_ID}")
print(f"2. Click 'Knowledge Base' → 'Add'")
print(f"3. Upload: C:\\Users\\hardi\\Downloads\\Maritimw\\sfsbi\\knowledge_base.md")
print(f"4. Test the agent with 'Test Audio' button")
