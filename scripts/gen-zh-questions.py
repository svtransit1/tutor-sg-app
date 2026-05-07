#!/usr/bin/env python3
"""Chinese MT question generator via Ollama/Gemma 4. Use to batch-generate questions."""
import json, re, sys, time, subprocess
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
MODEL = "gemma4:e4b-nvfp4"
CHAR_BUDGET = {1:"250-300",2:"500-600",3:"900-1000",4:"1300-1500",5:"1700-1900",6:"2000-2300"}
PASSAGE_LEN = {1:30,2:50,3:80,4:120,5:160,6:200}

PROMPTS = {
    "dictation": 'Generate a P{level} Singapore Chinese dictation. Return JSON: {{"stem_zh":"听写以下词语。","answer_zh":"a P{level} word in Chinese","explanation_zh":"explain","difficulty":"easy"}} zh-Hans. SG. Topic: {topic}.',
    "sentence_formation": 'Generate a P{level} Chinese 造句. Return JSON: {{"stem_zh":"请用下列词语造句。","keywords_zh":"a P{level} word","answer_zh":"complete sentence","explanation_zh":"explain","difficulty":"easy"}} zh-Hans. SG. Topic: {topic}.',
    "reading_comprehension": 'Generate a P{level} Chinese reading comprehension. Return JSON: {{"stem_zh":"阅读短文，回答问题。","passage_zh":"passage under {passage_len} chars + question","answer_zh":"correct answer","explanation_zh":"explain","difficulty":"medium"}} zh-Hans. SG. Topic: {topic}.',
    "cloze": 'Generate a P{level} Chinese cloze. Return JSON: {{"stem_zh":"选词填空。","passage_zh":"passage with 3-4 blanks","options":[{{"label":"1","text_zh":"A"}},{{"label":"2","text_zh":"B"}}],"answer_zh":"correct","explanation_zh":"explain","difficulty":"medium"}} zh-Hans. SG. Topic: {topic}.',
    "dialogue_completion": 'Generate a P{level} Chinese dialogue. Return JSON: {{"stem_zh":"完成对话。","dialogue_zh":"2-3 turn dialogue with ___","answer_zh":"missing line","explanation_zh":"explain","difficulty":"medium"}} zh-Hans. SG. Topic: {topic}.',
    "composition": 'Generate a P{level} Chinese composition prompt. Return JSON: {{"stem_zh":"请写一篇作文。","prompt_zh":"title in Chinese","answer_zh":"outline","explanation_zh":"tips","difficulty":"medium"}} zh-Hans. SG. Topic: {topic}.',
    "picture_description": 'Generate a P{level} Chinese picture description. Return JSON: {{"stem_zh":"请描述这幅图。","answer_zh":"3 sentence description","explanation_zh":"what to describe","difficulty":"easy"}} SG scene. Topic: {topic}.',
    "oral_practice": 'Generate a P{level} Chinese oral practice. Return JSON: {{"stem_zh":"朗读短文，回答会话问题。","passage_zh":"short 朗读 passage","conversation_qs":[{{"q_zh":"问题"}}],"answer_zh":"answer","explanation_zh":"scoring","difficulty":"medium"}} SG. Topic: {topic}.',
}

TYPE_LEVELS = {"dictation":[1,2,3,4,5,6],"sentence_formation":[2,3,4,5,6],"reading_comprehension":[2,3,4,5,6],"dialogue_completion":[4,5,6],"cloze":[4,5,6],"composition":[3,4,5,6],"picture_description":[1,2,3],"oral_practice":[5,6]}
TYPE_SCHEMA = {"dictation":"dictation","sentence_formation":"sentence_formation","reading_comprehension":"comprehension","dialogue_completion":"short_answer","cloze":"cloze","composition":"composition","picture_description":"picture_description","oral_practice":"oral"}

def load_topics():
    with open(DATA/"taxonomy.json") as f: d=json.load(f)
    t=[]
    for sk,si in d["subjects"].items():
        if sk!="chinese": continue
        for lk,li in si["levels"].items():
            for x in li["topics"]: t.append({"id":x["id"],"level":int(lk),"name_zh":x["name_zh"]})
    return t

def call_llm(prompt):
    fp = f"Respond with ONLY valid JSON. No thinking, no markdown.\n\n{prompt}"
    p = json.dumps({"model":MODEL,"prompt":fp,"stream":False,"options":{"temperature":0.4,"num_predict":1536}})
    try:
        r = subprocess.run(["curl","-s","-X","POST","http://localhost:11434/api/generate","-H","Content-Type: application/json","-d",p],capture_output=True,text=True,timeout=120)
        resp = json.loads(r.stdout)
        t = (resp.get("response","") or "").strip()
        if not t: t = (resp.get("thinking","") or "").strip()
        m = re.search(r'\{.*\}', t, re.DOTALL)
        return json.loads(m.group(0)) if m else None
    except: return None

def main():
    topics = load_topics()
    print(f"Topics: {len(topics)}")
    qc = [1]
    gen = []
    for topic in sorted(topics, key=lambda t:(t["level"],t["id"])):
        for qt, levels in sorted(TYPE_LEVELS.items()):
            if topic["level"] not in levels: continue
            prompt = PROMPTS[qt].format(level=topic["level"],topic=topic["name_zh"],passage_len=PASSAGE_LEN.get(topic["level"],80),vocab=CHAR_BUDGET.get(topic["level"],""))
            r = call_llm(prompt)
            if not r: print("x",end="",flush=True); continue
            qid = f"Q-CHI-P{topic['level']}-{qc[0]:04d}"; qc[0]+=1
            conv = r.get("conversation_qs",[])
            opts = r.get("options",[])
            gen.append({"question_id":qid,"topic_id":topic["id"],"level":topic["level"],"subject":"chinese","question_type":TYPE_SCHEMA[qt],"difficulty":r.get("difficulty","medium"),"stem_en":r.get("stem_en",""),"stem_zh":r.get("stem_zh",""),"answer_en":r.get("answer_en",""),"answer_zh":r.get("answer_zh",""),"explanation_en":r.get("explanation_en",""),"explanation_zh":r.get("explanation_zh",""),"passage_en":r.get("passage_en",""),"passage_zh":r.get("passage_zh",""),"keywords_en":r.get("keywords_en",""),"keywords_zh":r.get("keywords_zh",""),"prompt_en":r.get("prompt_en",""),"prompt_zh":r.get("prompt_zh",""),"dialogue_en":r.get("dialogue_en",""),"dialogue_zh":r.get("dialogue_zh",""),"conversation_qs":conv,"options":opts,"hints":[],"tags":r.get("tags",[qt,f"p{topic['level']}"]),"moed_code":r.get("moed_code",f"C-P{topic['level']}-{qt[:2].upper()}-01")})
            print(f"P{topic['level']}.{qt[:8]} ",end="",flush=True)
            time.sleep(0.3)
    print(f"\nTotal: {len(gen)}")
    out = DATA/"question-bank-zh-generated.json"
    json.dump({"generated_at":datetime.now(timezone.utc).isoformat(),"model":MODEL,"questions":gen},open(out,"w"),ensure_ascii=False,indent=2)
    print(f"Saved: {out}")

if __name__=="__main__":
    main()
