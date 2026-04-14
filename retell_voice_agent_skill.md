# RETELL AI VOICE AGENT — SKILL.md
# The Gold Standard for Building Low-Latency, Natural-Sounding Voice Agents
# Version: 1.0 | April 2026
# Use this as the baseline every time you create a new Retell voice agent.

---

## OVERVIEW

This skill defines how to build production-ready Retell AI voice agents that sound human, respond fast, and never feel robotic. Every agent you build MUST follow these rules. No exceptions.

The three pillars: **Low Latency** (under 800ms response), **Natural Speech** (sounds like a real receptionist, not a chatbot), **Reliable Intake** (collects caller info every time).

---

## SYSTEM PROMPT RULES

### Token Budget
- **HARD LIMIT: 650 tokens maximum** for the system prompt
- Every token above 650 adds latency — the LLM has to read the entire prompt before responding
- 450 tokens is the sweet spot for fastest response times
- All technical knowledge, FAQs, pricing, service details → goes in the **Knowledge Base**, NOT the prompt
- The prompt defines WHO the agent is and HOW it speaks. The KB defines WHAT it knows.

### Prompt Structure (Use This Template)

```
You are concise. When in doubt, say less not more.

## Identity
You are the AI receptionist for [BUSINESS NAME] in [LOCATION]. The owner is [OWNER NAME]. You answer calls, handle questions, and collect intake info so [OWNER] can follow up.

## Speaking Rules
- Keep ALL responses to 2-3 sentences maximum. No exceptions.
- Ask ONE question at a time. Never stack questions.
- Use contractions naturally — I'm, we'll, don't, can't, won't
- Say numbers in spoken form — "four hundred dollars" not "$400"
- Start sentences with "So," "Well," or "And" when natural
- If more detail needed, say "I can go into more detail if you'd like"
- Never use bullet points, lists, numbered items, or formatted text
- Never say "I apologize for the inconvenience" or corporate phrases
- Never say "Great question!" or "That's a wonderful question!"

## Response Style
- Sound warm, knowledgeable, and direct — like a real receptionist who knows her stuff
- When answering technical questions, give the KEY FACT and stop. Do not lecture.
- Acknowledge what the caller said before responding — "Got it" / "Right" / "Okay so"
- If unsure, say "That's a great question for [OWNER] — let me make sure [he/she] calls you back about that"

## Task Flow
1. Greet warmly, ask how you can help
2. Technical question: answer concisely from knowledge base, then offer to collect info
3. Scheduling: collect ONE piece at a time — name, callback number, address, concern type, brief description
4. Confirm back: "So I have [name] at [number], concerned about [issue] at [address] — is that right?"
5. Close: "[OWNER] will reach out to you at that number. Anything else before we wrap up?"

## Urgency — Flag Immediately
Flag if: acute symptoms, time-sensitive deadline, caller distressed, legal situation, caller asks for [OWNER] directly.

## Rules
- Never [INDUSTRY-SPECIFIC RULES]
- After hours: acknowledge, collect intake, assure next-business-day callback
```

### What Goes in Prompt vs Knowledge Base

| IN THE PROMPT (under 650 tokens) | IN THE KNOWLEDGE BASE |
|---|---|
| Agent identity and role | All service descriptions |
| Speaking style rules | Pricing ranges and details |
| Response length constraints | Technical specifications |
| Task flow (intake collection steps) | FAQs and common questions |
| Urgency escalation triggers | Equipment names and standards |
| Hard rules (what NOT to do) | Credentials and certifications |
| After-hours behavior | Industry regulations and guidelines |
| | Service area details |
| | Competitor differentiators |

---

## AGENT SETTINGS (Copy These Exact Values)

### Voice Selection
- **Primary recommendation:** `11labs-Dorothy` — warm, professional, US female. Best for most business use cases.
- **Alternative warm female:** `11labs-Rachel`, `11labs-Victoria` 
- **Male option:** `11labs-Chris` — professional, clear
- **For bilingual (EN/ES):** Choose a voice that supports both, or use Retell's auto-language detection
- **Voice speed:** `1.0` (default). Enable `enable_dynamic_voice_speed: true` so agent matches caller's pace automatically.
- **Voice temperature:** `1.0` (default is fine)

### Responsiveness & Turn-Taking
```json
{
  "responsiveness": 0.9,
  "enable_dynamic_responsiveness": true,
  "interruption_sensitivity": 0.8
}
```
- **Responsiveness 0.9** — adds ~100ms pause before responding. Sounds like thinking, not reading.
- **Dynamic responsiveness ON** — automatically adjusts to caller's pace. Slower speakers get more patience.
- **Interruption sensitivity 0.8** — slightly less jumpy. At 1.0, background noise and breathing trigger interruptions. 0.8 is the sweet spot.

### Backchannel (The "mm-hmm" Sounds)
```json
{
  "enable_backchannel": true,
  "backchannel_frequency": 0.5,
  "backchannel_words": ["mm-hmm", "yeah", "right", "got it", "sure"]
}
```
- **Frequency 0.5** is natural. At 0.8+ the agent sounds eager/robotic ("absolutely! of course! understood!"). At 0.3 it sounds disengaged.
- **Word choice matters:** "mm-hmm", "yeah", "right" sound human. "Absolutely", "certainly", "of course" sound corporate. Use the human ones.

### Ambient Sound
```json
{
  "ambient_sound": "call-center",
  "ambient_sound_volume": 0.4
}
```
- **call-center** is professional for business lines. Use **coffee-shop** only for casual/consumer brands.
- **Volume 0.4** — audible enough to add realism without being distracting.

### Silence & Call Duration
```json
{
  "end_call_after_silence_ms": 30000,
  "max_call_duration_ms": 600000
}
```
- **30 seconds silence timeout** — if nobody speaks for 30 sec, end the call. Prevents zombie calls. NEVER set this to 600000 (10 min) — that wastes Retell minutes.
- **10 min max call** — most business calls are 3-5 min. Cap at 10 to prevent runaway costs.

### Reminder Settings
```json
{
  "reminder_trigger_ms": 10000,
  "reminder_max_count": 2
}
```
- After 10 seconds of caller silence, agent gently prompts: "Are you still there?"
- Maximum 2 reminders before ending call.

### Handbook Config (Critical Toggles)
```json
{
  "handbook_config": {
    "natural_filler_words": true,
    "high_empathy": true,
    "echo_verification": true,
    "speech_normalization": true,
    "smart_matching": true,
    "default_personality": true,
    "scope_boundaries": true,
    "ai_disclosure": true,
    "nato_phonetic_alphabet": false
  }
}
```
- **natural_filler_words: true** — agent says "um", "let me think", "so" naturally. Critical for human feel.
- **high_empathy: true** — better responses to worried, scared, or frustrated callers.
- **echo_verification: true** — repeats back key info like a real receptionist ("So that's John Smith at 555-1234, right?")
- **speech_normalization: true** — converts "$400" to "four hundred dollars" in speech
- **smart_matching: true** — better understanding of caller intent even with poor audio
- **nato_phonetic_alphabet: false** — unless your business specifically needs it

### Boosted Keywords
Always add industry-specific terms that the transcription engine might miss:
```json
{
  "boosted_keywords": [
    "BUSINESS_NAME", "OWNER_NAME",
    "INDUSTRY_TERM_1", "INDUSTRY_TERM_2",
    "LOCATION_1", "LOCATION_2"
  ]
}
```
- Include: business name, owner name, all technical terms specific to the niche, location names
- Max ~20-25 keywords. More than that dilutes effectiveness.

### Pronunciation Dictionary
For any word the TTS engine mispronounces:
```json
{
  "pronunciation_dictionary": [
    {"word": "IETI", "alphabet": "ipa", "phoneme": "aɪ iː tiː aɪ"},
    {"word": "Martine", "alphabet": "ipa", "phoneme": "mɑːrˈtiːn"}
  ]
}
```
- Test your agent's voice with every brand name, owner name, and technical term
- If it mispronounces anything, add the IPA phoneme here

---

## LLM MODEL SELECTION

| Model | Latency | Intelligence | Cost | Best For |
|---|---|---|---|---|
| **gpt-4.1-mini** | Fastest | Good | Cheapest | Simple intake + FAQ agents |
| **gpt-4o** | Fast | High | Medium | Technical agents needing KB retrieval |
| **gpt-4.1** | Fast | High | Medium | Complex conversation flows |
| **gpt-5-mini** | Medium | Very High | Medium | Agents needing reasoning |
| **gpt-5** | Slow | Highest | Expensive | NOT recommended for voice — too slow |
| **claude-3.5-haiku** | Fast | Good | Cheap | Alternative to gpt-4.1-mini |
| **claude-sonnet-4** | Medium | Very High | Medium | Alternative to gpt-4o |

**Default recommendation:** `gpt-4o` with `temperature: 0.3` 

- Temperature 0.3 gives natural variation without hallucination. 0.04 sounds robotic (too deterministic). 0.7+ gets creative and unreliable.
- For maximum speed on simple agents: `gpt-4.1-mini` at temp 0.2
- Set `max_tokens: 100-120` in dashboard (not available via API) — hard caps response length

---

## KNOWLEDGE BASE BEST PRACTICES

### Structure
Write the KB as natural prose, NOT as JSON or structured data. The retrieval system works best with flowing text that reads like a human wrote it.

```markdown
# [Business Name] Services and Information

## [Service Category 1]
[Description in natural language. Include specific details, 
equipment names, standards, pricing ranges. Write it the way 
a knowledgeable receptionist would explain it to a caller.]

## [Service Category 2]
[Same approach — natural, detailed, conversational.]

## Pricing
[Write prices in spoken form: "typically four hundred to seven 
hundred dollars" not "$400-$700". The agent reads from this.]

## Service Areas
[Natural description of where the business operates.]

## Credentials
[List credentials with what they mean in plain language.]
```

### KB Config Settings
```json
{
  "knowledge_base_ids": ["your_kb_id"],
  "kb_config": {
    "top_k": 3,
    "filter_score": 0.6
  }
}
```
- **top_k: 3** — retrieves top 3 most relevant chunks. More than 5 adds latency.
- **filter_score: 0.6** — only returns chunks with >60% relevance. Lower = more noise. Higher = might miss relevant info.

---

## BEGIN MESSAGE

Keep it SHORT. Under 15 words. The caller wants to speak, not listen to a monologue.

**GOOD:** "Thanks for calling [Business]! How can I help you today?"
**BAD:** "Thank you for calling [Business]. This is the AI receptionist. [Owner] is our owner and lead [title] — I can answer technical questions about our services and make sure she has everything she needs to follow up with you. How can I help you today?"

The bad example is 40+ words before the caller can speak. That's 5-6 seconds of the agent talking. Callers will hang up or talk over it.

---

## ANTI-PATTERNS (Things That Make Agents Sound Robotic)

### Never Do These:

1. **Numbered lists in speech** — "We offer: 1. Mold testing, 2. Air quality, 3. Radon..." → Sounds like reading a menu. Instead: "We mainly do mold testing, air quality, and radon — we also do EMF and asbestos if needed."

2. **Stacking questions** — "What's your name? And your phone number? And your address?" → Ask ONE at a time with acknowledgment between each.

3. **Corporate phrases** — "I apologize for the inconvenience", "I'd be happy to assist you with that", "Thank you for your patience", "Is there anything else I can help you with today?" → Use: "Sorry about that", "Sure, I can help", "Thanks for waiting", "Anything else?"

4. **Over-explaining** — Dumping all technical details at once. → Give the key fact, then offer: "Want me to go into more detail on that?"

5. **Repeating the question back** — "You're asking about mold testing? Great question! So mold testing is..." → Just answer: "Yeah, so for mold we come out and take air samples..."

6. **Long pauses before responding** — Usually caused by too-long prompts or slow models. Fix with shorter prompt + faster model.

7. **Ignoring what the caller just said** — Agent should acknowledge before pivoting: "Got it" / "Right" / "Okay, so..."

---

## POST-CALL ANALYSIS (Standard Fields)

Add these 4 fields to every agent for consistent data collection:

```json
{
  "post_call_analysis_data": [
    {
      "name": "intake_complete",
      "type": "boolean",
      "description": "Whether AI collected caller name, phone, and concern type"
    },
    {
      "name": "call_outcome",
      "type": "enum",
      "choices": ["intake_collected", "question_answered_only", "urgent_escalation", "voicemail", "wrong_number", "hang_up_early", "spam"]
    },
    {
      "name": "service_interest",
      "type": "enum",
      "choices": ["[LIST_NICHE_SPECIFIC_SERVICES]", "general_inquiry", "unknown"]
    },
    {
      "name": "urgency_level",
      "type": "enum",
      "choices": ["routine", "urgent", "emergency"]
    }
  ]
}
```

---

## WEBHOOK CONFIGURATION

Point the post-call webhook to your n8n instance:
```
https://[YOUR_N8N_URL]/webhook/[CLIENT_NAME]-retell-call-ended
```

The webhook payload contains: `call_id`, `agent_id`, `call_type`, `start_timestamp`, `end_timestamp`, `duration_ms`, `transcript`, `recording_url`, `call_analysis`, `disconnection_reason`, and all post-call analysis fields.

---

## TESTING PROTOCOL

Before ANY agent goes live, run these 5 tests:

| Test # | Scenario | What You're Checking |
|---|---|---|
| 1 | Simple service inquiry | Agent answers concisely (2-3 sentences), doesn't list, sounds natural |
| 2 | Technical question | Agent pulls from KB accurately, doesn't hallucinate, offers to collect info after |
| 3 | Ready to book | Agent collects intake ONE piece at a time, confirms back, closes cleanly |
| 4 | After hours | Agent acknowledges after hours, still collects intake, promises callback |
| 5 | Frustrated/worried caller | Agent shows empathy, doesn't dismiss concern, escalates if needed |

**Scoring:** Rate each test 1-10 on: Accuracy, Naturalness, Conciseness, Intake Collection. If any score < 7, tune the prompt or KB before going live.

**Common fixes:**
- Too verbose → Add "You are concise. When in doubt, say less not more." at the very top of prompt
- Too robotic → Check that `natural_filler_words` and `high_empathy` are ON
- Lists in speech → Add "Never use bullet points, lists, or numbered items" to Speaking Rules
- Slow responses → Reduce prompt token count, switch to faster model, lower `top_k` in KB config
- Wrong info → Check KB content for the specific topic, add or correct it
- Doesn't collect intake → Strengthen the Task Flow section with explicit steps

---

## DEPLOYMENT CHECKLIST

```
□ System prompt under 650 tokens
□ All technical knowledge in Knowledge Base (not prompt)
□ Begin message under 15 words
□ Model: gpt-4o (or gpt-4.1-mini for simple agents)
□ Temperature: 0.3
□ Max tokens: 100-120 (set in dashboard)
□ Responsiveness: 0.9 with dynamic ON
□ Interruption sensitivity: 0.8
□ Backchannel: 0.5 frequency with natural words
□ Ambient sound: call-center at 0.4 volume
□ Silence timeout: 30000ms
□ Max call duration: 600000ms (10 min)
□ All handbook toggles set per spec above
□ Boosted keywords added (15-25 niche terms)
□ Pronunciation dictionary tested for all brand/owner names
□ Webhook URL configured and tested
□ Post-call analysis fields configured
□ 5 test scenarios passed with score ≥ 7/10 each
□ Phone number assigned and call forwarding configured
```

---

## QUICK REFERENCE — SETTINGS JSON

Copy this as your baseline and customize per client:

```json
{
  "voice_id": "11labs-Dorothy",
  "voice_speed": 1.0,
  "voice_temperature": 1.0,
  "enable_dynamic_voice_speed": true,
  "responsiveness": 0.9,
  "enable_dynamic_responsiveness": true,
  "interruption_sensitivity": 0.8,
  "enable_backchannel": true,
  "backchannel_frequency": 0.5,
  "backchannel_words": ["mm-hmm", "yeah", "right", "got it", "sure"],
  "ambient_sound": "call-center",
  "ambient_sound_volume": 0.4,
  "end_call_after_silence_ms": 30000,
  "max_call_duration_ms": 600000,
  "normalize_for_speech": true,
  "reminder_trigger_ms": 10000,
  "reminder_max_count": 2,
  "handbook_config": {
    "natural_filler_words": true,
    "high_empathy": true,
    "echo_verification": true,
    "speech_normalization": true,
    "smart_matching": true,
    "default_personality": true,
    "scope_boundaries": true,
    "ai_disclosure": true,
    "nato_phonetic_alphabet": false
  }
}
```

LLM baseline:
```json
{
  "model": "gpt-4o",
  "model_temperature": 0.3,
  "kb_config": {
    "top_k": 3,
    "filter_score": 0.6
  }
}
```

---

## VERSION HISTORY
- v1.0 (April 2026): Initial skill file based on IETI Martine Davis deployment, extensive Retell AI research, voice AI prompting guides from Layercode/Vapi/ElevenLabs/Murf, and production testing. Tested settings: 74% prompt token reduction → ~40% faster LLM responses. Confirmed natural speech with filler words, empathy, and echo verification enabled.
