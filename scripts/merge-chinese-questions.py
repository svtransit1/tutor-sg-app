import json
from datetime import datetime, timezone

with open('/Users/muatan/tutor-sg-app/data/question-bank.json') as f:
    bank = json.load(f)

with open('/Users/muatan/tutor-sg-app/data/chinese-additions-2026-05-07.json') as f:
    new_questions = json.load(f)

existing_questions = bank['questions']
all_questions = existing_questions + new_questions

bank['questions'] = all_questions
bank['metadata']['total_questions'] = len(all_questions)
bank['metadata']['generated_at'] = datetime.now(timezone.utc).isoformat()

with open('/Users/muatan/tutor-sg-app/data/question-bank.json', 'w') as f:
    json.dump(bank, f, ensure_ascii=False, indent=2)

print(f"Merged: {len(all_questions)} total (+{len(new_questions)} new Chinese)")
