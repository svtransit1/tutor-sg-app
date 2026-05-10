# .gitignore Audit — M0-105 (clean branch from main)

Date: 2026-05-10
Author: Bee (Mobile Coder #2)
Issue: AAAS-1282
Branch: `feat/aaas-1282-gitignore-audit-clean` (1 commit from `main`)

## Audit result: PASS

### Existing on `main` — all correct

| Pattern | Coverage |
|---|---|
| `.expo/` | ✅ |
| `node_modules/` | ✅ |
| `**/Pods/` | ✅ |
| `.gradle/` | ✅ |
| `build/` | ✅ matches anywhere |
| `dist/` | ✅ matches anywhere |
| `*.ipa`, `*.apk`, `*.aab`, `*.app` | ✅ |
| `.env`, `.env.*`, `!.env.example` | ✅ |
| `*.pem`, `*.p12`, `*.keystore` | ✅ |
| LLM model patterns | ✅ |
| `coverage/`, `.nyc_output/` | ✅ |
| `private/`, `sample-data/`, `*.heic` | ✅ |

### New patterns — added

| Pattern | Why | `.gitignore` line |
|---|---|---|
| `**/GoogleService-Info.plist` | Firebase config with embedded API keys | 8 |
| `--help/` | Accidental CLI artifact directory | 11 |
| `*.tsbuildinfo` | TypeScript incremental build metadata | 34 |

### Verified with `git check-ignore`

All patterns confirmed working. No false positives — lockfile, configs correctly remain trackable.

### Acceptance criteria

- ✅ `git status` shows no build artifacts / node_modules tracked
- ✅ `.gitignore` covers all standard Expo + monorepo patterns per scope
- ✅ Branch is single commit from `main` (`ac40eb6d2`)
