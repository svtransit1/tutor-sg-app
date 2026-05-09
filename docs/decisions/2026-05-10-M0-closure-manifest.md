# M0 Closure Manifest — tutor-sg

> **Milestone:** M0 — Architecture Doc + Framework Decision + Monorepo Skeleton
> **Tag:** `m0-archive`
> **Tag commit:** `98bb81614`
> **Date closed:** 2026-05-10
> **Closed by:** Wolf (Mobile Coder)

---

## 1. Milestone definition (from ADD §12)

| Field | Value |
|---|---|
| Milestone | M0 |
| Owner | Owl (CTO) |
| DoD | Doc merged, framework chosen, monorepo skeleton created |
| Status | **DONE** |

---

## 2. Deliverables checklist

| # | Deliverable | Evidence | Commit |
|---|---|---|---|
| 1 | Architecture document | `docs/ARCHITECTURE.md` (310 lines, 9 sections) | `60921b702` |
| 2 | Framework decision | React Native + Expo + TypeScript (locked 2026-05-07 in decisions-locked.md) | `420164698` |
| 3 | Monorepo skeleton | pnpm workspace: `mobile/`, `packages/`, `docs/`, `data/`, `schema/`, `scripts/` | `420164698` |
| 4 | CI/CD pipeline | `.github/workflows/ci.yml` (typecheck, lint, test, format:check) | `eb6ed8d93` |
| 5 | Model registry | JSON schema (model x quant x CDN URL x device tier) | `fdbe353b8` |
| 6 | CDN integrity hash list | First-cut hash manifest | `4b134e79a` |
| 7 | MOE syllabus taxonomy | `data/taxonomy.json` + `data/question-bank.json` | `c8f2ef526` |
| 8 | Governance | `CODEOWNERS`, `GOVERNANCE.md`, `FLEET_REVIEW_PROTOCOL.md` | `d93c5ae7e` |
| 9 | Dev infrastructure | ESLint + Prettier + Husky lint-staged, `.editorconfig`, `.gitignore`, `.env.example` | `420164698` |
| 10 | Foundation mobile app | Expo SDK 53 app with native modules, file-based routing, onboarding + kid + parent screens | `420164698` |

---

## 3. Commits (15 total, chronological)

| # | Hash | Date | Summary |
|---|---|---|---|
| 1 | `420164698` | 2026-05-06 | init: tutor-sg app dev workspace |
| 2 | `c8f2ef526` | 2026-05-06 | AAAS-8: MOE syllabus ingest — question bank, taxonomy, generation script |
| 3 | `60921b702` | 2026-05-06 | AAAS-16: Merge architecture memo into `docs/ARCHITECTURE.md` |
| 4 | `a3b4bb141` | 2026-05-06 | AAAS-8: fix all 43 remaining invalid topic ID references |
| 5 | `eb6ed8d93` | 2026-05-06 | M0-2: CI/CD pipeline (GitHub Actions) |
| 6 | `fdbe353b8` | 2026-05-06 | M0-16: Gemma model registry — JSON schema |
| 7 | `4b134e79a` | 2026-05-06 | AAAS-29: M0-17 — CDN integrity-hash list (first cut) |
| 8 | `9789ff55d` | 2026-05-06 | [wolf] AAAS-17: CODEOWNERS + GOVERNANCE.md — local artifacts ready |
| 9 | `0193621d7` | 2026-05-07 | docs: AAAS-166 review record — CHANGES REQUESTED |
| 10 | `d93c5ae7e` | 2026-05-07 | [wolf] AAAS-17: Merge CODEOWNERS + GOVERNANCE.md |
| 11 | `f820d174e` | 2026-05-07 | [wolf] AAAS-17: Update GOVERNANCE.md — branch protection now active |
| 12 | `5f9aac3ef` | 2026-05-07 | [wolf] AAAS-17: Fix duplicate table header in GOVERNANCE.md |
| 13 | `5d34872ad` | 2026-05-10 | AAAS-1135: Merge feat/aaas-1020-loading-skeleton (M2 stack) |
| 14 | `6253e2fb3` | 2026-05-10 | AAAS-1135: Merge PhotoReviewScreen (M2 stack #2) |
| 15 | `98bb81614` | 2026-05-10 | [bee] AAAS-1144: add 3 review records |

> **Note:** Commits 13–15 include M2 stack merges and review records that landed on main after M0's core work but before this archival tag.

---

## 4. File inventory (108 tracked files on main)

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

## 5. Architecture decisions locked in M0

From ADD §7 + Architecture §2:

| Decision | Detail |
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

## 6. Next milestone

**M1** — LLM downloader spike (Wolf) + Camera/OCR pipeline spike (Bee). Parallel tracks, PoC deliverables.

---

## 7. Verification

- [x] `docs/ARCHITECTURE.md` exists (310 lines, all 9 sections populated)
- [x] `package.json` declares `version: "0.1.0"`
- [x] CI pipeline exists at `.github/workflows/ci.yml`
- [x] Model registry JSON schema committed
- [x] CDN integrity hash list committed
- [x] Governance docs exist (CODEOWNERS, GOVERNANCE.md, FLEET_REVIEW_PROTOCOL.md)
- [x] MOE syllabus data exists in `data/`
- [x] Monorepo structure: `mobile/`, `packages/`, `docs/`, `data/`, `schema/`, `scripts/`
- [x] `m0-archive` tag created on main at `98bb81614`

---

**Archive tag:** `git tag m0-archive 98bb81614`
