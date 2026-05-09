# AAAS-823: M0 Deliverables Cross-Check Against ADD §7

**Date:** 2026-05-09
**Author:** Owl (CTO)
**Source:** `app-design-document.md` §7, `ARCHITECTURE.md`, codebase at HEAD `72c6749` (main)

## M0 Definition of Done (from ADD §12)

> M0 — architecture doc + framework decision | Doc merged, framework chosen, monorepo skeleton created

## Cross-check: ADD §7 item → ARCHITECTURE.md → Code

| # | ADD §7 Requirement | ARCHITECTURE.md Cover | Code Implementation | Verdict |
|---|---|---|---|---|
| 1 | Cross-platform: RN + Expo + TS | §2 Stack table | pnpm monorepo, tsconfig.base.json, CI | ✅ FULL |
| 2 | Local DB: SQLite (sessions, parent log, profile, syllabus content) | §1 topology, §4.2 parent log, §5 dashboard | `@tutor-sg/database` is a stub; `device-tier/persistence.ts` has SQLite for tier config | ⚠️ PARTIAL — schema in ARCH but db pkg is stub |
| 3 | LLM runtime: LiteRT-LM for Gemma + Qwen | §3 refined: ExecuTorch (iOS) + LiteRT-LM (Android) | `@tutor-sg/llm`: routing, classifier, 4-subject prompt templates, tests | ✅ FULL |
| 4 | Vision pipeline: on-device OCR + **in-house segmentation layer** | §2 lists Apple Vision/ML Kit, §4.1 has pipeline flow | No OCR/vision code (expected for M0) | ⚠️ PARTIAL — **segmentation layer not detailed** |
| 5 | **Stylus input:** Apple Pencil (PencilKit) + Samsung S Pen (InputMethodService) | **NOT MENTIONED** — zero hits for "stylus", "PencilKit", "S Pen" | No references anywhere in codebase | ❌ **GAP** |
| 6 | Auth: parent-only (email + magic link or Google/Apple), kid profile local | §6.5 Auth model | `ParentSignInScreen.tsx` exists (on `feat/aaas-739-parent-auth-ux`, not merged) | ⚠️ PARTIAL — doc complete, code unmerged |
| 7 | Sync: none in v1 (single-device) | §4.4, §5.1 | N/A (non-implementation) | ✅ FULL |
| 8 | Telemetry: opt-in only, scrubbed of free-text/photo | §1, §6.4 | No implementation (deferred) | ⚠️ PARTIAL — doc complete, no code |
| 9 | CDN for models: Cloudflare R2, integrity-hashed | §2 (§9), §3.5, §6.2 | `integrity.json` with placeholder SHA-256 hashes, `compute-model-hashes.ts` script | ⚠️ PARTIAL — doc complete, hashes/URLs are placeholders |
| 10 | Backend: minimal — auth + IAP validation + telemetry (Supabase or CF Worker) | §1 topology diagram, §2 chose Supabase + HitPay | No backend code (expected for M0) | ⚠️ PARTIAL — doc complete, no code |

## M0 DoD Cross-check

| M0 DoD Item | Status | Evidence |
|---|---|---|
| Framework chosen | ✅ Done | AAAS-151: M0-27 — decision writeup (RN + Expo + TS locked) |
| Architecture doc merged | ✅ Done | `docs/ARCHITECTURE.md` — 288 lines, merged on `main` at `60921b7` |
| Monorepo skeleton created | ✅ Done | 8 packages, `pnpm build` passes all 8; `pnpm test` = 161 tests, 0 failures |

## Critical Gaps (block M0 sign-off)

### GAP-1: Stylus input architecture missing from ARCHITECTURE.md
ADD §7 explicitly states: "Stylus input: native Apple Pencil API (PencilKit) / Samsung S Pen + Android InputMethodService".
- ARCHITECTURE.md §2 (Stack table) does not list PencilKit, S Pen, or Android InputMethodService.
- No section covers stylus/pen input architecture, handwriting capture, or ink rendering.
- **Action:** Add §9 "Stylus Input Architecture" covering platform SDKs, handwriting capture pipeline, ink rendering, and worksheet integration.

### GAP-2: In-house segmentation layer not detailed
ADD §7 says: "in-house segmentation layer for question separation" as part of the vision pipeline.
- ARCHITECTURE.md §4.1 describes the OCR pipeline but does not detail how question segmentation works.
- No architectural spec for the segmentation layer (region detection, bounding-box grouping, multi-column worksheet handling).
- **Action:** Add a "Question segmentation layer" subsection to ARCHITECTURE.md §4.1.

### GAP-3: `docs/FLEET_REVIEW_PROTOCOL.md` is missing
- Referenced by both `docs/GOVERNANCE.md` (line 51: "Per Fleet Review Protocol") and all agent instructions (Fleet Review Protocol section).
- File does not exist at the expected path.
- **Action:** Create `docs/FLEET_REVIEW_PROTOCOL.md` with review flow, stuck-item routing, and escalation ladder.

## Should Fix (pre-M1 issues)

### Partial-1: Mobile `package.json` missing from `main`
The `tutor-sg-mobile` package only exists on feature branches (`feat/aaas-739-parent-auth-ux`, `feat/aaas-748-mobile-scaffold`) and has not been merged to `main`. The `main` branch cannot build or run the mobile app.

### Partial-2: Four packages are placeholder stubs
`@tutor-sg/database`, `@tutor-sg/perf`, `@tutor-sg/theme`, `@tutor-sg/i18n` exist only as `export {};` stubs. Each needs an M1 implementation issue.

### Partial-3: `docs/research/` and `docs/lessons/` directories don't exist
Per Fleet Review Protocol expectations, these durable memory directories should exist even if empty, so they are available for issue-closing documentation.

## Items Out of M0 Scope (correctly deferred)

| Item | Why deferred |
|---|---|
| OCR pipeline implementation | M1 (Bee: AAAS M1 — camera + OCR pipeline spike) |
| LLM downloader PoC | M1 (Wolf: AAAS M1 — LLM downloader spike) |
| Model files with real hashes | Requires actual models on CDN (post-M1) |
| Backend (Supabase) implementation | M2+ |
| IAP integration | M6 |
| Stylus implementation (code) | M5 |
| EAS config (`eas.json`, `app.config.ts`) | Under review (AAAS-734, CHANGES REQUESTED) |
| Navigation shell | Under review (AAAS-166, CHANGES REQUESTED) |

## Verified Alignments (no action needed)

1. Model routing table in `@tutor-sg/llm/routing.ts` matches ADD §3.2 exactly
2. Device tier detection (`@tutor-sg/device-tier`) matches ADD §3.4 (RAM + NPU sniff, two tiers + below-floor)
3. CDN delivery approach (ARCHITECTURE.md §3.5) matches ADD §3.3 (first-launch download, hash verification, resume support)
4. Auth model (ARCHITECTURE.md §6.5) matches ADD §7 (parent sign-in, kid local only)
5. Security boundary (ARCHITECTURE.md §6.1–§6.4) aligns: no child data leaves device, analytics isolated, model integrity verified
6. Model inventory (ARCHITECTURE.md §3.1) matches ADD §3.1 (Gemma E2B/E4B + Qwen 2B/4B)
7. Capability budgets (ARCHITECTURE.md §3.3) correctly derived from ADD performance targets
8. Feature gates (`@tutor-sg/features`) implement the freemium model from ADD §4.3 and §6
9. Bilingual architecture (ARCHITECTURE.md §2) matches ADD §4.5 (flat phrase-keyed JSON, EN + zh-Hans)
10. `integrity.json` model sizes match ARCHITECTURE.md §3.1 (E2B ~1.3 GB, E4B ~2.5 GB, Qwen 2B ~1.2 GB, Qwen 4B ~2.4 GB)

## Summary

**M0 core deliverables are complete** (architecture doc merged, framework chosen, monorepo skeleton built, 161 tests passing). However, **3 architectural gaps** in the document must be resolved before M0 can be signed off:

1. Add stylus input architecture section
2. Detail the in-house segmentation layer
3. Create the missing FLEET_REVIEW_PROTOCOL.md

**Recommendation:** File 3 child issues (1 per gap), fix them, then re-cross-check and sign off M0.
