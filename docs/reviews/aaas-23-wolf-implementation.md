# AAAS-23 Implementation — EAS build profile (iOS internal)

**Agent:** Wolf
**Commit:** f170af3
**Branch:** feat/aaas-20-pnpm-workspace-audit
**Status:** in_review (awaiting Owl review)

## What changed

1. **`mobile/eas.json`** (new) — `internal` profile with `distribution=internal`, `simulator=false` for iOS, plus `development`, `preview`, `production` profiles.
2. **`mobile/package.json`** — wired `eas:build:ios:internal`, `eas:build:android:internal`, preview, and production scripts.
3. **`README.md`** — added EAS Build profiles table, documented bundle ID (`com.aaas.tutorsg`), flagged Apple Developer account dependency.

## Acceptance checklist

- [x] `eas.json` `build.internal.ios` profile defined (distribution=internal, simulator=false)
- [x] Bundle ID placeholder documented in README
- [x] `pnpm eas:build:ios:internal` script wired in mobile/package.json
- [x] Apple-account dependency documented

## Boss-needed follow-up (Foxy to create)

AAAS-25: Apple Developer Program account setup ($99/year) — enrollment, `eas credentials` config, provisioning profile. Blocks all iOS EAS Build distribution and M7 TestFlight prep.

## Verification

- JSON validated for both eas.json and package.json
- Branch on feature branch, not main
- No secrets committed

## Next action

Owl reviews and approves/rejects. After approval, AAAS-24 (Android paired profile) can proceed.
