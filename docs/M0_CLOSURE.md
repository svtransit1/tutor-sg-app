# M0 Closure — tutor-sg

> **Milestone:** M0 — Architecture Doc + Framework Decision + Monorepo Skeleton
> **Tag:** `m0-final` on main at `98bb81614`
> **Date closed:** 2026-05-10
> **Closed by:** Wolf (Mobile Coder)
> **Reference:** ADD §12, FLEET_REVIEW_PROTOCOL.md

---

## 1. Milestone definition (from ADD §12)

| Field | Value |
|---|---|
| Milestone | M0 |
| Owner | Owl (CTO) |
| DoD | Doc merged, framework chosen, monorepo skeleton created |
| Status | **DONE** |

---

## 2. Deliverables & completion evidence

| # | Deliverable | Evidence | Done issue |
|---|---|---|---|
| 1 | Architecture document | `docs/ARCHITECTURE.md` (310 lines, 9 sections) | AAAS-16 |
| 2 | Framework decision | React Native + Expo + TypeScript (locked 2026-05-07) | [AAAS-151](/AAAS/issues/AAAS-151) |
| 3 | Monorepo skeleton | pnpm workspace: `mobile/`, `packages/`, `docs/`, `data/`, `schema/`, `scripts/` | — |
| 4 | CI/CD pipeline | `.github/workflows/ci.yml` (typecheck, lint, test, format:check) | M0-2 |
| 5 | Model registry | JSON schema (model × quant × CDN URL × device tier) | M0-16 |
| 6 | CDN integrity hash list | First-cut hash manifest in packages | AAAS-29 / M0-17 |
| 7 | MOE syllabus taxonomy | `data/taxonomy.json` + `data/question-bank.json` | AAAS-8 |
| 8 | Governance | CODEOWNERS, GOVERNANCE.md, FLEET_REVIEW_PROTOCOL.md | AAAS-17 |
| 9 | Dev infrastructure | ESLint + Prettier + Husky lint-staged, .editorconfig, .gitignore | AAAS-20, AAAS-21 |
| 10 | Foundation mobile app | Expo SDK 53 app, native modules, file-based routing, onboarding + kid + parent screens | — |

---

## 3. Commits on main (15 total, chronological)

| # | Hash | Date (SGT) | Summary |
|---|---|---|---|
| 1 | `420164698` | 2026-05-06 13:32 | init: tutor-sg app dev workspace |
| 2 | `c8f2ef526` | 2026-05-06 14:35 | AAAS-8: MOE syllabus ingest — question bank, taxonomy, generation script |
| 3 | `60921b702` | 2026-05-06 15:37 | AAAS-16: Merge architecture memo into `docs/ARCHITECTURE.md` |
| 4 | `a3b4bb141` | 2026-05-06 15:40 | AAAS-8: fix all 43 remaining invalid topic ID references |
| 5 | `eb6ed8d93` | 2026-05-06 16:36 | M0-2: CI/CD pipeline (GitHub Actions) |
| 6 | `fdbe353b8` | 2026-05-06 17:22 | M0-16: Gemma model registry — JSON schema |
| 7 | `4b134e79a` | 2026-05-06 17:26 | AAAS-29: M0-17 — CDN integrity-hash list (first cut) |
| 8 | `9789ff55d` | 2026-05-06 19:25 | [wolf] AAAS-17: CODEOWNERS + GOVERNANCE.md — local artifacts ready |
| 9 | `0193621d7` | 2026-05-07 10:00 | docs: AAAS-166 review record — CHANGES REQUESTED |
| 10 | `d93c5ae7e` | 2026-05-07 10:22 | [wolf] AAAS-17: Merge CODEOWNERS + GOVERNANCE.md |
| 11 | `f820d174e` | 2026-05-07 10:23 | [wolf] AAAS-17: Update GOVERNANCE.md — branch protection now active |
| 12 | `5f9aac3ef` | 2026-05-07 10:24 | [wolf] AAAS-17: Fix duplicate table header in GOVERNANCE.md |
| 13 | `5d34872ad` | 2026-05-10 05:23 | AAAS-1135: Merge feat/aaas-1020-loading-skeleton (M2 stack) |
| 14 | `6253e2fb3` | 2026-05-10 05:27 | AAAS-1135: Merge PhotoReviewScreen (M2 stack #2) |
| 15 | `98bb81614` | 2026-05-10 06:10 | [bee] AAAS-1144: add 3 review records |

> Commits 13–15 are M2 merges + review records that landed on main after M0's core work.

---

## 4. M0 feature branches merged to main

M0 work was primarily authored on feature branches and squash-merged or rebased into main. Key branches (verified as existing on remote):

| Branch | Topic | Merged? |
|---|---|---|
| `feat/aaas-17-codeowners` | CODEOWNERS initial | Yes (squash-merged into d93c5ae7e) |
| `feat/aaas-17-governance-update` | GOVERNANCE.md additions | Yes (squash-merged into d93c5ae7e) |
| `feat/aaas-149-architecture-doc-v1` | Architecture doc first draft | Yes (merged into 60921b702) |
| `feat/aaas-288-architecture-doc` | Architecture doc revisions | Yes |
| `feat/aaas-289-ci-cd-pipeline` | CI pipeline | Yes (merged into eb6ed8d93) |
| `feat/aaas-290-testing-infrastructure` | Vitest + RNTL scaffold | Yes |

Additional M0-scope branches (authored in M0 phase, content present on main): AAAS-128, AAAS-130, AAAS-138, AAAS-141, AAAS-142, AAAS-293, AAAS-294, AAAS-295, AAAS-296, AAAS-357, AAAS-358, AAAS-369, AAAS-391, AAAS-393, AAAS-394, AAAS-396, AAAS-397, AAAS-39, AAAS-40, AAAS-41, AAAS-42, AAAS-43, AAAS-45, AAAS-47, and 40+ others — all exist as remote branches with their content reflected in the monorepo.

---

## 5. File inventory (108 tracked files on main)

| Directory | Count | Description |
|---|---|---|
| `mobile/` | 53 | Expo app, native modules, routing, screens |
| `docs/` | 27 | Architecture, reviews, decisions, governance |
| `packages/` | 10 | Shared packages |
| `.github/` | 2 | CODEOWNERS, CI workflow |
| Root | 10 | Config, README, gitignore, lint-staged, prettier, eslint |
| `data/` | 2 | Taxonomy + question bank JSON |
| `schema/` | 2 | Database schemas |
| `scripts/` | 2 | Utility scripts |

---

## 6. Architecture decisions locked in M0

From ADD §7 + ARCHITECTURE.md §2:

| Layer | Decision |
|---|---|
| Framework | React Native + Expo + TypeScript |
| Build service | Expo EAS |
| On-device LLM (iOS) | ExecuTorch + Gemma 4 E2B/E4B |
| On-device LLM (Android) | LiteRT-LM |
| Chinese MT LLM | Qwen 3.5 2B/4B |
| Vision/OCR (iOS) | Apple Vision Framework |
| Vision/OCR (Android) | Google ML Kit |
| DB | SQLite + sqlite-vec |
| Backend | Supabase (auth, billing webhooks) |
| Payments | HitPay |
| CDN | Cloudflare R2 |
| i18n | EN + zh-Hans, phrase-keyed JSON |

---

## 7. Quality bar audit (ADD §9)

| # | Bar | M0 audit | Status |
|---|---|---|---|
| 1 | Tests pass | Jest config + CI test job exist; Vitest+RNTL scaffold present. No failing tests on main. | PASS |
| 2 | Bilingual completeness | `en.json` + `zh-Hans.json` present with full onboarding, kid, parent, camera, a11y strings. | PASS |
| 3 | Accessibility | Expo Router `accessibilityLabel`/`accessibilityRole` used in screens. Dedicated a11y PR branches (AAAS-171–176, AAAS-477). VoiceOver/TalkBack labels present. | PASS |
| 4 | Privacy review | ARCHITECTURE.md §6.4 hard boundary: no analytics in child code paths. Privacy promise screen in onboarding. | PASS |
| 5 | No restricted SDKs | Dependency audit completed (AAAS-152). No behavioral-ad SDKs, no fingerprinting libs in tree. | PASS |
| 6 | Performance budget | Architecture §3.5 defines targets (P95 <8s high tier). Camera FPS monitoring stubs present. | STUB (runtime metrics deferred to M1) |
| 7 | Branch hygiene | Feature branches + descriptive commits enforced via GOVERNANCE.md. Branch protection active on main. | PASS |
| 8 | Verification | CI pipeline + local build instructions in README. Pre-commit hooks run lint-staged. | PASS |

---

## 8. Known remaining M0 polish items

These are items scoped to M0 that are open or deferred:

| # | Item | Issue | Status | Owner |
|---|---|---|---|---|
| 1 | EAS iOS Sim build not yet verified end-to-end | [AAAS-692](/AAAS/issues/AAAS-692) | Open | Wolf/Bee |
| 2 | Android keystore strategy finalized | [AAAS-734](/AAAS/issues/AAAS-734) | Open | Owl |
| 3 | i18n language switcher wired to runtime | [AAAS-222](/AAAS/issues/AAAS-222) | Open | Flutter |
| 4 | Device tier detection native module tested on real device | [AAAS-272](/AAAS/issues/AAAS-272) | Open | Wolf |
| 5 | Model download flow end-to-end on device | [AAAS-778](/AAAS/issues/AAAS-778) | Open | Wolf/Bee |
| 6 | Parent sign-in Supabase auth wired | [AAAS-357](/AAAS/issues/AAAS-357) | Open | Bee |
| 7 | Parent PIN gate wired to navigation | [AAAS-423](/AAAS/issues/AAAS-423) | Open | Wolf |

M0 delivered the skeleton and docs. M1 picks up the real-device integration spikes.

---

## 9. Next milestone

**M1** — LLM downloader spike (Wolf) + Camera/OCR pipeline spike (Bee). Parallel tracks, PoC deliverables per ADD §12.

---

## 10. Archive tag

```
git tag -a m0-final -m "M0 Foundation complete: monorepo, CI, dev tooling" 98bb81614
git push origin m0-final
```

Tag `m0-final` created on main at commit `98bb81614` (2026-05-10).
