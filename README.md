# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

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

---

## pnpm workspaces (installing from root only)

This repo uses **pnpm workspaces** to manage the multi-package monorepo.

| Package         | Path                | `name`             |
|-----------------|---------------------|--------------------|
| Mobile app      | `mobile/`            | `tutor-sg-mobile`  |
| Shared library  | `packages/shared/`   | `@tutor-sg/shared` |

**Rule:** Always run `pnpm install` (or `pnpm install --frozen-lockfile`) from the **repo root**.

```bash
# ✅ Correct — from repo root
cd /path/to/tutor-sg-app
pnpm install

# ❌ Wrong — never from inside a sub-package
cd mobile && pnpm install    # breaks the lockfile
cd packages/shared && pnpm install   # breaks the lockfile
```

Why:
- Only the root `pnpm-lock.yaml` is authoritative.
- Installing from inside a sub-package generates a stray `package-lock.json` / `pnpm-lock.yaml` and may resolve differently.
- CI uses `pnpm install --frozen-lockfile` — any drift fails the build.

If you accidentally ran `npm install` or `pnpm install` inside a sub-package, delete the stray lockfile and reinstall from root:

```bash
# Clean up stray lockfiles
find . -name 'package-lock.json' -not -path './node_modules/*' -delete

# Reinstall from root
cd /path/to/tutor-sg-app
pnpm install
```

### Lockfile guard

Every CI run includes a `lockfile-guard` job that:
1. Runs `pnpm install --frozen-lockfile`.
2. Checks `git diff --exit-code pnpm-lock.yaml`.

If the lockfile drifts from `package.json` changes, the build fails immediately.

---

## EAS Build (internal distribution)

The project uses Expo Application Services (EAS) for cloud builds. The `internal` profile produces ad-hoc builds suitable for TestFlight-precursor testing.

### Build profiles (eas.json)

| Profile | Distribution | Use case |
|---------|-------------|----------|
| `development` | internal | Dev client with hot reload |
| `internal` | internal | Ad-hoc / TestFlight precursor |
| `preview` | internal | Pre-release testing |
| `production` | store | App Store / Play Store release |

### iOS internal build

```bash
pnpm --filter mobile eas:build:ios:internal
# or directly:
cd mobile && eas build --platform ios --profile internal
```

**Bundle ID:** `com.aaas.tutorsg` (placeholder — confirm with Apple Developer account).

### Prerequisites

- Apple Developer Program membership ($99/year) for iOS internal distribution.
- `eas-cli` installed: `npm install -g eas-cli`
- Run `eas login` and `eas build:configure` in `mobile/` on first use.

Until an Apple Developer account is set up, the build scripts serve as stubs that will fail with an auth error — file a `boss-needed` issue to provision the Apple account.

---

## Launch assets (icon + splash)

Placeholder launch assets live in `mobile/assets/`:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024x1024 | App Store icon |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon foreground |
| `splash.png` | variable | Launch screen splash |

These are neutral placeholders with the working name `tutor-sg` — **NOT final art**. Final brand artwork is tracked under M2/Flutter design work.
