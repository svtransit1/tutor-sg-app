# Android Keystore Strategy

**Date:** 2026-05-09
**Context:** AAAS-24 — EAS build profile — Android internal
**Status:** locked

## Decision

Use **EAS-managed keystore** for all Android builds. No custom keystore upload for internal distribution.

## Rationale

- EAS-managed keystores are encrypted and backed up by Expo
- No key management burden on the developer machine
- Same keystore persists across builds via EAS project ID
- For Play Store submission, EAS-managed is fully supported

## Local debug keystore

A debug keystore exists at `mobile/android/app/debug.keystore` for development builds run with `npx expo run:android`. This is NOT used by EAS builds. EAS generates or uses the project-managed keystore.

## Migration path to production

When ready for Play Store submission:

1. Ensure an EAS-managed keystore exists (first EAS build auto-creates one)
2. The `production` profile in `eas.json` will use the same EAS-managed keystore
3. If a custom keystore is required (e.g. migrating an existing app), store the `.jks` or `.keystore` in a secrets manager — never commit to the repo

## References

- [Expo docs: Keystores](https://docs.expo.dev/build-reference/keystores/)
- [Expo docs: App signing](https://docs.expo.dev/app-signing/local-credentials/)
