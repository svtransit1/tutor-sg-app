#!/usr/bin/env python3
"""Merge generated Chinese questions into question-bank.json."""
import json, sys
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

with open(DATA / "question-bank.json") as f:
    bank = json.load(f)

with open(DATA / "chinese-questions-generated.json") as f:
    generated = json.load(f)

existing = bank["questions"]
new_qs = generated["questions"]

# Make sure no duplicate question_ids
existing_ids = {q["question_id"] for q in existing}
dupes = [q for q in new_qs if q["question_id"] in existing_ids]
if dupes:
    print(f"WARNING: {len(dupes)} duplicate question_ids found, skipping them")
    new_qs = [q for q in new_qs if q["question_id"] not in existing_ids]

all_qs = existing + new_qs
bank["questions"] = all_qs
bank["metadata"]["total_questions"] = len(all_qs)
bank["metadata"]["generated_at"] = datetime.now(timezone.utc).isoformat()
bank["version"] = "1.1.0"

# Update total_topics to include Chinese topics
chinese_topic_ids = {t["topic_id"] for t in bank["topics"] if t["subject"] == "chinese"}
new_chinese_topics = set()
for q in new_qs:
    if q["subject"] == "chinese":
        new_chinese_topics.add(q["topic_id"])
# Add any missing Chinese topics from taxonomy
with open(DATA / "taxonomy.json") as f:
    tax = json.load(f)
for lvl_name, lvl_data in tax["subjects"]["chinese"]["levels"].items():
    for t in lvl_data["topics"]:
        tid = t["id"]
        if tid not in chinese_topic_ids:
            # Add to topics list
            bank["topics"].append({
                "topic_id": tid,
                "level": int(lvl_name),
                "subject": "chinese",
                "name_en": t["name_en"],
                "name_zh": t["name_zh"],
                "learning_outcomes": t["outcomes"],
                "parent_topic_id": None
            })
            chinese_topic_ids.add(tid)

bank["metadata"]["total_topics"] = len(bank["topics"])

with open(DATA / "question-bank.json", "w") as f:
    json.dump(bank, f, ensure_ascii=False, indent=2)

print(f"Merged: {len(all_qs)} total (+{len(new_qs)} new Chinese questions)")
print(f"Topics: {bank['metadata']['total_topics']}")

# Summary
by_level = {}
for q in all_qs:
    if q["subject"] == "chinese":
        l = f"P{q['level']}"
        by_level[l] = by_level.get(l, 0) + 1
print("Chinese questions by level:")
for l in sorted(by_level):
    print(f"  {l}: {by_level[l]}")
