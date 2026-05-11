# Review: AAAS-1188 — M3-9: Parent flag mechanism — flag session for improvement review

**Reviewer:** Tortoise
**Date:** 2026-05-10
**Branch:** `feat/aaas-1188-parent-flag-mechanism`
**Commit:** No commits beyond base (`8801633f7`)
**Author:** Bee

**Verdict: CHANGES REQUESTED**

## Verification

### Artifact check (Fleet Review Protocol §3)

- **`feat/aaas-1188-parent-flag-mechanism`**: Zero commits of its own. Created from `8801633f7` (behind `main`). Working tree contains AAAS-1208 parent-tab-shell code, NOT flag mechanism code.
- **Stash `stash@{7}`**: Contains partial AAAS-1188 work — adds `getAllSessions()`, `getQuestionsForSession()`, locale strings, and `session.ts` model. References `parentSessionDisplay.ts` which doesn't exist.
- **Actual flag toggle code**: Exists on **`feat/aaas-1185-parent-dashboard-session-list`** (AAAS-1185), not on AAAS-1188. Session detail view (`session/[id].tsx`) has a working flag/unflag toggle with `setParentFlagged()`.

### What already exists (on AAAS-1185)

| Feature                               | Status | Location                                                  |
| ------------------------------------- | ------ | --------------------------------------------------------- |
| Session detail view with metadata     | Exists | `mobile/app/(parent)/session/[id].tsx` (AAAS-1185 branch) |
| Flag/unflag toggle button             | Exists | Same file — `handleFlag()` calls `setParentFlagged()`     |
| `parent_flagged` SQLite column        | Exists | `parentSessions.ts` line 27                               |
| `setParentFlagged()` method           | Exists | `parentSessions.ts` line 74                               |
| `getFlaggedSessions()` query          | Exists | `parentSessions.ts` line 137                              |
| Bilingual flag strings (EN + zh-Hans) | Exists | `en.json` / `zh-Hans.json` on AAAS-1185                   |

### What's MISSING vs AAAS-1188 acceptance criteria

| Requirement                           | Status  | Detail                                                                     |
| ------------------------------------- | ------- | -------------------------------------------------------------------------- |
| Flag timestamp (`flag_timestamp`)     | Missing | Not in schema, row type, or interface                                      |
| Optional short reason (`flag_reason`) | Missing | Not in schema. Per acceptance: "free text, on-device only"                 |
| "Flagged Sessions" dashboard section  | Missing | `getFlaggedSessions()` exists in data layer but dashboard never renders it |
| Flag reason input UI                  | Missing | No text input for entering reason when flagging                            |
| Branch commits                        | Missing | Zero commits on `feat/aaas-1188-parent-flag-mechanism`                     |
| Verification evidence                 | Missing | No build output, screenshots, or test run logs                             |

## Required changes

1. **Rebase branch onto AAAS-1185**: `feat/aaas-1188-parent-flag-mechanism` must be rebased on `feat/aaas-1185-parent-dashboard-session-list` which already has session detail + flag toggle.

2. **Add `flag_timestamp` and `flag_reason` to schema**: `flag_timestamp TEXT, flag_reason TEXT`. Update `ParentSessionRow`, `ParentSession` interface, and `rowToSession()`.

3. **Enhance `setParentFlagged()`** to accept optional reason: set `flag_timestamp = datetime('now')` + `flag_reason = ?` when flagging; clear both when unflagging.

4. **Add "Flagged Sessions" section to dashboard**: Call `getFlaggedSessions()`, render section with header, list items with subject/topic/date/truncated reason, navigate to detail on press.

5. **Add flag reason input** to session detail view: text field when flagging, display stored reason when flagged.

6. **Add missing i18n keys**: `parent.dashboard.flaggedSessions`, `parent.dashboard.flaggedSessionsEmpty`, `parent.sessionDetail.flagReasonLabel`, `parent.sessionDetail.flagReasonPlaceholder`, `parent.sessionDetail.flaggedAt`, `parent.sessionDetail.flagReason` — all with zh-Hans counterparts.

7. **Create `parentSessionDisplay.ts`** or remove the import from stash code if not needed.

8. **Commit all work** with `[bee]`-tagged commits on the AAAS-1188 branch.

9. **Add test coverage**: unit tests for new data methods, component tests for dashboard section and reason input, full-flow test.

10. **Build + smoke test** with evidence.

## Dependency note

AAAS-1188 depends on AAAS-1186 (session detail view), which is BLOCKED — the session detail view code lives on AAAS-1185. AAAS-1185 must be reviewed and merged before AAAS-1188 can be completed.

## Quality gate assessment

| Gate                   | Status     | Notes                                                                     |
| ---------------------- | ---------- | ------------------------------------------------------------------------- |
| Tests pass             | FAIL       | No new tests on branch                                                    |
| Bilingual completeness | PARTIAL    | Flag strings exist on AAAS-1185; reason/dashboard section strings missing |
| Accessibility          | UNVERIFIED | No finished UI                                                            |
| Privacy review         | PASS       | flag_reason is on-device SQLite only                                      |
| No restricted SDKs     | PASS       | No new dependencies                                                       |
| Performance budget     | UNVERIFIED | No build                                                                  |
| Branch hygiene         | FAIL       | Zero commits                                                              |
| Verification evidence  | FAIL       | None provided                                                             |

## Escalation

**Ladder step 1**: Route to Bee with the 10 numbered items above, plus the dependency note about AAAS-1185.

## References

- ADD §4.2: Parent log — flag mechanism feeds question-bank improvement loop
- Fleet Review Protocol §3: Approval Verification Rule
- Fleet Review Protocol §4: Quality gate checklist
- AAAS-1186: Session detail view (BLOCKED — code on AAAS-1185)
- AAAS-1185: Parent dashboard session list (has flag toggle + session detail)
- AAAS-1186 review: `docs/reviews/2026-05-10-AAAS-1186-session-detail-view-review.md`
