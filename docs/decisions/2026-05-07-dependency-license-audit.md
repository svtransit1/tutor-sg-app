# Dependency License Compliance Audit

**Date:** 2026-05-07
**Issue:** AAAS-152 / M0-28
**Author:** Wolf (🐺)
**Status:** ✅ PASS — all dependencies are compatible with commercial App Store distribution.

---

## Scope

All **direct** and **transitive** dependencies declared across the `tutor-sg-app` monorepo:

| Workspace | Role |
|---|---|
| `mobile/` | Expo + React Native app (iOS + Android) |
| `packages/shared/` | Shared schemas, model registry, integrity manifests |
| `packages/i18n/` | Internationalization (i18next + expo-localization) |
| `packages/theme/` | Kid-friendly design tokens and theme system |
| `packages/perf/` | P95 latency measurement harness |

**Audit tool:** `pnpm licenses list` against resolved lockfile (1034 packages total).
**Environment:** macOS, pnpm v10.33.0, Node >=20.

---

## License Distribution

| License | Count | Notes |
|---|---|---|
| MIT | ~708 | Permissive — fully compatible |
| Apache-2.0 | ~15 | Permissive — requires notice file |
| BSD-3-Clause | ~15 | Permissive — compatible |
| BSD-2-Clause | ~8 | Permissive — compatible |
| ISC | ~30 | Equivalent to MIT |
| BlueOak-1.0.0 | 9 | Model license — permissive, compatible |
| MIT AND BSD-3-Clause | 1 | Dual license — fine |
| MIT OR CC0-1.0 | 1 | Dual license — fine |
| BSD-2-Clause OR MIT OR Apache-2.0 | 1 | Triple license — fine |
| BSD-3-Clause OR GPL-2.0 | 1 | Dual license — choose BSD-3-Clause |
| MIT AND Apache-2.0 | 1 | Dual license — fine |
| MPL-2.0 | 2 | MPL — compatible, requires notice |
| 0BSD | 2 | Public domain equivalent — fine |
| Unlicense | 2 | Public domain equivalent — fine |
| Python-2.0 | 1 | Permissive — compatible |
| CC-BY-4.0 | 1 | Data only (caniuse-lite) — build tool dep |
| BSD (unversioned) | 1 | `readline` dev dep — permissive |

---

## Detailed Review

### ✅ Fully Permissive (lowest risk)

All packages under these licenses are compatible with commercial distribution on iOS App Store and Google Play Store without restrictions:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- 0BSD
- Unlicense
- Python-2.0

### ✅ BlueOak-1.0.0 (9 packages)

BlueOak Model License v1.0.0 is a permissive license created by the Blue Oak Council. It explicitly allows use, modification, and distribution in commercial software. **Compatible.**

Packages: `chownr`, `glob`, `lru-cache`, `minimatch`, `minipass`, `path-scurry`, `sax`, `tar`, `yallist`

### ✅ MPL-2.0 (2 packages)

Mozilla Public License v2.0 is a weak-copyleft license. It permits linking from proprietary applications. The only obligation is to include a copy of the MPL notice if the MPL-licensed files are distributed unchanged.

Packages:
- `lightningcss` — Rust-based CSS processor (transitive, build-time)
- `lightningcss-darwin-arm64` — native binary

**Action:** Ensure MPL notice is referenced in the app's OSS license acknowledgements screen (planned for M1).

### ⚠️ node-forge — BSD-3-Clause **OR** GPL-2.0 (1 package)

`node-forge` offers the consumer a choice of license. As the licensee, we choose **BSD-3-Clause**, which is fully permissive and compatible with commercial distribution.

**Verdict:** OK — we elect BSD-3-Clause.

### ✅ CC-BY-4.0 (1 package)

`caniuse-lite` is a **data-only** package (browser feature-support tables) used exclusively by `browserslist` during build. It does not ship in the app bundle. CC-BY-4.0 permits commercial use with attribution.

**Action:** No action needed — build-time only, not shipped.

### ✅ Dual/Multi-License Packages

| Package | License | Verdict |
|---|---|---|
| `rc` | BSD-2-Clause OR MIT OR Apache-2.0 | Any option is permissive |
| `type-fest` | MIT OR CC0-1.0 | MIT chosen (or CC0, equally permissive) |
| `@expo-google-fonts/material-symbols` | MIT AND Apache-2.0 | Both permissive |
| `react-native-mmkv` | MIT AND BSD-3-Clause | Both permissive |

---

## ⚠️ Deprecation Warnings (not license issues)

8 deprecated subdependencies were found. These are not license risks but should be updated at the next dependency refresh:

1. `@babel/plugin-proposal-class-properties@7.18.6`
2. `@babel/plugin-proposal-nullish-coalescing-operator@7.18.6`
3. `@babel/plugin-proposal-optional-chaining@7.21.0`
4. `glob@7.2.3`
5. `inflight@1.0.6`
6. `rimraf@2.6.3`, `rimraf@3.0.2`
7. `uuid@7.0.3`

**Action:** Tolerate for now — these are transitive build deps. Track as tech debt.

---

## Peer Dependency Warnings (not license issues)

| Issue | Package | Impact |
|---|---|---|
| `@expo/metro-runtime@^55.0.11` unmet | `expo-router` | May affect dev server |
| `react@^19.2.6` unmet (found 19.1.0) | `react-test-renderer`, `react-dom` | Test runner / web target |

**Action:** Pin React to 19.1.0 (current RN 0.81.0 compatible version). These resolve on next `pnpm update`.

---

## Restricted Licenses Found: **NONE**

No GPL, AGPL, SSPL, BUSL, or other commercial-restrictive licenses were detected.

---

## Verdict

**PASS.** All 1034 declared and transitive dependencies are compatible with commercial distribution on iOS App Store and Google Play Store.

### Recommended mitigations (low effort, high good-faith value)

1. **MPL notice:** Add `lightningcss` to the app's in-app open-source license list when built.
2. **node-forge:** Document the BSD-3-Clause election in a package-level comment (or pin via `pnpm.overrides`).
3. **Deprecated subdeps:** Schedule a `pnpm update` pass for M1 housekeeping.

---

## Audit trace

- Audit command: `pnpm licenses list` (all packages, production + dev)
- Resolved packages: 1034
- Scan date: 2026-05-07
- Branch: `feat/aaas-152-dependency-license-audit`
