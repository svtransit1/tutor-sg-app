# Branch Protection Rules & PR Workflow

**Scope:** AaaS / tutor-sg — all agents working on this repo.
**Source of truth:** Branch protection on `main` is enforced via GitHub settings. CI checks run via `.github/workflows/ci.yml`. Roles per `docs/GOVERNANCE.md`.

---

## 1. Branch protection on `main`

| Rule | Value |
|---|---|
| Require PR review | 1 approval |
| Required approval reviewer | `svtransit1` (temporary — replace with Tortoise bot when provisioned) |
| Require CI checks | `typecheck`, `lint`, `RN Bundle (ios)`, `RN Bundle (android)` |
| Require CODEOWNERS review | Enabled (`* @tortoise-tutor-sg`) |
| Allow force-push | Disabled |
| Allow deletions | Disabled |
| Require linear history | Enabled |
| Enforce admins | Enabled |

> **Active** since 2026-05-07.
> **TODO:** Replace `svtransit1` reviewer with Tortoise bot once Boss provisions it.

---

## 2. Branch naming

| Use | Pattern | Example |
|---|---|---|
| Feature | `feat/<short-name>` | `feat/aaas-806-branch-protection-doc` |
| Bugfix | `fix/<short-name>` | `fix/aaas-123-button-crash` |
| Review | `review/<short-name>` | `review/aaas-142` |
| Tortoise review | `tortoise/<short-name>` | `tortoise/aaas-129-prompt-templates` |

Always create feature/fix branches from `main`. Never commit directly to `main`.

---

## 3. PR workflow (step by step)

### 3.1 Before opening a PR

1. **Commit locally** with descriptive messages. Agent-tagged commits recommended: `[sage]`, `[wolf]`, `[bee]`, `[foxy]`, `[owl]`, `[flutter]`.
2. **Run all CI checks locally:**
   ```sh
   pnpm typecheck
   pnpm lint
   pnpm test        # unit + integration
   npx expo export --platform ios    # verify bundle
   npx expo export --platform android
   ```
3. **Verify quality bars** (per App Design Document §9): tests pass, bilingual complete, a11y ok, privacy clean, no restricted SDKs, perf budget met, branch hygiene, verification evidence attached.

### 3.2 Opening the PR

1. Push branch to origin:
   ```sh
   git push -u origin <branch-name>
   ```
2. Open PR on GitHub against `main`.
3. Title format: `[agent-tag] AAAS-NNN: Short description` (e.g. `[sage] AAAS-806: Document branch protection rules and PR workflow`).
4. Body must include:
   - **Summary:** what changed and why
   - **Evidence:** screenshot, log excerpt, or test output confirming verification
   - **Checklist:** quality bar items ticked (tests, bilingual, a11y, privacy, no restricted SDKs, perf, branch hygiene, verification)

### 3.3 Review process

| Step | Who | Action |
|---|---|---|
| 1 | Tortoise (review bot) | Automated review: quality gates, CI status, CODEOWNERS check. Blocks if any gate fails. |
| 2 | Owl | Reviews only if PR touches architecture: `docs/ARCHITECTURE.md`, `src/model/`, `src/inference/`. Blocks architecture violations. |
| 3 | Foxy | Final approval for merge to `main`. |

### 3.4 Review outcomes

- **APPROVED** → PR is ready to merge.
- **CHANGES REQUESTED** → address comments, push fixes, re-request review.
- **BLOCKED** → cannot proceed without external unblock (e.g. Boss decision, missing dep).

### 3.5 Escalation ladder for failed reviews

| Round | Action |
|---|---|
| 1st CHANGES REQUESTED | Route to original owner with specific fixes. |
| 2nd CHANGES REQUESTED | Route to senior owner for that area: Owl (CTO), Flutter (UX), Foxy (PM). |
| 3rd CHANGES REQUESTED | Route to Foxy for adjudication. |
| Foxy cannot decide | Escalate to Boss via `boss-needed` issue. |

### 3.6 Merging

1. All CI checks must pass (typecheck, lint, bundle ios + android).
2. CODEOWNERS review must be satisfied (`@tortoise-tutor-sg`).
3. Required reviewer must approve (`svtransit1` / Tortoise).
4. **Foxy** performs the merge (squash merge preferred for feature branches; linear history enforced).
5. Delete the feature branch after merge.

---

## 4. CI pipeline

Defined in `.github/workflows/ci.yml`. Runs on push to `main` and on every PR.

| Job | Command | Required for merge |
|---|---|---|
| `typecheck` | `pnpm typecheck` | Yes |
| `lint` | `pnpm lint` | Yes |
| `RN Bundle (ios)` | `npx expo export --platform ios` | Yes |
| `RN Bundle (android)` | `npx expo export --platform android` | Yes |

Jobs run in parallel (typecheck + lint), then bundle jobs wait for both to pass. All must pass before merge.

---

## 5. Pre-commit hooks

Configured via Husky + lint-staged (AAAS-795). Runs on every `git commit`:
- ESLint on staged files
- TypeScript typecheck on staged files

If pre-commit hook fails, fix the errors and retry the commit. Do not skip hooks.

---

## 6. Visual review evidence

When a PR changes UI, attach a screenshot or screen recording to the PR body. For content changes (questions, strings, datasets), attach a sample output or log extract. Verification evidence is a hard quality gate — no merge without it.

---

## 7. Cross-references

- `docs/GOVERNANCE.md` — agent role mapping, review rules, escalation path
- `docs/decisions/` — locked-in technical decisions
- `docs/reviews/` — durable review records per PR
- `docs/ARCHITECTURE.md` — technical architecture (Owl gates changes here)
- `.github/CODEOWNERS` — CODEOWNERS config (Tortoise as global owner)
- `.github/workflows/ci.yml` — CI pipeline definition
- [App Design Document §9](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) — quality bars
- [App Design Document §11](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) — development conventions
