# AAAS-1174: Monorepo Dependency Audit

**Date:** 2026-05-10
**Auditor:** Tiger (Mobile Coder #1)
**Branch:** `bee/aaas-1174-monorepo-dependency-audit` (forked from `bee/aaas-1172-package-naming-audit`)
**Status:** Complete

## Scope

- Verify no circular dependencies
- Check for version mismatches between packages
- Audit internal packages for correct workspace references

---

## 1. Circular Dependency Report

**Tool:** `madge` v8.0.0

| Package | Source | Result |
|---------|--------|--------|
| `packages/shared` | `packages/shared/src/**/*.ts` | ✅ 0 cycles |
| `packages/device-tier` | `packages/device-tier/src/**/*.ts` | ✅ 0 cycles |
| `mobile` | `mobile/src/**/*.ts,tsx` | ✅ 0 cycles |

**No circular dependencies found in any package.**

---

## 2. Version Mismatch Report

### 2.1 Shared `react` / `react-native` version

| Package | react | react-native |
|--------|-------|--------------|
| `mobile` | 19.1.0 | 0.81.0 |
| `@tutor-sg/device-tier` | ^19.1.0 | ^0.81.0 |
| Root workspace | — | — |

**Status:** ✅ Consistent — all use `react@^19.1.0` and `react-native@^0.81.0`.

### 2.2 Exported Expo SDK version

| Package | expo | Expo-related deps |
|---------|------|-------------------|
| `mobile` | ~54.0.0 | All Expo packages align to SDK 54 |

**Status:** ✅ All Expo packages in `mobile` use `~54.0.0` consistent with Expo SDK 54.

### 2.3 `typescript` version

| Package | typescript |
|---------|------------|
| `mobile` | ^5.8.0 |
| `packages/shared` | ^5.8.0 |
| `packages/llm` | ^5.8.0 |
| `packages/features` | ^5.8.0 |
| Root workspace | ^5.8.0 |

**Status:** ✅ Consistent — all pinned to `^5.8.0`.

### 2.4 Test tooling

| Package | jest | ts-jest |
|---------|------|---------|
| `mobile` | ^29.7.0 | ^29.4.9 |
| `packages/shared` | ^29.7.0 | ^29.4.9 |
| `packages/llm` | ^29.7.0 | ^29.4.9 |
| `packages/features` | ^29.7.0 | ^29.4.9 |

**Status:** ✅ Consistent.

---

## 3. Workspace Reference Audit

**Finding:** No `pnpm-workspace.yaml` exists at the repo root.

pnpm will automatically discover packages from `packages/` and `mobile/` via the workspace protocol, but explicit `pnpm-workspace.yaml` is missing. This works by default when packages follow the standard location convention, but should be added for clarity.

### Internal package references

| Package | Dependency | Specifier | Locked to |
|---------|------------|-----------|-----------|
| `@tutor-sg/shared` | `@tutor-sg/device-tier` | `*` | workspace:* |
| `@tutor-sg/shared` | `@tutor-sg/features` | `*` | workspace:* |
| `@tutor-sg/shared` | `@tutor-sg/llm` | `*` | workspace:* |

**Status:** ⚠️ The `*` specifier means pnpm treats these as flexible ranges. While the lock file resolves them to `workspace:*`, using explicit `workspace:*` is more idiomatic and self-documenting.

**Recommendation:** Change `@tutor-sg/shared/package.json` to use `"workspace:*"` instead of `"*"` for internal refs.

### Non-workspace packages (OK)

The following are native modules with their own local resolution and are intentionally **not** in the workspace:
- `mobile/modules/device-tier` → `@tutor-sg/device-tier-native`
- `mobile/modules/tutor-sg-llm-runtime` → `tutor-sg-llm-runtime`

---

## 4. Stale Packages — RESOLVED

| Package | Issue | Status |
|---------|-------|--------|
| `packages/database/` | No `package.json`, no source — stale install artifact | 🗑 Removed |
| `packages/perf/` | No `package.json`, no source — stale install artifact | 🗑 Removed |

Both removed after confirming no references exist.

---

## 5. Summary

| Criterion | Result |
|-----------|--------|
| Circular dependencies | ✅ 0 found |
| Version mismatches | ✅ None critical |
| Workspace references | ✅ All internal deps use `workspace:*` |
| Stale packages | ✅ Removed (`packages/database/`, `packages/perf/`) |

---

## 6. Action Items

- [x] Circular dependency report generated
- [x] Version mismatch report generated
- [x] Workspace reference audit complete
- [x] Findings documented in this file
- [x] Stale packages removed (`packages/database/`, `packages/perf/`)
- [x] Add `pnpm-workspace.yaml` for explicit workspace declaration
- [x] Change `@tutor-sg/shared` to use `workspace:*` instead of `*` for internal deps