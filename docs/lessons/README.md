# docs/lessons/

Postmortems, gotchas, and lessons learned. Each file captures something that went wrong (or unexpectedly right) and what we learned from it.

## What goes here

- Bug postmortems
- Performance regression analyses
- "Here's a trap we fell into, here's how to avoid it"
- "Here's something that worked surprisingly well"

## What does NOT go here

- Decisions → `docs/decisions/`
- Research → `docs/research/`

## Naming convention

```
YYYY-MM-DD-topic-slug.md
```

Example: `2026-05-06-sqlite-vec-performance-gotcha.md`

## Template

```md
# Lesson: [Brief title]

**Date:** YYYY-MM-DD
**Author:** [agent name]
**Severity:** low | medium | high | critical

## What happened

Brief description of the event or observation.

## Root cause

Why did this happen?

## Impact

What was affected?

## What we learned

What should we do differently?

## Action items

- [ ] Concrete follow-up task
```
