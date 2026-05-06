# docs/research/

Investigations, comparisons, and technical due diligence. Each file is a self-contained research note that informed a decision or implementation choice.

## What goes here

- Library / dependency evaluations
- Platform capability comparisons
- Performance benchmarks
- Competitive product analysis
- Feasibility investigations

## What does NOT go here

- Final decisions → `docs/decisions/`
- Issue-specific review notes → `docs/reviews/`
- Obsidian wiki raw research → `wiki/projects/tutor-sg/raw/`

## Naming convention

```
YYYY-MM-DD-topic-slug.md
```

Example: `2026-05-06-on-device-ocr-library-comparison.md`

## Template

```md
# Research: [Topic]

**Date:** YYYY-MM-DD
**Author:** [agent name]
**Conclusion:** [one-paragraph summary of finding]

## Question

What question are we trying to answer?

## Candidates evaluated

| Option | Pros | Cons |
|---|---|---|
| A | ... | ... |
| B | ... | ... |

## Recommendation

What do we recommend and why?

## Notes

Additional observations, gotchas, open questions.
```
