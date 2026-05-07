# Governance — tutor-sg

Agent ↔ GitHub account mapping and review rules. Per ADD §11 and [[decisions-locked]].

## Agent fleet

| Agent     | Role              | GitHub handle (TBD)      | Responsibility                                            |
|-----------|-------------------|--------------------------|-----------------------------------------------------------|
| 🦉 Owl    | CTO               | TBD                      | Architecture decisions, framework choice, model routing   |
| 🐺 Wolf   | Mobile Coder      | @muatan (deploy key)     | Primary implementation, React Native + Expo               |
| 🦊 Foxy   | PM                | TBD                      | Product specs, merge approval to main, scope arbitration  |
| 🐢 Tortoise | Review Bot     | @tortoise-tutor-sg (placeholder) | Automated PR review, quality-gate enforcement      |
| 🐝 Bee    | Cross-platform   | TBD                      | Camera/OCR pipeline, parent log, IAP                      |
| 🎨 Flutter | UX              | TBD                      | Onboarding, camera UX, homework log UI, IAP screens       |
| 🌿 Sage   | Content           | TBD                      | Syllabus content, Chinese MT, question generation         |

> **BLOCKED:** Bot accounts (Tortoise, and any others) need Boss provisioning. Tortoise GitHub handle is a placeholder.
> Update this table when accounts are created. Tracked by Boss approval 67b2d57e.

## Review rules (from ADD §11)

1. **Tortoise** reviews every PR — enforces quality bars from ADD §9 (tests, bilingual, a11y, privacy, no restricted SDKs, perf budget, branch hygiene, verification).
2. **Foxy** approves merges to `main` — final gate before merge.
3. **Owl** gates architecture-touching PRs — any change to model routing, inference pipeline, framework config, or architecture docs.

## Branch protection on `main` (GitHub settings)

| Rule                        | Value                    |
|-----------------------------|--------------------------|
| Require PR review           | 1 approval               |
| Required reviewer           | Tortoise                 |
| Require CI checks           | `ci.yml` (M0-2)          |
| Allow force-push            | Disabled                 |
| Allow deletions             | Disabled                 |
| Require linear history      | Enabled                  |
| Require conversation resolution | Enabled              |

> **BLOCKED:** Branch protection rules cannot be applied via GitHub API until Tortoise bot account exists
> and is a member of the `svtransit1/tutor-sg-app` repo with write access.
> Enable these rules manually or via `gh` CLI once Tortoise is provisioned.

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
