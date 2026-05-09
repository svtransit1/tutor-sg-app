---
name: Pull Request
about: Submit a change for review (tutor-sg)
title: "[AAAS-XXX] Short description"
labels: ""
assignees: ""
---

## Description

<!-- Briefly describe what this PR does and why. -->

## Related Issue

Closes AAAS-XXX

## Type of Change

- [ ] Feature (`feat/<name>` branch)
- [ ] Bug fix (`fix/<name>` branch)
- [ ] Chore / infrastructure
- [ ] Documentation / specs

## Branch Hygiene

<!-- Delete this section if not applicable. -->

- [ ] Branch follows naming convention (`feat/<short-name>` / `fix/<short-name>`)
- [ ] Commits are agent-tagged (e.g. `[wolf]`, `[bee]`)
- [ ] Not targeting `main` directly (PR only)
- [ ] No unrelated changes included

## Quality Gates (ADD §9)

<!-- Check every box that applies. Leave unchecked if not applicable to this change. -->

### Tests
- [ ] Unit tests pass (`pnpm test`)
- [ ] Integration / full-flow scenario tested
- [ ] New code is covered

### Bilingual (EN + zh-Hans)
- [ ] Every new UI string has both `en` and `zh-Hans` keys
- [ ] ICU MessageFormat used for interpolation/plurals
- [ ] No hardcoded user-facing text without i18n

### Accessibility
- [ ] Body text minimum 16pt
- [ ] High contrast maintained
- [ ] All interactive elements have VoiceOver / TalkBack labels
- [ ] No text-only states — icons + labels used

### Privacy
- [ ] No new code path sends child photos, OCR text, or kid free-text off-device
- [ ] Any new telemetry is opt-in only
- [ ] Telemetry events scrubbed of free-text / photo content

### Restricted SDKs
- [ ] No behavioral-ad SDKs added
- [ ] No fingerprinting libraries added
- [ ] No analytics SDKs in kid-facing code paths

### Performance
- [ ] LLM-heavy operations do not block the UI thread
- [ ] Camera preview maintains >30 fps (if camera code touched)
- [ ] Cold start <3 sec on mid-tier device (no regression)

### Verification Evidence

<!-- REQUIRED before claiming in_review. See FLEET_REVIEW_PROTOCOL.md. -->

- **Build:** [ ] succeeded locally (platforms: _____________)
- **Smoke test:** [ ] ran and passed
- **Evidence:** [ ] screenshot / log attached below (or linked)

```
<!-- Paste terminal output, screenshots, or links here -->
```

## Reviewer Notes

<!-- Anything the reviewer should know: tricky decisions, deferred items, known limitations. -->

<!-- Toroise review fields (filled by Tortoise after review):

Review: PENDING
Branch: _____________ (commit _____________)

R1 (AC match):
R2 (Commit on branch):
R3 (Code quality):
R4 (Tests):
R5 (Scope discipline):
-->
