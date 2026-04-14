"""
SFSBI Retell Agent Deploy Script
---------------------------------
1. Creates Knowledge Base in Retell (uploads knowledge_base.md)
2. Creates the Retell AI agent with full config
3. Saves all IDs to deployed_ids.json
4. Prints webhook URL and what to fill in manually

Usage: python deploy_sfsbi.py
"""
import json, urllib.request, urllib.error, os, sys

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
RETELL_BASE    = "https://api.retellai.com"
DEPLOY_DIR     = os.path.dirname(os.path.abspath(__file__))
RESULTS        = {}

# ── SYSTEM PROMPT (under 650 tokens per skill.md) ────────────────
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
Flag if: caller has acute health symptoms, mentions surgical complications, is highly distressed, or asks to speak to Dr. Valladares or Sheena directly.

## Spam Detection
If the caller is a solicitor, salesperson, or robot — say "We're not interested, but thank you" and end the call.

## Rules
- Never quote exact final prices — give ranges and say Sheena will confirm exact pricing
- Never schedule specific appointment times — say Sheena will reach out to schedule
- Never give a medical diagnosis over the phone
- Never mention specific GLP-1 brand names like semaglutide or tirzepatide
- After hours: acknowledge it, still collect intake, promise next-business-day callback
- If caller wants a human: "Of course — I'll make sure Sheena gets this. Can I just grab your name and best number so she can call you back?\""""

BEGIN_MESSAGE = "Thanks for calling South Florida Surgery and Bariatric Institute! How can I help you today?"

WEBHOOK_URL = "https://n8n.srv1546601.hstgr.cloud/webhook/sfsbi-retell-call-ended"

# ── HELPERS ──────────────────────────────────────────────────────
def retell_post(endpoint, data):
    url  = f"{RETELL_BASE}{endpoint}"
    body = json.dumps(data).encode("utf-8")
    req  = urllib.request.Request(
        url, data=body,
        headers={"Authorization": f"Bearer {RETELL_API_KEY}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, e.read().decode("utf-8")

def retell_get(endpoint):
    url = f"{RETELL_BASE}{endpoint}"
    req = urllib.request.Request(
        url, headers={"Authorization": f"Bearer {RETELL_API_KEY}"}, method="GET"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return False, e.read().decode("utf-8")

def separator(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

# ── STEP 1: CREATE KNOWLEDGE BASE ────────────────────────────────
def create_knowledge_base():
    separator("STEP 1: Creating Knowledge Base")

    kb_path = os.path.join(DEPLOY_DIR, "knowledge_base.md")
    with open(kb_path, "r", encoding="utf-8") as f:
        kb_text = f.read()

    ok, result = retell_post("/v2/create-knowledge-base", {
        "knowledge_base_name": "SFSBI - Services and Information",
        "knowledge_base_texts": [
            {"title": "SFSBI Complete Knowledge Base", "text": kb_text}
        ],
        "enable_auto_refresh": False
    })

    if ok:
        kb_id = result.get("knowledge_base_id", "")
        print(f"  ✓ Knowledge Base created: {kb_id}")
        RESULTS["knowledge_base_id"] = kb_id
        return kb_id
    else:
        print(f"  ✗ KB creation failed:\n    {result[:400]}")
        print("\n  Continuing without KB — you can add it manually in Retell dashboard.")
        return None

# ── STEP 2: CREATE LLM ───────────────────────────────────────────
def create_llm(kb_id):
    separator("STEP 2: Creating Retell LLM")

    llm_payload = {
        "model": "gpt-4o",
        "model_temperature": 0.3,
        "system_prompt": SYSTEM_PROMPT,
        "begin_message": BEGIN_MESSAGE,
        "general_tools": [
            {
                "type": "end_call",
                "name": "end_call",
                "description": "End the call after completing intake or answering questions. Use when caller is satisfied, spam is detected, or two reminders go unanswered."
            }
        ],
        "dynamic_variables": {
            "caller_name": "",
            "caller_phone": "",
            "service_interest": "",
            "how_heard_about_us": "",
            "language_used": "english",
            "urgency_flag": "routine",
            "call_type": "new_inquiry",
            "after_hours": False,
            "is_spam": False,
            "bmi_mentioned": "",
            "wants_human": False
        }
    }

    if kb_id:
        llm_payload["knowledge_base_ids"] = [kb_id]
        llm_payload["kb_config"] = {"top_k": 3, "filter_score": 0.6}

    ok, result = retell_post("/create-retell-llm", llm_payload)

    if ok:
        llm_id = result.get("llm_id", "")
        print(f"  ✓ LLM created: {llm_id}")
        RESULTS["llm_id"] = llm_id
        return llm_id
    else:
        print(f"  ✗ LLM creation failed:\n    {result[:400]}")
        return None

# ── STEP 3: CREATE AGENT ─────────────────────────────────────────
def create_agent(llm_id):
    separator("STEP 3: Creating Retell Agent")

    if not llm_id:
        print("  ✗ Skipping — no LLM ID available.")
        return None

    agent_payload = {
        "agent_name": "SFSBI - AI Receptionist",
        "response_engine": {"type": "retell-llm", "llm_id": llm_id},
        "voice_id": "11labs-Dorothy",
        "voice_speed": 1.0,
        "voice_temperature": 1.0,
        "enable_dynamic_voice_speed": True,
        "language": "multi",
        "responsiveness": 0.9,
        "enable_dynamic_responsiveness": True,
        "interruption_sensitivity": 0.8,
        "enable_backchannel": True,
        "backchannel_frequency": 0.5,
        "backchannel_words": ["mm-hmm", "yeah", "right", "got it", "sure"],
        "ambient_sound": "call-center",
        "ambient_sound_volume": 0.4,
        "end_call_after_silence_ms": 30000,
        "max_call_duration_ms": 600000,
        "normalize_for_speech": True,
        "reminder_trigger_ms": 10000,
        "reminder_max_count": 2,
        "webhook_url": WEBHOOK_URL,
        "boosted_keywords": [
            "SFSBI", "South Florida Surgery", "Bariatric", "Valladares",
            "Sheena", "Acosta", "GLP-1", "CoolSculpting", "gastric sleeve",
            "gastric bypass", "Orbera", "Allurion", "Lap-Band", "Apollo ESG",
            "phentermine", "TORe", "BBL", "liposuction", "tummy tuck",
            "concierge", "telehealth", "MIC", "B12", "dietitian"
        ],
        "pronunciation_dictionary": [
            {"word": "SFSBI",          "alphabet": "ipa", "phoneme": "ˌɛs ɛf ˌɛs biː aɪ"},
            {"word": "Valladares",     "alphabet": "ipa", "phoneme": "ˌvɑːjɑːˈdɑːɹɛs"},
            {"word": "Orbera",         "alphabet": "ipa", "phoneme": "ɔːɹˈbɛɹə"},
            {"word": "Allurion",       "alphabet": "ipa", "phoneme": "əˈlʊɹiːɒn"},
            {"word": "Sheena",         "alphabet": "ipa", "phoneme": "ˈʃiːnə"},
            {"word": "Acosta",         "alphabet": "ipa", "phoneme": "əˈkɒstə"},
            {"word": "TORe",           "alphabet": "ipa", "phoneme": "tɔːɹ"},
            {"word": "gastroplasty",   "alphabet": "ipa", "phoneme": "ˈɡæstɹoʊˌplæsti"},
            {"word": "brachioplasty",  "alphabet": "ipa", "phoneme": "ˈbɹeɪkioʊˌplæsti"},
            {"word": "blepharoplasty", "alphabet": "ipa", "phoneme": "ˈblɛfəɹoʊˌplæsti"}
        ],
        "post_call_analysis_data": [
            {
                "name": "intake_complete",
                "type": "boolean",
                "description": "Whether AI collected caller name, phone number, and service interest"
            },
            {
                "name": "call_outcome",
                "type": "enum",
                "description": "The outcome of the call — what happened by the end.",
                "choices": [
                    "intake_collected", "question_answered_only", "urgent_escalation",
                    "human_handoff_requested", "insurance_disqualified",
                    "voicemail", "wrong_number", "hang_up_early", "spam"
                ]
            },
            {
                "name": "service_interest",
                "type": "enum",
                "description": "The primary service the caller was interested in.",
                "choices": [
                    "gastric_sleeve", "gastric_bypass", "orbera_balloon", "allurion_balloon",
                    "lap_band", "apollo_esg", "tore_revision", "glp1_weight_loss",
                    "phentermine", "peptides_b12_mic", "coolsculpting", "surgical_body_contouring",
                    "bbl", "liposuction", "tummy_tuck", "breast_procedure", "blepharoplasty",
                    "nutrition_counseling", "concierge_medicine", "telehealth",
                    "general_inquiry", "unknown"
                ]
            },
            {
                "name": "urgency_level",
                "type": "enum",
                "description": "Urgency level of the call — routine, urgent, or emergency.",
                "choices": ["routine", "urgent", "emergency"]
            },
            {
                "name": "language_used",
                "type": "enum",
                "description": "Language used during the call.",
                "choices": ["english", "spanish", "both"]
            },
            {
                "name": "lead_score",
                "type": "enum",
                "description": "High = ready to book or pay. Medium = interested but exploring. Low = info only or insurance inquiry.",
                "choices": ["high", "medium", "low"]
            },
            {
                "name": "call_summary",
                "type": "string",
                "description": "Two to three sentence summary of what the caller wanted and the outcome"
            }
        ]
    }

    ok, result = retell_post("/create-agent", agent_payload)

    if ok:
        agent_id = result.get("agent_id", "")
        print(f"  ✓ Agent created: {agent_id}")
        RESULTS["agent_id"] = agent_id
        return agent_id
    else:
        print(f"  ✗ Agent creation failed:\n    {result[:400]}")
        return None

# ── STEP 4: SAVE IDs & PRINT SUMMARY ─────────────────────────────
def save_and_summarize():
    ids_path = os.path.join(DEPLOY_DIR, "deployed_ids.json")

    # Merge with existing if present
    existing = {}
    if os.path.exists(ids_path):
        try:
            with open(ids_path, "r") as f:
                existing = json.load(f)
        except Exception:
            pass

    existing.update(RESULTS)

    with open(ids_path, "w") as f:
        json.dump(existing, f, indent=2)

    separator("DEPLOY SUMMARY")
    for k, v in RESULTS.items():
        status = "✓" if v else "✗ NOT CREATED"
        print(f"  {status}  {k}: {v}")

    print(f"\n  IDs saved to: {ids_path}")

    separator("WHAT TO DO NEXT")
    print("""
  1. ASSIGN A PHONE NUMBER:
     - Log into app.retellai.com
     - Go to Phone Numbers → Buy or Import a number
     - Assign it to agent: """ + str(RESULTS.get("agent_id", "SEE deployed_ids.json")) + """

  2. SET UP CALL FORWARDING:
     - Forward 305-631-5355 (or Sheena's cell) to the Retell number
     - Test by calling from a non-office number

  3. FILL IN PLACEHOLDERS in n8n workflows:
     - SFSBI_GOOGLE_SHEET_ID → create a new Google Sheet with these columns:
       received_at | call_id | caller_name | caller_phone | service_interest |
       how_heard | language_used | lead_score | urgency_flag | call_type |
       after_hours | intake_collected | call_duration_seconds | call_status |
       call_outcome | user_sentiment | wants_human | bmi_mentioned |
       call_summary | recording_url
     - TWILIO_ACCOUNT_SID → your Twilio account SID
     - TWILIO_PHONE_NUMBER → your Twilio sending number
     - SHEENA_PHONE_NUMBER → Sheena's cell (e.g. +13051234567)
     - DR_VALLADARES_PHONE_NUMBER → Dr V's cell for urgent alerts

  4. ACTIVATE n8n WORKFLOWS:
     WF1 - Post-call Handler:  y2W0q5h4WIG0tBTh
     WF2 - Urgent Escalation:  4ZdkoKrWd5tG0cIF
     WF3 - Weekly QC Report:   nnAZYMRIJzbEs5aV

  5. TEST THE AGENT — 5 required test calls per skill.md:
     [ ] Simple service question (e.g. "What is the Allurion balloon?")
     [ ] Insurance question (should disqualify gracefully)
     [ ] Ready-to-book caller (should collect full intake)
     [ ] After-hours call (should acknowledge + collect + promise callback)
     [ ] Spanish-speaking caller (should switch to Spanish immediately)

  6. WEBHOOK TEST:
     Webhook URL: """ + WEBHOOK_URL + """
     After first real call, check n8n execution log for WF1.
""")

# ── MAIN ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*60)
    print("SFSBI RETELL AGENT DEPLOY")
    print("="*60)

    kb_id    = create_knowledge_base()
    llm_id   = create_llm(kb_id)
    agent_id = create_agent(llm_id)

    save_and_summarize()
