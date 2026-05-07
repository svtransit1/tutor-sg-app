#!/usr/bin/env python3
"""Validate question-bank.json against the schema and content rules."""
import json, sys, os
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
SCHEMA = Path(__file__).resolve().parent.parent / "schema" / "question-bank-schema.json"

ERRORS = []
WARNINGS = []

def err(msg): ERRORS.append(f"ERROR: {msg}")
def warn(msg): WARNINGS.append(f"WARN: {msg}")

def validate():
    with open(DATA / "question-bank.json") as f: bank = json.load(f)
    with open(SCHEMA) as f: schema = json.load(f)

    # Required top-level keys
    for k in schema.get("required", ["version","metadata","topics","questions"]):
        if k not in bank:
            err(f"Missing top-level key: {k}")

    # Version
    import re
    if not re.match(r'^\d+\.\d+\.\d+$', bank.get("version","")):
        err(f"Invalid version: {bank.get('version')}")

    # Metadata
    meta = bank.get("metadata", {})
    for k in ["generated_at","source","total_questions","total_topics"]:
        if k not in meta:
            err(f"Metadata missing key: {k}")

    # Topics
    topics = bank.get("topics", [])
    if len(topics) < 1:
        err("No topics in bank")
    else:
        topic_ids = set()
        for i, t in enumerate(topics):
            tid = t.get("topic_id", "?")
            if tid in topic_ids:
                err(f"Duplicate topic_id: {tid}")
            topic_ids.add(tid)

            if not re.match(r'^[A-Z]{3}-P\d-\d{3}$', tid):
                err(f"Invalid topic_id format: {tid}")

            if t.get("subject") not in schema["properties"]["topics"]["items"]["properties"]["subject"]["enum"]:
                err(f"Invalid subject in topic {tid}: {t.get('subject')}")

    # Questions
    questions = bank.get("questions", [])
    if len(questions) < 1:
        err("No questions in bank")
        return

    if meta.get("total_questions") != len(questions):
        err(f"Metadata total_questions ({meta.get('total_questions')}) != actual ({len(questions)})")

    qids = set()
    schema_types = schema["properties"]["questions"]["items"]["properties"]["question_type"]["enum"]
    schema_subjects = schema["properties"]["questions"]["items"]["properties"]["subject"]["enum"]
    schema_difficulties = schema["properties"]["questions"]["items"]["properties"]["difficulty"]["enum"]

    chinese_topics = {t["topic_id"] for t in topics if t["subject"] == "chinese"}
    chinese_q_count = 0

    for i, q in enumerate(questions):
        qid = q.get("question_id", f"q#{i}")

        if qid in qids:
            err(f"Duplicate question_id: {qid}")
        qids.add(qid)

        if not re.match(r'^Q-[A-Z]{3}-P\d-\d{4}$', qid):
            err(f"Invalid question_id format: {qid}")

        if q.get("subject") not in schema_subjects:
            err(f"Q{qid}: Invalid subject: {q.get('subject')}")

        if q.get("question_type") not in schema_types:
            err(f"Q{qid}: Invalid question_type: {q.get('question_type')}")

        if q.get("difficulty") not in schema_difficulties:
            err(f"Q{qid}: Invalid difficulty: {q.get('difficulty')}")

        # Required fields
        for field in schema["properties"]["questions"]["items"]["required"]:
            if field not in q or (isinstance(q.get(field), str) and not q[field].strip()):
                err(f"Q{qid}: Missing or empty required field: {field}")

        # Chinese questions: must be zh-Hans only, no TC
        if q.get("subject") == "chinese":
            chinese_q_count += 1
            stem = q.get("stem_zh", "")
            for tc_candidate in q.get("stem_zh", ""):
                cp = ord(tc_candidate)
                if 0x4E00 <= cp <= 0x9FFF and tc_candidate in "爲著麼關係體會門開關時間說萬歲鬱":
                    warn(f"Q{qid}: Possible Traditional Chinese char: {tc_candidate}")

            # Topic must be a valid Chinese topic
            if q.get("topic_id") not in chinese_topics:
                warn(f"Q{qid}: topic_id '{q.get('topic_id')}' not in Chinese topics")

            # Chinese stems must be non-empty
            if not q.get("stem_zh","").strip():
                err(f"Q{qid}: Chinese question has empty stem_zh")

        # Bilingual check
        if not q.get("stem_en","") and not q.get("stem_zh",""):
            err(f"Q{qid}: Both stem_en and stem_zh are empty")

        # Topic must exist
        if q.get("topic_id") not in topic_ids:
            warn(f"Q{qid}: topic_id '{q.get('topic_id')}' not found in topics list")

    # Summary
    print(f"\n=== Validation Results ===")
    print(f"Topics: {len(topics)}")
    print(f"Questions: {len(questions)}")
    print(f"Chinese questions: {chinese_q_count}")

    by_subj = {}
    for q in questions:
        s = q.get("subject","?")
        by_subj[s] = by_subj.get(s, 0) + 1
    print(f"By subject: {dict(sorted(by_subj.items()))}")

    by_level = {}
    for q in questions:
        l = f"P{q.get('level','?')}"
        by_level[l] = by_level.get(l, 0) + 1
    print(f"By level: {dict(sorted(by_level.items()))}")

    by_type = {}
    for q in questions:
        t = q.get("question_type","?")
        by_type[t] = by_type.get(t, 0) + 1
    print(f"By type: {dict(sorted(by_type.items()))}")

    if ERRORS:
        print(f"\n{len(ERRORS)} ERRORS:")
        for e in ERRORS: print(f"  {e}")
    else:
        print(f"\nNo errors.")

    if WARNINGS:
        print(f"\n{len(WARNINGS)} WARNINGS:")
        for w in WARNINGS: print(f"  {w}")
    else:
        print(f"No warnings.")

    return len(ERRORS) == 0

if __name__ == "__main__":
    ok = validate()
    sys.exit(0 if ok else 1)
