# tutor-sg — Secrets Management

> **Related:** `.env.example` (variable reference), `packages/shared/src/config/env.ts` (Zod schema), `mobile/app.config.ts` (Expo config mapping)

---

## 1. Overview

tutor-sg uses two tiers of environment variables:

| Tier | Prefix | When injected | Example | Safety |
|---|---|---|---|---|
| **Public** | `EXPO_PUBLIC_*` | Bundled into client binary at build time | `EXPO_PUBLIC_SUPABASE_URL` | Safe — designed to be visible on device |
| **Secret** | (none) | Injected by EAS Build / CI at build or deploy time | `SUPABASE_SERVICE_ROLE_KEY` | **Never in source, never in `.env.local`** |

**Hard rule:** Never prefix a real secret value with `EXPO_PUBLIC_`. Doing so embeds it in the app binary where any user can extract it.

---

## 2. Local development

### 2.1 Setup

```bash
cp .env.example .env.local
# Then edit .env.local with real values
```

Expo CLI automatically loads `.env.local` (and `.env`) from the project root. No additional plugins are needed.

### 2.2 What goes in `.env.local`

Only `EXPO_PUBLIC_*` variables needed for local development:

```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_SUPABASE_URL=https://<your-dev-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-dev-anon-key>
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.example.com/models/
EXPO_PUBLIC_HITPAY_API_KEY=<your-dev-public-key>
EXPO_PUBLIC_ENABLE_DEV_TOOLS=true
```

### 2.3 What NEVER goes in `.env.local`

- `SUPABASE_SERVICE_ROLE_KEY` — service_role key for admin operations
- `HITPAY_SECRET_KEY` — HitPay secret API key
- `HITPAY_WEBHOOK_SECRET` — HitPay webhook verification secret
- Any API key that grants admin / write access

If you need these for local testing of server-side code, use a separate `.env.secrets` file and **add it to `.gitignore`**. Better yet, use a local Supabase instance with ephemeral keys.

### 2.4 `.gitignore` protection

The root `.gitignore` already contains:

```gitignore
.env
.env.*
!.env.example
```

This ensures no `.env.*` file (except `.env.example`) can be accidentally committed.

---

## 3. EAS Build secrets

EAS Build injects secrets into `process.env` at build time. They are **not** bundled into the client binary unless exposed via `EXPO_PUBLIC_*`.

### 3.1 Prerequisites

- Expo account with access to the `tutor-sg` project
- [EAS CLI](https://docs.expo.dev/eas-update/getting-started/#prerequisites) installed (`npm install -g eas-cli`)
- Logged in: `eas whoami` (or `eas login`)

### 3.2 View existing secrets

```bash
eas secret:list --scope project
```

### 3.3 Create individual secrets

```bash
# Public vars (safe to bundle)
eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://<project>.supabase.co"

eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "<anon-key>"

eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_CDN_BASE_URL \
  --value "https://cdn.tutor-sg.com/models/"

eas secret:create \
  --scope project \
  --name EXPO_PUBLIC_HITPAY_API_KEY \
  --value "<hitpay-public-key>"

# Secrets (build-time only — NOT in client binary)
eas secret:create \
  --scope project \
  --name SUPABASE_SERVICE_ROLE_KEY \
  --value "<service-role-key>"

eas secret:create \
  --scope project \
  --name HITPAY_SECRET_KEY \
  --value "<hitpay-secret-key>"

eas secret:create \
  --scope project \
  --name HITPAY_WEBHOOK_SECRET \
  --value "<webhook-secret>"
```

### 3.4 Bulk import from file

To avoid interactive prompts for each secret, create a secrets file and pipe it:

```bash
# secrets.list — THIS FILE MUST NEVER BE COMMITTED
# Format: NAME=VALUE  (one per line, no spaces around =)
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.tutor-sg.com/models/
EXPO_PUBLIC_HITPAY_API_KEY=<hitpay-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
HITPAY_SECRET_KEY=<hitpay-secret-key>
HITPAY_WEBHOOK_SECRET=<webhook-secret>
```

```bash
# Import all at once
while IFS='=' read -r name value; do
  [[ -z "$name" || "$name" =~ ^# ]] && continue
  echo "$value" | eas secret:create --scope project --name "$name" --value "@-"
done < secrets.list
```

> **⚠️ Security:** Delete `secrets.list` immediately after import. Never commit it.

### 3.5 Update or delete a secret

```bash
eas secret:delete --scope project --name SUPABASE_SERVICE_ROLE_KEY
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value "<new-key>"
```

### 3.6 Environment-specific secrets (EAS Profiles)

If you use different EAS build profiles (`development`, `preview`, `production`), you can scope secrets per environment:

```bash
eas secret:create \
  --scope project \
  --environment production \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://<prod-project>.supabase.co"

eas secret:create \
  --scope project \
  --environment development \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://<dev-project>.supabase.co"
```

Secrets without `--environment` apply to all environments. Profile-specific secrets override the global ones at build time.

---

## 4. GitHub Actions secrets

### 4.1 CI secrets

For CI workflows (lint, test, typecheck), set these in the repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add the following repository secrets:

| Secret name | Value |
|---|---|
| `EXPO_PUBLIC_APP_ENV` | `development` (or `test`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Test Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Test Supabase anon key |
| `EXPO_PUBLIC_CDN_BASE_URL` | Test CDN URL |

These are used by workflows defined in `.github/workflows/`.

### 4.2 EAS Submit secrets

For automated app store submissions (`eas submit`), the following secrets are needed:

```bash
# iOS App Store Connect API Key (for EAS Submit)
eas secret:create --scope project --name IOS_APP_STORE_CONNECT_API_KEY --value "$(cat AuthKey_XXXXXX.p8)"

# Android keystore credentials
eas secret:create --scope project --name ANDROID_KEYSTORE_PASSWORD --value "<keystore-password>"
```

> **Note:** EAS manages Android keystores automatically for new projects (`eas build --platform android` creates one). If you bring your own keystore, set `ANDROID_KEYSTORE_PASSWORD` and `ANDROID_KEY_PASSWORD` as EAS secrets.

---

## 5. Adding a new environment variable

### 5.1 Public variable (appears in client binary)

1. Add the Zod entry in `packages/shared/src/config/env.ts` in the `envSchema` object.
2. Add the `getEnv()` mapping in `mobile/app.config.ts` under the `extra` section.
3. Add documentation in `.env.example` with the `EXPO_PUBLIC_` prefix.
4. Add a default value in the Zod schema so the app doesn't crash if unset.
5. Add a test case in `packages/shared/src/config/__tests__/env.test.ts`.
6. If the variable is required for production (no safe default), add it to `validateEnv()` in `env.ts`.
7. Create the EAS secret: `eas secret:create --scope project --name EXPO_PUBLIC_YOUR_VAR --value "<value>"`.
8. If needed in CI, add it to GitHub Actions secrets.

### 5.2 Secret variable (build-time only)

1. Document it in the secrets table of `.env.example` (under the `🔒 SECRETS` section).
2. Add documentation in this file (`docs/SECRETS.md`) under the relevant platform.
3. Create the EAS secret with its **unprefixed** name: `eas secret:create --scope project --name YOUR_SECRET --value "<value>"`.
4. If it must be injected into `mobile/app.config.ts` (for build plugins, etc.), add it there — **but never expose it in the `extra` section** (that bundles it into the client). Only reference it for build-time purposes.

### 5.3 Checklist

| Step | File / Action |
|---|---|
| ✅ Schema | `packages/shared/src/config/env.ts` |
| ✅ Expo config | `mobile/app.config.ts` |
| ✅ Docs | `.env.example` |
| ✅ Tests | `packages/shared/src/config/__tests__/env.test.ts` |
| ✅ Validation | `validateEnv()` in `env.ts` (if required) |
| ✅ EAS secret | `eas secret:create ...` |
| ✅ CI secret | GitHub Actions settings (if needed) |

---

## 6. Secret rotation policy

| Secret | Rotation frequency | Trigger |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Every 90 days or on team member offboarding | Calendar reminder |
| `HITPAY_SECRET_KEY` | Every 180 days | Calendar reminder |
| `HITPAY_WEBHOOK_SECRET` | On webhook endpoint change | Infrequent |
| `IOS_APP_STORE_CONNECT_API_KEY` | Yearly (or on revocation) | Apple Developer expiry |
| `ANDROID_KEYSTORE_PASSWORD` | Only on compromise | Incident |

### Rotation procedure

1. Generate new value in the respective dashboard (Supabase, HitPay, Apple Developer, etc.)
2. Update each platform that uses the secret:
   - EAS: `eas secret:delete ... && eas secret:create ...`
   - GitHub Actions: Settings → Secrets → Update
3. Verify the new secret in a build/CI run
4. Revoke the old secret after confirming the new one works

---

## 7. Security notes

### 7.1 Audit

To list all EAS secrets and verify none are inadvertently exposed:

```bash
eas secret:list --scope project
```

Check that no `EXPO_PUBLIC_` secret contains a sensitive value (service key, admin token, etc.).

### 7.2 Incident response

If a secret is accidentally committed:

1. **Immediately** rotate the compromised secret at the source.
2. Use `git filter-branch` or `git rebase` to purge the secret from history.
3. Force-push the cleaned branch (coordinate with the team).
4. Verify the leaked secret is no longer valid in the provider dashboard.
5. File an incident report in `docs/lessons/`.

### 7.3 Principle of least privilege

- Use separate Supabase projects for development, staging, and production.
- `SUPABASE_SERVICE_ROLE_KEY` from the dev project is equivalent to admin access for that project — treat it with the same care as the production key.
- Prefer row-level security (RLS) and anon keys for client-side Supabase access rather than service role keys.
- HitPay test keys (`sandbox_*`) for development; production keys for release builds only.

---

## 8. Reference: All variables

### 8.1 Public (EXPO_PUBLIC_*)

| Variable | Zod default | Purpose |
|---|---|---|
| `APP_ENV` | `development` | App environment (`development`, `staging`, `production`) |
| `CDN_BASE_URL` | `https://cdn.example.com/models/` | Model download base URL |
| `MODEL_INDEX_PATH` | `index.json` | Model manifest filename |
| `SUPABASE_URL` | `https://placeholder.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `placeholder-anon-key` | Supabase anon/public key |
| `HITPAY_API_KEY` | `placeholder-hitpay-public-key` | HitPay publishable key |
| `ENABLE_DEV_TOOLS` | `false` | Developer tools toggle |
| `LOG_LEVEL` | `info` | Logging verbosity |

### 8.2 Secrets (no prefix)

| Variable | Used by | Purpose |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | EAS Build | Server-side Supabase admin operations |
| `HITPAY_SECRET_KEY` | Server / webhook | HitPay secret API key |
| `HITPAY_WEBHOOK_SECRET` | Server / webhook | HitPay webhook signature verification |
| `IOS_APP_STORE_CONNECT_API_KEY` | EAS Submit | Automated App Store submission |
| `ANDROID_KEYSTORE_PASSWORD` | EAS Build | Keystore credential for Android builds |

---

## 9. Troubleshooting

### "Module env.ts is using placeholder values"

Run `validateEnv()` at app startup. If it returns errors, configure the required variables:

```bash
# For local development
cp .env.example .env.local
# Edit .env.local with real values
```

### "EAS build fails with missing secret"

1. Check the build logs for the specific variable name.
2. Verify the secret exists: `eas secret:list --scope project`.
3. Check that the secret name matches exactly (case-sensitive).
4. If using environment-specific profiles, ensure the secret is created for the correct environment.

### "GitHub CI fails with missing env var"

1. Check that the repository has the secret: **Settings → Secrets and variables → Actions**.
2. Verify the workflow file references it correctly with `${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}`.
3. For PRs from forks, secrets are not available by default — check the "Allow secrets" workflow setting.

### "Secret accidentally exposed in logs"

1. Rotate the secret immediately at the provider.
2. Check CI logs, build logs, and crash logs for the value.
3. If the value appeared in `process.env` in a client bundle, treat it as fully compromised.
