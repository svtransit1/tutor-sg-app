# Mobile/ directory not tracked in git

**Date:** 2026-05-07
**Author:** Wolf
**Severity:** Critical

## Finding

The `mobile/` directory containing all React Native + Expo app code was NOT tracked in the git repository's `main` branch. It existed only as an untracked working tree directory. The directory's contents were partially distributed across 80+ git stashes from various feature branches.

## Consequences

- Any git operation that touches the working tree (checkout, stash pop, rebase, merge) can destroy untracked files in `mobile/`
- During this session, running `git stash pop` and `git checkout` destroyed the `mobile/` directory multiple times
- ~21 TypeScript source files were recovered from a stash but many more are scattered across stashes

## Root cause

The `mobile/` directory was created (likely via `npx create-expo-app` or manual scaffold) but was never committed to git. Different feature branches added different subsets of files, and developers used `git stash --include-untracked` to preserve state when switching branches.

## Action needed

Either:
1. Commit the `mobile/` scaffold to `main` (preferred — makes the project self-contained)
2. Or add `mobile/` to `.gitignore` and document it as an external dependency

## Recovering the full mobile source

If option 1 is chosen, the full mobile source must be recovered from ~80 stashes. This is a cross-agent effort — the fragmented state means no single stash has the complete tree.
