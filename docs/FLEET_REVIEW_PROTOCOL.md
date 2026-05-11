# Fleet Review Protocol — tutor-sg

> **Purpose:** Define the standard process for all code reviews, design reviews, handoffs, stuck-item routing, and durable repo memory within the AaaS fleet.
>
> **Authority:** Derived from ADD §9 (quality bars), ADD §11 (development conventions), and the agent working agreements in AGENTS.md.
>
> **All agents follow this protocol.** Exceptions require an issue tagged `add-amendment`.

---

## 1. Review lifecycle

Every reviewable artifact (code PR, design spec, architecture decision, content dataset) follows this state machine:

```
in_progress → in_review → { APPROVED | CHANGES_REQUESTED | BLOCKED }
                 ↑              |                |              |
                 └──────────────┘                │              │
                    (rework + resubmit)           │              │
                                                  ▼              ▼
                                             done (merge)   blocked
                                                               │
                                                               ▼
                                                          unblock action
```

### 1.1 States

| State               | Meaning                                               |
| ------------------- | ----------------------------------------------------- |
| `in_progress`       | Owner is actively working. Do not review yet.         |
| `in_review`         | Submitted for review. Reviewer picks up.              |
| `APPROVED`          | Passes all quality bars. Ready to merge.              |
| `CHANGES_REQUESTED` | Specific blockers found. Owner must fix and resubmit. |
| `BLOCKED`           | Cannot proceed without external input (see §6).       |
| `done`              | Merged to `main`.                                     |

---

## 2. Review verdict format

Every review verdict **must** start with exactly one of these first lines:

```md
Review: APPROVED
Review: CHANGES REQUESTED
Review: BLOCKED
```

Or, when issued by Foxy (PM) as a decision:

```md
Foxy Decision: APPROVED
Foxy Decision: CHANGES REQUESTED
Foxy Decision: ESCALATE TO USER
```

### 2.1 Verdict requirements

Each verdict must include:

1. **Verdict line** (exact format above)
2. **What was checked** — branch name, commit hash, build output, asset path, or document path
3. **Evidence of verification** — what was run, what was examined
4. **Required actions** (for CHANGES_REQUESTED): specific, numbered, actionable items
5. **Escalation ladder step** (for CHANGES_REQUESTED/BLOCKED): who should handle next

---

## 3. Approval Verification Rule

**Before approving any implementation work, the reviewer MUST verify that the referenced artifact exists locally.**

Check at minimum:

- **Branch** exists locally (`git branch --list`) or remotely (`git branch -r`)
- **Claimed files** exist at the stated paths
- **Build output** or test evidence matches what was claimed

If the artifact cannot be found, do not approve. Use:

```md
Review: CHANGES REQUESTED
```

Then ask the owner to provide a valid branch, commit, file path, build path, or asset path. Never approve based only on a closing comment.

---

## 4. Quality gate checklist

Every review must check these **mandatory gates** (from ADD §9). A failure on any gate is a CHANGES_REQUESTED.

| #   | Gate                       | How to verify                                                                                                          |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | **Tests pass**             | Run test suite. New code has unit + integration + at least one full-flow scenario.                                     |
| 2   | **Bilingual completeness** | Every new UI string has `en` AND `zh-Hans` counterparts in locale files.                                               |
| 3   | **Accessibility**          | Min 16pt body font, high contrast, icons+labels (no text-only), VoiceOver/TalkBack labels on all interactive elements. |
| 4   | **Privacy review**         | No new code path sends child photos, OCR text, or kid free-text off-device. No analytics SDKs in child-facing screens. |
| 5   | **No restricted SDKs**     | No behavioral-ad SDKs, no fingerprinting libraries, no analytics in Kids code paths.                                   |
| 6   | **Performance budget**     | LLM operations don't block UI thread; camera preview >30 fps; cold start <3s on mid-tier.                              |
| 7   | **Branch hygiene**         | Feature branch from `main`, descriptive commits, agent-tagged (`[wolf]`, `[bee]`, etc.), no direct `main` pushes.      |
| 8   | **Verification evidence**  | Build succeeded locally, smoke test ran, screenshot/log attached to PR or issue comment.                               |

### 4.1 Architecture gate (Owl)

Any PR that touches model routing, inference pipeline, framework config, or architecture docs requires Owl approval in addition to the standard review. Mark as `ARCHITECTURE: YES` in the review header.

---

## 5. How to conduct a review

### 5.1 Standard review flow

1. **Claim the issue** — assign yourself in Paperclip or note in the issue thread
2. **Check out the branch** — `git checkout <branch>` or verify locally
3. **Read the acceptance criteria** — from the issue description
4. **Verify the artifact exists** — per §3 Approval Verification Rule
5. **Check each quality gate** — per §4 checklist
6. **Read the diff** — review every changed line
7. **Run build + smoke test** — verify it compiles and runs
8. **Write the review record** — per §7 format
9. **Post verdict** — in the issue thread with the exact first line from §2
10. **Save durable record** — write to `docs/reviews/` per §7

### 5.2 Review comments

- Be specific and actionable. "Fix the crash" is not actionable. "Line 42: `foo` can be null — add null check before calling `.bar()`" is actionable.
- Reference file paths and line numbers.
- Distinguish between blockers (must fix) and nits (nice to fix).
- Nits should be prefixed with `Nit:` and do not block approval.

---

## 6. Escalation ladder

When a review returns CHANGES_REQUESTED for the same artifact multiple times:

| Attempt                    | Route to                                                          | Action                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1st CHANGES_REQUESTED      | Original owner with specific fixes                                | Owner fixes and resubmits                                                                                                                                                            |
| 2nd CHANGES_REQUESTED      | Senior owner for that area: Owl (CTO), Flutter (UX), or Foxy (PM) | Senior owner reviews the fixed work                                                                                                                                                  |
| 3rd CHANGES_REQUESTED      | Foxy for adjudication                                             | Foxy decides from project docs, visual style guide, project scope, and this protocol                                                                                                 |
| BLOCKED → ESCALATE TO USER | Boss                                                              | Only for: spending, publishing, secrets, irreversible operations, legal/compliance, final public release, core product identity changes, or decisions the project docs cannot settle |

### 6.1 Blocked items

When an issue is BLOCKED:

1. Mark the issue status as `blocked` in Paperclip
2. Name the unblock owner (who needs to act)
3. Name the unblock action (what they need to do)
4. If blocked by another issue, cross-reference the blocking issue ID

---

## 7. Durable repo memory

Review records, decisions, research, lessons, and asset specs go in `docs/` subdirectories. Issue comments are for task-local status only.

### 7.1 Where things live

| Artifact type                 | Directory         | File naming                                    | Retention        |
| ----------------------------- | ----------------- | ---------------------------------------------- | ---------------- |
| Review records                | `docs/reviews/`   | `YYYY-MM-DD-<ISSUE-ID>-<short-name>-review.md` | Permanent        |
| Locked decisions              | `docs/decisions/` | `YYYY-MM-DD-<short-name>.md`                   | Permanent        |
| Research / investigations     | `docs/research/`  | `YYYY-MM-DD-<topic>.md`                        | Permanent        |
| Postmortems / gotchas         | `docs/lessons/`   | `YYYY-MM-DD-<topic>.md`                        | Permanent        |
| Screen-flow specs, UI handoff | `docs/assets/`    | `YYYY-MM-DD-<component-or-feature>.md`         | Until superseded |

### 7.2 Review record format

```md
# Review: <ISSUE-ID> — <title>

**Reviewer:** <agent-name>
**Date:** <YYYY-MM-DD>
**Branch:** `<branch-name>`
**Commit:** `<commit-hash>` (optional)
**Author:** <agent-name>

**Verdict: APPROVED / CHANGES REQUESTED / BLOCKED**

## Verification

<Describe what was verified: branch checkout, file existence, build run, test output, etc.>

## <Section for failures or notes>

<For CHANGES_REQUESTED: specific, numbered items to fix.>
<For BLOCKED: what is blocking and who needs to act.>

## Escalation

<Ladder step and next owner.>
```

### 7.3 When to write durable records

- **Review records:** always — every review produces a `docs/reviews/` file
- **Decisions:** any decision that constrains future work — write to `docs/decisions/`
- **Research:** when you investigate a technical question and the answer isn't obvious from the code
- **Lessons:** when a bug or miscommunication cost significant time
- **Assets:** when screen flows, UI specs, or design handoffs have detail that shouldn't be lost in issue threads

---

## 8. Handoff procedures

When handing off work to another agent:

1. **State what was done** — branch, commit, files changed, verification evidence
2. **State what remains** — acceptance criteria not yet met, known issues
3. **State the next owner** — who should pick this up
4. **Write durable records** — any decisions or research from the handoff go in `docs/`
5. **Update the issue** — add a comment with the handoff summary
6. **Reassign** — change the Paperclip issue assignee

### 8.1 Handoff comment template

```
Handoff: <agent-name> → <next-agent-name>

**Done:**
- Branch: <branch-name> at <commit>
- Files: <list of files changed>
- Verification: <build output, test results>

**Remaining:**
- <item 1>
- <item 2>

**Next owner:** <agent-name>
```

---

## 9. Review Drain Mode

When the project has **10 or more open `in_review` issues**, the fleet enters Review Drain Mode.

### 9.1 Rules

1. **Prioritize review throughput** over new feature work
2. On every heartbeat, first query assigned `in_review` issues
3. Take the oldest issue the reviewer is qualified to decide
4. Finish with one concrete board action:
   - APPROVED → mark done
   - CHANGES_REQUESTED → with exact blocker evidence and escalation step
   - Reassign to the correct reviewer
   - BLOCKED → with named unblock owner and action
5. Do **not** create new implementation issues while the review queue remains above 10, unless Foxy explicitly asks for it

### 9.2 How to exit

Review Drain Mode ends when `in_review` count drops below 10. Normal heartbeat processing resumes.

---

## 10. Agent review ownership

| Agent       | Qualified to review | Review scope                                                            |
| ----------- | ------------------- | ----------------------------------------------------------------------- |
| 🦉 Owl      | Any PR              | Architecture, model routing, inference, framework config, platform code |
| 🐺 Wolf     | Code PRs            | Mobile implementation, feature code, tests                              |
| 🐝 Bee      | Code PRs            | Camera/OCR, parent log, IAP, shared packages                            |
| 🦊 Foxy     | Any PR              | Product scope, merge approval, UX policy, escalation adjudication       |
| 🐢 Tortoise | All PRs (automated) | Quality gate enforcement per ADD §9                                     |
| 🎨 Flutter  | UI/UX PRs           | Screen designs, accessibility, style guide adherence                    |
| 🌿 Sage     | Content PRs         | Syllabus accuracy, bilingual content, Chinese MT                        |

---

## 11. Cross-references

- **ADD §9 — Quality bars** (this protocol §4 is derived from it)
- **ADD §11 — Development conventions** (branching, commit tags, review roles)
- **GOVERNANCE.md** — agent↔GitHub mapping, branch protection, CODEOWNERS
- **AGENTS.md** — per-agent working agreements, specialty boundaries
- **`docs/reviews/`** — review record archive
- **`docs/decisions/`** — locked technical decisions
