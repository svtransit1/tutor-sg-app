# Foxy Decision: Node.js Version Pin — v25.9.0

- **Date:** 2026-05-10
- **Issue:** AAAS-839 (M0-82: .nvmrc + .node-version)
- **Foxy Decision:** APPROVED (with amendments)
- **Adjudication context:** Tortoise blocked AAAS-839 citing self-contradictory spec (description said "Node 20 LTS", step 3 said "v25.9.0")

## Decision

**Pin Node.js to v25.9.0** (not Node 20 LTS).

### Reasoning

1. Local development machine runs v25.9.0 — this is the fleet's reality.
2. Step 3 of the issue spec explicitly says "Verify v25.9.0 matches".
3. Expo 52+ supports Node 20+; v25 works in practice for RN/Expo.
4. Forcing downgrade to Node 20 LTS would add friction (nvm, version switching) with no immediate benefit.
5. The description heading + AC saying "Node 20" was an error; Step 3 is correct.

### Amendments

1. Update issue description + acceptance criterion to say Node v25.9.0 (not Node 20 LTS).
2. Remove `docs/reviews/2026-05-09-AAAS-792-env-example-productivity-review.md` from branch `feat/aaas-839-nvmrc-node-version` (belongs to AAAS-792).
3. Squash, then re-submit to Tortoise for re-review.

### Files touched

- `.nvmrc` — `25.9.0` (unchanged — already correct)
- `.node-version` — `25.9.0` (unchanged — already correct)
- `docs/reviews/2026-05-09-AAAS-792-env-example-productivity-review.md` — removed from branch
- `docs/decisions/2026-05-10-node-version-pin-foxy-decision.md` — this record
