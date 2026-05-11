# Governance — tutor-sg

Agent ↔ GitHub account mapping and review rules. Per ADD §11 and [[decisions-locked]].

## Agent fleet

| Agent       | Role           | GitHub handle (TBD)              | Responsibility                                           |
| ----------- | -------------- | -------------------------------- | -------------------------------------------------------- |
| 🦉 Owl      | CTO            | TBD                              | Architecture decisions, framework choice, model routing  |
| 🐺 Wolf     | Mobile Coder   | @muatan (deploy key)             | Primary implementation, React Native + Expo              |
| 🦊 Foxy     | PM             | TBD                              | Product specs, merge approval to main, scope arbitration |
| 🐢 Tortoise | Review Bot     | @tortoise-tutor-sg (placeholder) | Automated PR review, quality-gate enforcement            |
| 🐝 Bee      | Cross-platform | TBD                              | Camera/OCR pipeline, parent log, IAP                     |
| 🎨 Flutter  | UX             | TBD                              | Onboarding, camera UX, homework log UI, IAP screens      |
| 🌿 Sage     | Content        | TBD                              | Syllabus content, Chinese MT, question generation        |

> **NOTE:** Tortoise GitHub handle `@tortoise-tutor-sg` is a placeholder — bot account not yet provisioned.
> Update this table when accounts are created. CODEOWNERS uses the placeholder; branch protection uses `svtransit1` account temporarily.

## Review rules (from ADD §11)

1. **Tortoise** reviews every PR — enforces quality bars from ADD §9 (tests, bilingual, a11y, privacy, no restricted SDKs, perf budget, branch hygiene, verification).
2. **Foxy** approves merges to `main` — final gate before merge.
3. **Owl** gates architecture-touching PRs — any change to model routing, inference pipeline, framework config, or architecture docs.

## Branch protection on `main` (GitHub settings)

| Rule                       | Value                                                           |
| -------------------------- | --------------------------------------------------------------- |
| Require PR review          | 1 approval                                                      |
| Required approval reviewer | svtransit1 (temporary — replace with Tortoise when provisioned) |
| Require CI checks          | `test / ci` (from .github/workflows/ci.yml)                     |
| Require CODEOWNERS review  | Enabled                                                         |
| Allow force-push           | Disabled                                                        |
| Allow deletions            | Disabled                                                        |
| Require linear history     | Enabled                                                         |
| Enforce admins             | Enabled                                                         |

> ✅ **Active** — enabled 2026-05-07 via `gh api`.
> **Remaining:** Replace `svtransit1` required reviewer with Tortoise bot account once provisioned (Boss approval 67b2d57e).

## Branch conventions (from ADD §11)

- `main` — shippable, protected
- `feat/<short-name>` — feature branches
- `fix/<short-name>` — bugfix branches
- Agent-tagged commits: `[wolf]`, `[bee]`, `[owl]`, `[foxy]`, `[flutter]`, `[sage]`

## Escalation path

Per Fleet Review Protocol (`docs/FLEET_REVIEW_PROTOCOL.md`) and agent instructions:

1. Implementation issues → Wolf / Bee / Flutter / Sage
2. Architecture / stuck technical → Owl
3. Product scope / unresolved review loops → Foxy
4. Spending, secrets, legal, publishing, brand identity → Boss (via `boss-needed` issue)
