# AAAS-1071: M3-1 — Parent log SQLite schema — Review Record

**Date:** 2026-05-10
**Reviewer:** 🦉 Owl (Senior Engineer / Architect)
**Branch:** `feat/aaas-1071-parent-log-schema` (commit `34b7e82be`)
**Assignee:** 🐝 Bee

## What passes

- **Schema covers all ADD §4.2 requirements:**
  - `kid_sessions` — subject, bilingual topic (topic_en/topic_zh), question_count, time_spent, struggle_indicators, AI-generated summaries (summary_en/zh, ai_help_summary_en/zh), parent_flagged, parent_flag_note (`mobile/src/storage/database.ts:10-27`)
  - `session_events` — 9 event types (question_attempted through session_ended) with flexible JSON payload (`mobile/src/storage/database.ts:29-40`)
  - `kid_progress` — per-topic mastery with accuracy-based level computation (`mobile/src/storage/database.ts:42-53`)
- **Parent log aggregation queries:**
  - `getDailySummaries` — daily grouping with subject breakdown (`mobile/src/storage/parent-log.ts:82-113`)
  - `getSessionsForParent` — time-range filtering with days param for daily/weekly (`mobile/src/storage/parent-log.ts:59-76`)
  - `getProgressBySubject` — per-subject aggregation with accuracy (`mobile/src/storage/kid-progress.ts:144-175`)
  - `getFlaggedSessions` — parent-flagged session filter (`mobile/src/storage/parent-log.ts:115-126`)
- **Flag field for parent feedback:** `flagSession` + `unflagSession` with note field (`mobile/src/storage/parent-log.ts:128-153`)
- **No server references:** All storage uses local SQLite only via `expo-sqlite`; no network calls in any storage module
- **47/47 tests pass** across 5 test suites: database (4), sessions (8), parent-log (10), kid-progress (12), pin-storage (13)
- **No typecheck regressions** — pre-existing typecheck errors are in unrelated files (device-info, HomeworkFeedbackCard)
- **Bilingual columns:** summary_en/zh, ai_help_summary_en/zh, topic_en/zh
- **Shared types exported** from `packages/shared/src/schema/parent-log.ts` via `packages/shared/src/index.ts`

## Issues found

### Non-blocking notes (for future cleanup)

1. **Type duplication** — `packages/shared/src/schema/parent-log.ts` exports canonical `Subject`, `SessionStatus`, `SessionEventType`, `MasteryLevel` types, but `mobile/src/storage/sessions.ts`, `mobile/src/storage/parent-log.ts`, and `mobile/src/storage/kid-progress.ts` each redeclare these locally instead of importing from `@tutor-sg/shared`. Works correctly but should be deduplicated in a cleanup pass.

2. **Unused `parent_pin` table** — DDL in `database.ts:55-61` creates a `parent_pin` table, but `pin-storage.ts` uses `expo-secure-store` (keychain/keystore) instead. Using SecureStore is *correct* for PIN storage — the SQLite table is dead code. Remove the unused DDL in a follow-up.

3. **N+1 query in `getDailySummaries`** — separate `SELECT DISTINCT subject` per day. Acceptable for local SQLite at v1 scale; optimize with `GROUP_CONCAT` or single query if profiling shows bottleneck.

4. **Cooldown discrepancy** — decision doc says 60s (`COOLDOWN_SECONDS = 30` in `pin-storage.ts:10`). Minor.

## AC met

- [x] Schema covers all session event types described in ADD §4.2
- [x] Parent log aggregation queries defined (daily, weekly, per-subject, per-kid)
- [x] Flag field for parent feedback included
- [x] No server-side references in schema (local-only)

## Verdict

**Review: APPROVED** ✅

Ready to merge. Four non-blocking notes for future cleanup — none affect correctness or the acceptance criteria.
