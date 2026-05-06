# .gitignore Audit — 2026-05-07

**Issue:** AAAS-211 (M0-34: Monorepo .gitignore audit)
**Auditor:** 🐝 Bee (Mobile Coder #2)
**Status:** ✅ Complete — 6 gaps found and fixed

---

## Scope

Audit the root `.gitignore` in `/Users/muatan/tutor-sg-app` for:
1. Secret leaks (credentials, API keys, private keys)
2. Build artifacts that could bloat the repo
3. Generated/dev files that should never be committed
4. Model weight files (child-safe + CDN-delivered)

---

## What was checked

- All tracked files (`git ls-files`) — scanned for credential patterns
- Git-ignored files (`git ls-files --others --ignored`) — verified existing rules work
- CI workflow (`ci.yml`) for build output directories
- `tsconfig.json` files for generated type references
- Package manager lock files and cache directories
- All subdirectories: `mobile/`, `web/`, `packages/*`, `docs/`, `scripts/`, `schema/`, `data/`, `syllabus-pdfs/`

---

## Findings

### ✅ Already well-covered (no changes needed)

| Pattern | Coverage |
|---|---|
| `.env`, `.env.*`, `!.env.example` | Environment secrets |
| `*.pem`, `*.p12`, `*.keystore` | Cryptographic key files |
| `.DS_Store`, `Thumbs.db` | OS metadata |
| `.vscode/`, `.idea/`, `*.swp` | Editor/IDE files |
| `node_modules/`, `**/Pods/`, `.gradle/` | Dependencies |
| `build/`, `dist/` | General build outputs |
| `*.ipa`, `*.apk`, `*.aab`, `*.app` | Platform binaries |
| `**/models/`, `*.tflite`, `*.litertlm`, `*.gguf` | ML model weights (with `packages/shared/src/models/` exception for `*.json` manifests) |
| `coverage/`, `.nyc_output/` | Test coverage reports |
| `private/`, `sample-data/`, `*.heic` | Child data safety |

### ❌ Gaps found (all fixed)

| # | Pattern | Why needed | Fixed? |
|---|---|---|---|
| 1 | `.expo/` | Expo CLI development state — bundles, types, manifest | ✅ Added |
| 2 | `expo-env.d.ts` | Expo auto-generated type declarations | ✅ Added |
| 3 | `dist-*/` | CI generates `dist-ios/` and `dist-android/` via `expo export` — plain `dist/` doesn't catch these | ✅ Added |
| 4 | `*.tsbuildinfo` | TypeScript incremental compilation artifacts | ✅ Added |
| 5 | `.eslintcache` | ESLint cache file (contains absolute paths) | ✅ Added |
| 6 | `*.log` | Package manager debug logs (`npm-debug.log*`, etc.) | ✅ Added |

### 🔒 Secret scan result

**No secrets found in tracked files.** Scanned for: private keys (`-----BEGIN ... PRIVATE KEY-----`), GitHub tokens (`ghp_`, `gho_`), Slack tokens (`xox[a-z]-`), OpenAI keys (`sk-...`). All clean.

---

## Verification

All new patterns tested with `git check-ignore`:

```bash
.expo/ → matches .expo/manifest.json, mobile/.expo/types/router.d.ts
expo-env.d.ts → matches expo-env.d.ts
dist-*/ → matches dist-ios/bundle.js, dist-android/some-file.js
*.tsbuildinfo → matches index.tsbuildinfo
.eslintcache → matches .eslintcache
*.log → matches npm-debug.log

# Existing tracked files NOT affected (git check-ignore on git ls-files = empty)
# Model exception still works: integrity.json tracked, model.gguf ignored
```

---

## Next actions

None. Audit is complete and all gaps are patched. The `.gitignore` is now monorepo‑ready for:
- Local Expo development (`.expo/`, `expo-env.d.ts`)
- CI build pipelines (`dist-*/`)
- TypeScript monorepo tooling (`*.tsbuildinfo`)
- ESLint caching (`.eslintcache`)
- Debug logs (`*.log`)
