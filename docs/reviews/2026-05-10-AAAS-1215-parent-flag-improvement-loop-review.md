# Review: AAAS-1215 — M3-8: Parent flag → question bank improvement loop

**Reviewer:** Bee
**Date:** 2026-05-10
**Branch:** `feat/aaas-1215-impl`
**Commit:** `8bc1b6bac`
**Author:** Bee

**Verdict: CHANGES REQUESTED** — awaiting Tortoise review per Fleet Review Protocol

## Verification

### Artifact check (Fleet Review Protocol §3)

- **Branch `feat/aaas-1215-impl`**: exists locally at commit `8bc1b6bac`
- **Files changed:**
  - `mobile/src/storage/parentSessions.ts` — 97 lines changed
  - `mobile/src/storage/__tests__/parentSessions.test.ts` — 104 lines changed (rewrite)
  - `mobile/src/services/flagImprovementService.ts` — 35 lines (new)
  - `mobile/src/services/__tests__/flagImprovementService.test.ts` — 17 lines (new)
  - `mobile/src/i18n/locales/en.json` — 27 lines added (on `feat/aaas-775-supabase-auth` at `d11d0e754`)
  - `mobile/src/i18n/locales/zh-Hans.json` — 27 lines added (on `feat/aaas-775-supabase-auth` at `d11d0e754`)

### Test results

```
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
  - 9 storage tests (parentSessions)
  - 4 service tests (flagImprovementService)
```

### What was built

| Component | Status | Detail |
|-----------|--------|--------|
| `flag_reason` + `flag_timestamp` columns | Done | Added to `parent_sessions` table via migration v3 in `getDb()` |
| `FlagImprovementRow` type + `flag_improvement_analysis` table | Done | New SQLite table with topic_id PK, flag_count, common_reasons, suggestions |
| `getFlaggedSessions()` | Done | Returns flagged sessions ordered by flag_timestamp DESC |
| `getQuestionAttemptsForSession()` | Done | Returns question_attempts for a session as `QuestionAttempt[]` |
| Enhanced `setParentFlagged(reason?)` | Done | Sets flag_reason + flag_timestamp when flagging; clears both when unflagging |
| `upsertFlagImprovement()` | Done | Stores topic-level analysis in `flag_improvement_analysis` |
| `getFlagImprovementForTopic()` / `getAllFlagImprovements()` | Done | Query methods for improvement analysis |
| `FlagImprovementService.analyzeFlaggedSessions()` | Done | Groups flagged sessions by topic, generates suggestions, stores analysis |
| `FlagImprovementService.getImprovementsBySubject()` | Done | Returns improvements filtered by subject, sorted by flag count |
| `FlagImprovementService.getDashboardSummary()` | Done | Returns totalFlagged, flaggedSubjects, topFlaggedTopics, lastAnalysisDate |
| Bilingual i18n strings | Done | EN + zh-Hans: flag reason input, flagged sessions dashboard, analysis UI |

### Quality gate assessment

| Gate | Status | Notes |
|------|--------|-------|
| Tests pass | PASS | 13/13 passing |
| Bilingual completeness | PASS | All new UI strings have EN + zh-Hans |
| Accessibility | N/A | No new UI components in this PR (data layer + service only) |
| Privacy review | PASS | All data stays on-device (SQLite). No cloud calls. |
| No restricted SDKs | PASS | No new dependencies |
| Performance budget | PASS | Data-layer operations only; no UI thread impact |
| Branch hygiene | PASS | Feature branch, `[bee]`-tagged commits |
| Verification evidence | PASS | Test output attached |

## Design decisions

1. **No separate flag-analysis table at first** — The `flag_improvement_analysis` table aggregates per-topic data derived from flagged sessions. This avoids scanning all `parent_sessions` rows on every analysis query.

2. **Suggestions are rule-based, not LLM-generated** — For privacy (on-device only) and simplicity, improvement suggestions are generated from keyword matching on parent-provided flag reasons. This can be upgraded to LLM analysis later.

3. **Flag reason is free text, on-device only** — Per the ADD §4.2 privacy hard rule, flag reason is stored only in local SQLite and never leaves the device.

## References

- ADD §4.2: Parent log — flag mechanism feeds question-bank improvement loop
- Architecture §5.3: Parent can flag a session
- Fleet Review Protocol §4: Quality gate checklist
- AAAS-1188 review: `docs/reviews/2026-05-10-AAAS-1188-parent-flag-mechanism-review.md`
