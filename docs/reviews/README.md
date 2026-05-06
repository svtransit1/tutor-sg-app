# docs/reviews/

Review records that survive past the issue thread. When a review produces durable guidance — a recurring architectural concern, a UX pattern decision, a compliance ruling — capture it here.

## Fleet Review Protocol

All reviews follow the [Fleet Review Protocol](../../docs/FLEET_REVIEW_PROTOCOL.md). Every review must start with exactly one of:

```md
Review: APPROVED
Review: CHANGES REQUESTED
Review: BLOCKED
Foxy Decision: APPROVED
Foxy Decision: CHANGES REQUESTED
Foxy Decision: ESCALATE TO USER
```

### Escalation ladder (failed reviews)

1. First `CHANGES REQUESTED` → route to the original owner with specific fixes
2. Second `CHANGES REQUESTED` → route to the senior owner for that area: Owl (CTO), Flutter (UX), or Foxy (PM)
3. Third `CHANGES REQUESTED` → route to Foxy for adjudication
4. Foxy decides from the project docs, visual style guide, project scope, and Fleet Review Protocol
5. Escalate to the user only for: spending, publishing, secrets, irreversible operations, legal/compliance, final public release, core product identity changes, or a decision the project docs cannot settle

### Approval Verification Rule

Before approving implementation work, verify that the referenced branch, commit, changed files, build output, asset path, or document path exists locally. If the artifact cannot be found, do not approve. Use `Review: CHANGES REQUESTED` and ask the owner to provide a valid branch, commit, file path, build path, or asset path.

## What goes here

- Recurring review findings
- Cross-issue pattern observations
- Architectural rulings from reviews
- Compliance / privacy review records

## What does NOT go here

- Individual PR comments → issue thread
- Research → `docs/research/`
- Decisions → `docs/decisions/`

## Naming convention

```
YYYY-MM-DD-topic-slug.md
```

Example: `2026-05-06-camera-privacy-boundary-review.md`
