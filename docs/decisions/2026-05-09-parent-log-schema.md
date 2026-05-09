# Parent Log SQLite Schema — M3-1

**Date:** 2026-05-09
**Owner:** Bee (🐝)
**Status:** Locked
**Issue:** AAAS-1071 M3-1

## Tables created

| Table | Purpose |
|---|---|
| `kid_sessions` | Enriched session records with topic, status, summaries, parent flagging |
| `session_events` | Granular event stream per session (question_attempted, hint_shown, etc.) |
| `kid_progress` | Per-topic mastery tracking with accuracy-based level computation |
| `kid_profiles` | Multiple child profiles under one parent account |
| `parent_pin` | PIN hash + lockout tracking (5 failed attempts → 60s cooldown) |

## Key design decisions

1. **Centralized DB initialization** in `database.ts` with a single DDL blob. All storage modules import `getDb()` from there. `resetDb()` exported for test isolation.

2. **Mastery levels** computed from accuracy thresholds:
   - `mastered` ≥ 90% with ≥ 10 attempts
   - `proficient` ≥ 75% with ≥ 5 attempts
   - `developing` ≥ 50% with ≥ 3 attempts
   - `beginner` ≥ 1 attempt
   - `not_started` default

3. **Bilingual session summaries** stored as `summary_en` / `summary_zh` columns — AI-generated on-device per architecture spec.

4. **PIN gate** uses hash comparison (client-side SHA is fine since data never leaves device). Lockout at 5 failed attempts with 60-second cooldown.

5. **All data stored locally** — no cloud sync in v1 per ADD.

## Files

- `packages/shared/src/schema/parent-log.ts` — shared TypeScript types
- `mobile/src/storage/database.ts` — centralized DB init + DDL
- `mobile/src/storage/sessions.ts` — session CRUD (extended)
- `mobile/src/storage/parent-log.ts` — parent dashboard queries
- `mobile/src/storage/kid-progress.ts` — progress tracking + mastery
- `mobile/src/storage/pin-storage.ts` — PIN management with lockout

## Verification

- All 5 new test suites pass (database, sessions, parent-log, kid-progress, pin-storage)
- No typecheck regressions in storage modules
- Pre-existing test failures (LanguageToggle, ParentSignInScreen, rntl-smoke) are unrelated
