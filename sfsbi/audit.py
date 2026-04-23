import json, urllib.request, urllib.error

RETELL_API_KEY = "key_70acf8e731936d5abafc26e9d116"
AGENT_ID = "agent_dfd95700637dad9769ebf4fa24"

def retell_get(endpoint):
    req = urllib.request.Request(
        "https://api.retellai.com" + endpoint,
        headers={"Authorization": "Bearer " + RETELL_API_KEY}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return True, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return False, e.read().decode()

print("=" * 60)
print("RETELL AGENT AUDIT")
print("=" * 60)
ok, agent = retell_get("/get-agent/" + AGENT_ID)
if ok:
    re = agent.get("response_engine", {})
    print("Name:              " + str(agent.get("agent_name")))
    print("Voice ID:          " + str(agent.get("voice_id")))
    print("Voice temp:        " + str(agent.get("voice_temperature")))
    print("Voice speed:       " + str(agent.get("voice_speed")))
    print("Responsiveness:    " + str(agent.get("responsiveness")))
    print("Backchannel:       " + str(agent.get("enable_backchannel")))
    print("Ambient sound:     " + str(agent.get("ambient_sound")))
    print("Webhook:           " + str(agent.get("webhook_url")))
    print("Response engine:   " + str(re.get("type")) + " | llm_id: " + str(re.get("llm_id")))
    print("Post-call fields:  " + str(len(agent.get("post_call_analysis_data", []))))
    print("Boosted keywords:  " + str(len(agent.get("boosted_keywords", []))))
    print("Pronunciation:     " + str(len(agent.get("pronunciation_dictionary", []))))
    llm_id = re.get("llm_id")
else:
    print("AGENT FETCH FAILED: " + str(agent))
    llm_id = None

print("")
print("=" * 60)
print("RETELL LLM AUDIT")
print("=" * 60)
if llm_id:
    ok2, llm = retell_get("/get-retell-llm/" + llm_id)
    if ok2:
        prompt = llm.get("general_prompt", "")
        begin = llm.get("begin_message", "")
        print("LLM ID:        " + llm_id)
        print("Model:         " + str(llm.get("model")))
        print("Temperature:   " + str(llm.get("model_temperature")))
        print("Begin message: " + str(begin[:80]))
        print("Prompt chars:  " + str(len(prompt)))
        print("Prompt preview:" + prompt[:120].replace("\n", " "))
    else:
        print("LLM FETCH FAILED: " + str(llm))
else:
    print("No LLM ID found on agent")

print("")
print("=" * 60)
print("PHONE NUMBER AUDIT")
print("=" * 60)
ok3, phones = retell_get("/list-phone-numbers")
if ok3:
    for p in phones:
        if p.get("phone_number") == "+16452188532":
            print("Number:        +16452188532 FOUND")
            print("Type:          " + str(p.get("phone_number_type")))
            print("Inbound agent: " + str(p.get("inbound_agent_id")))
            sip = p.get("sip_outbound_trunk_config", {})
            print("SIP term URI:  " + str(sip.get("termination_uri")))
else:
    print("PHONE LIST FAILED")
