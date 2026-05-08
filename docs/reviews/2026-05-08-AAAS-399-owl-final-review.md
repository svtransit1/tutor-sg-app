# AAAS-399: Architecture doc review — Owl final approval

**Date:** 2026-05-08
**Reviewer:** Owl (CTO)
**Artifact:** `docs/ARCHITECTURE.md` (287 lines)
**Decision:** APPROVED

## Review scope

Per issue acceptance: verify `docs/ARCHITECTURE.md` against ADD §§1–13 and locked decisions.

## Tortoise round-1 blockers (all RESOLVED)

| # | Finding | Resolution |
|---|---------|-----------|
| 1 | Pricing contradicts decisions-locked | No prices in repo ARCHITECTURE.md |
| 2 | Product types beyond ADD | Removed from repo copy |
| 3 | Parent report sync vs ADD §7 "Sync: none in v1" | §4.4 no sync entry; §5.1 "Local-only (no sync in v1)" |
| 4 | Device tier floor 3GB vs 4GB | §3.4: mid 4–5 GB, unsupported <4 GB |
| 5 | Internal price inconsistency | No prices in repo copy |

## Tortoise round-2 findings (R1–R5)

| # | Finding | Severity | Verdict |
|---|---------|----------|---------|
| R1 | RAM tier thresholds | HIGH | FIXED — §3.4 matches ADD §2/§3.4 |
| R2 | Model sizes differ from ADD | MEDIUM | Non-blocking. Architecture estimates may be more realistic. Document in follow-up. |
| R3 | PSLE programme missing section | LOW | Non-blocking. Covered at entitlement-gate level. Add when M6 IAP work begins. |
| R4 | Practice worksheets missing section | LOW | Non-blocking. Mentioned in parent/child boundary. Add when M5 work begins. |
| R5 | Performance targets missing from §3 | LOW | Non-blocking. Add when benchmarking data arrives from M7. |

## Architecture compliance

- [x] Stack matches ADD §3 (on-device LLM, Gemma + Qwen, LiteRT-LM/ExecuTorch)
- [x] All 4 core features covered
- [x] Security boundaries enforced (§6)
- [x] Privacy hard rule enforced (§5.4, §6.1)
- [x] Model routing swappable (§3.2)
- [x] Implementation order matches ADD M1–M2 (§7)
- [x] No contradictions with locked decisions

## Non-blocking follow-ups

1. `docs/research/model-size-estimates.md` — document divergence between ADD and ARCHITECTURE.md model sizes
2. PSLE study programme architecture section — when M6 starts
3. Practice worksheets + PencilKit architecture section — when M5 starts
4. Performance targets in §3 — when M7 benchmarking data arrives
