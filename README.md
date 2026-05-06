# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

---

---

## EAS Build & Submit

We use Expo Application Services (EAS) for CI builds and store submission.

### Prerequisites

Before your first EAS build or submit, configure:

1. **EAS project** — run `eas init` in `mobile/` to create the EAS project and get `EAS_PROJECT_ID`
2. **Secrets** — set via `eas secret:create` (see `.env.example` for all required secrets)
3. **App Store Connect** — register the app (`com.aaas.tutorsg`) and note the numeric `ascAppId`
4. **Google Play Console** — create a service account JSON key for API access

### Build profiles (`mobile/eas.json` — `build` section)

| Profile | iOS distribution | Android distribution | Purpose |
|---|---|---|---|
| `development` | internal (dev client) | internal (dev client) | Local dev with Expo dev client |
| `internal` | internal (ad-hoc) | internal (signed) | TestFlight / Play Internal testing |
| `preview` | internal | internal | Quick preview builds |
| `production` | store | store | Production-ready build (auto-increment) |

**Scripts:**
- `npm run eas:build:ios:internal` — iOS internal build
- `npm run eas:build:android:internal` — Android internal build
- `npm run eas:build:all` — Both platforms

### Submit profiles (`mobile/eas.json` — `submit` section)

| Profile | iOS target | Android target | Purpose |
|---|---|---|---|
| `production` | App Store (live) | Production track (100% rollout) | Public release |
| `beta` | TestFlight | Internal testing track | Pre-release testing |

Both profiles use:
- iOS: Apple ID + app-specific password (switch to ASC API Key for CI)
- Android: Service account JSON key

**Scripts:**
- `npm run eas:submit:ios` — Submit iOS to App Store (production)
- `npm run eas:submit:android` — Submit Android to Play Store (production)
- `npm run eas:submit:all` — Submit both platforms
- `npm run eas:submit:ios:beta` — Submit iOS to TestFlight
- `npm run eas:submit:android:beta` — Submit Android to internal testing

### Version management

- App version string is managed by EAS (`appVersionSource: "remote"`)
- Build numbers auto-increment via `autoIncrement: true` in production build profiles
- For manual version bumps: update `version` in `mobile/app.json` before a production build

### First-time submission checklist

1. [ ] **`EAS_PROJECT_ID`** — set via `eas project:init` in `mobile/`
2. [ ] **`ASC_APPLE_ID`** — replace placeholder in `mobile/eas.json` with real App Store Connect numeric ID
3. [ ] **Apple secrets** — `eas secret:create EAS_APPLE_ID`, `EAS_APPLE_APP_SPECIFIC_PASSWORD`, `EAS_APPLE_TEAM_ID`
4. [ ] **Android secret** — `eas secret:create EAS_ANDROID_SERVICE_ACCOUNT_KEY_PATH`
5. [ ] **Test build** — run `npm run eas:build:ios:internal` and `npm run eas:build:android:internal` first
6. [ ] **Beta test** — run `npm run eas:submit:ios:beta` and `npm run eas:submit:android:beta` before production
7. [ ] **Store metadata** — screenshots, descriptions, keywords (see App Store Connect + Play Console)

### Changelog

Before each submission, add a release entry to `CHANGELOG.md`:

```markdown
## [0.2.0] — 2026-05-07

### Added
- ...

### Fixed
- ...
```

Pass the changelog text via EAS CLI when submitting:
```bash
eas submit --platform ios --profile production --message "Bug fixes and performance improvements"
```

---

## Model integrity hashes

The app verifies downloaded model artifacts against SHA-256 checksums in `packages/shared/src/models/integrity.json`.

### Refresh hashes (new quant or model variant)

1. Place the `.gguf` or `.mlx` files in a directory:
   ```bash
   mkdir -p /tmp/model-staging
   cp path/to/new-model.gguf /tmp/model-staging/
   ```

2. Run the hash computation script:
   ```bash
   npx tsx scripts/compute-model-hashes.ts /tmp/model-staging
   ```
   This prints a JSON manifest with `sha256` and `sizeBytes` for each file.

3. Update `packages/shared/src/models/integrity.json` — either manually or with `--json`:
   ```bash
   npx tsx scripts/compute-model-hashes.ts /tmp/model-staging --json
   ```
   This overwrites the integrity manifest. **Review the diff before committing.**

4. Commit the updated `integrity.json`. The app uses these hashes to verify downloads on first launch.

### Placeholder hashes

Until real model files are hosted on a CDN, `integrity.json` ships with all-zero `sha256` placeholders. The download verifier must treat these as "unverified" and skip hash checks in dev/staging builds.
