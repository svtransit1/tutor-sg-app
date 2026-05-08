# Branch base convention

**Date:** 2026-05-09
**Context:** Main branch at `5f9aac3ef` is stale — missing root package.json, workspace config, all app code (mobile/, packages/*). Feature branches stack on `origin/feat/aaas-625-typecheck-lint-gate` as the de facto shared base.

**Decision:** `feat/` branches may be created from the latest shared feature branch (`origin/feat/aaas-625-typecheck-lint-gate` or successor) rather than main. This is necessary because main has not been updated with the workspace scaffolding that all packages depend on.

**Rule:** When main is updated with the workspace infrastructure (root package.json, pnpm-workspace.yaml, etc.), all new feature branches MUST be created from main.
