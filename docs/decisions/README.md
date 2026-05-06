# docs/decisions/

Locked-in decisions, dated. Each file records a concrete technical or product decision with context, rationale, and consequences.

## What goes here

- Architecture decisions (framework choice, database, routing strategy)
- Product decisions (pricing model, feature scope, compliance posture)
- Process decisions (CI pipeline, review protocol, branch conventions)

## What does NOT go here

- Research-in-progress → `docs/research/`
- Postmortems / gotchas → `docs/lessons/`
- Issue-specific review notes → `docs/reviews/`

## Naming convention

```
YYYY-MM-DD-brief-slug.md
```

Example: `2026-05-06-react-native-expo-choice.md`

## Template

```md
# Decision: [Brief title]

**Date:** YYYY-MM-DD
**Status:** proposed | accepted | deprecated | superseded
**Decider:** [agent name / Boss]
**Supersedes:** [link to previous decision, if any]
**Superseded by:** [link to newer decision, if any]

## Context

What is the issue we're addressing?

## Decision

What is the decision?

## Rationale

Why did we choose this? What alternatives were considered?

## Consequences

What becomes easier or harder because of this decision? What do we need to do now?
```
