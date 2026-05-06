# Fleet Review Protocol (tutor-sg)

**Version:** 1.0 — 2026-05-07
**Author:** 🐢 Tortoise (Reviewer)

## Purpose

Standard process for code review across the Paperclip agent fleet. Every review must end with a clear APPROVED or CHANGES REQUESTED verdict and a durable record.

## Workflow

1. **Issue enters `in_review`** — the implementer submits their branch/commit and flips status.
2. **Reviewer wakes** — Tortoise picks up the oldest `in_review` item they are qualified for.
3. **Review pass** — run the [Review Checklist](#review-checklist) below.
4. **Verdict + record** — post result:
   - **APPROVED** → documented in `docs/reviews/` with evidence + AC checklist.
   - **CHANGES REQUESTED** → documented in `docs/reviews/` with specific fix items.
5. **Route update** — Tortoise cannot mutate other agents' issues due to Least Privilege. Instead:
   - Create a review record in `docs/reviews/YYYY-MM-DD-{issue-identifier}.md`
   - Update the drain/parent issue with the verdict
   - @-mention 🦊 Foxy on AAAS-240 to apply the PATCH status updates

## Review Checklist

### R1. Work matches acceptance criteria
Read the issue's AC section. Each bullet must be demonstrably met. Cite the file/test that proves it.

### R2. Commit exists on a branch
Find the implementer's commit via `git log --all --oneline --grep="{issue-id}"`. 
Verify the branch exists: `git branch -a | grep {issue-id}`.

### R3. Code quality
- Bilingual completeness (EN + zh-Hans) for every UI-facing string
- No hardcoded user-facing text without i18n key
- Privacy review: no data-leaving-device paths
- No restricted SDKs (no analytics in Kids path)
- Accessibility: min 16pt body, VoiceOver/TalkBack labels
- Dark mode support (essential for child-friendly use)

### R4. Tests (when runnable)
Run the test file: `npx jest --no-coverage <test-path>` from `mobile/`.
If monorepo deps block, note the issue and proceed with static review.

### R5. Scope discipline
Files changed must trace to the issue scope. No "while I was here" refactors.

## Review Record Format

Every review produces a markdown file in `docs/reviews/`:

```markdown
# {Issue-ID}: {Title} — Review Record

**Date:** YYYY-MM-DD
**Reviewer:** 🐢 Tortoise
**Branch:** {branch-name} (commit {abbreviated-commit})
**Assignee:** {implementer}

## What passes
- Bullet list of passing checks with file evidence

## Issues found (if any)
- Bullet list of problems

## AC met
- [ ] AC1
- [ ] AC2

## Verdict
**Review: APPROVED** ✅ or **Review: CHANGES REQUESTED** ❌
```

## Escalation

1. First CHANGES REQUESTED → route to original implementer
2. Second CHANGES REQUESTED → route to 🦊 Foxy
3. Third → route to Boss via `boss-needed` issue

## Paperclip Constraint

Tortoise cannot PATCH status/comments on issues assigned to other agents (Least Privilege). All review verdicts go through:
1. Review record in `docs/reviews/`
2. Status comment in AAAS-240 (drain issue)
3. @-mention 🦊 Foxy to apply PATCH updates
