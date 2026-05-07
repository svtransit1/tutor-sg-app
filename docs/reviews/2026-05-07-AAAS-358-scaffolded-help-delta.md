# AAAS-358: Scaffolded Help UI — Delta Review

**Reviewer:** 🐝 Bee  
**Date:** 2026-05-07  
**Base:** `feat/aaas-157-scaffolded-help-ui` (Wolf's existing implementation)  
**Branch:** `feat/aaas-358-scaffolded-help-ui-delta`  
**Commit:** `e84054d02`  

## Delta vs AAAS-157

| AC from AAAS-358 | AAAS-157 status | Delta added |
|---|---|---|
| Level 1: Hint (default) | ✅ Done | — |
| Level 2: Steps ("Need more help?") | ✅ Done | — |
| Level 3: Solution ("Show me the answer?") | ✅ Done (+ inline confirmation) | — |
| Kid can go back to previous level | ❌ Missing | ✅ **Backward nav**: "Back to hint" after steps, "Back to steps" after solution |
| Each level escalation logged to session | ❌ Missing | ✅ **Session callbacks**: `onRevealSteps`, `onRevealSolution`, `onGoBackToHint`, `onGoBackToSteps` |
| Subject-aware hints | ✅ LLM handles this in prompt | — |
| Bilingual | ✅ Labels passed via props | ✅ `goBackToHint` / `goBackToSteps` label keys added |

## Changes

**`mobile/src/components/scaffolded-help/ScaffoldedQuestion.tsx`** — +172/-33:
- 4 new props: `onRevealSteps`, `onRevealSolution`, `onGoBackToHint`, `onGoBackToSteps`
- 2 new label keys: `goBackToHint`, `goBackToSteps`
- "← Back to hint" link after steps revealed → collapses to hint-only view
- "← Back to steps" link after solution confirmed → collapses to steps-only view
- All callbacks wired through useCallback

**`mobile/src/components/scaffolded-help/__tests__/ScaffoldedQuestion.test.tsx`** — +33/-0:
- `calls onRevealSteps when steps are revealed`
- `calls onRevealSolution when solution is confirmed`
- `does not call onRevealSolution when cancelled`
- `shows "Back to hint" link after steps are revealed`
- `hides steps and returns to hint-only when "Back to hint" is pressed`
- `shows "Back to steps" link after solution is confirmed`
- `hides solution and returns to steps-only when "Back to steps" is pressed`
- `calls onGoBackToHint when kid goes back to hint`
- `calls onGoBackToSteps when kid goes back to steps`

## Verification

- **98 tests pass** (11 suites), including all 37 existing AAAS-157 tests
- 23 ScaffoldedQuestion tests (14 original + 9 delta)
- All tests: 0 failed, 0 skipped

## Cross-references

- ADD §4.1 — scaffolded help flow ("hint first, never show full answer until kid asks")
- `packages/database/src/types.ts` — `SessionEventType: hint_shown | answer_revealed`
- `docs/reviews/` — previous AAAS-157 review records
