# tutor-sg — CI Secrets

> **Full secrets reference:** [`docs/SECRETS.md`](../docs/SECRETS.md) — includes EAS Build, GitHub Actions, rotation policy, incident response, and adding new variables.

---

## Quick reference

### Public variables (set as GitHub Actions secrets)

| Variable | Example value | Purpose |
|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | `development` | App environment for CI runs |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `<anon-key>` | Supabase anon/public key |
| `EXPO_PUBLIC_CDN_BASE_URL` | `https://cdn.example.com/models/` | Model download CDN base |

### Build-time secrets (EAS Secrets, never in CI)

| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase admin operations |
| `HITPAY_SECRET_KEY` | HitPay secret API key |
| `HITPAY_WEBHOOK_SECRET` | HitPay webhook verification secret |
| `IOS_APP_STORE_CONNECT_API_KEY` | Automated App Store submission |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore credential for Android builds |

---

## Setting GitHub Actions secrets

1. Go to **Settings → Secrets and variables → Actions** in the repository.
2. Click **New repository secret** and add each variable from the public table above.
3. In CI workflow files (`.github/workflows/`), reference them as `${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}`.

## Where to get values

| Service | How to obtain |
|---|---|
| Supabase project | [supabase.com](https://supabase.com) — create project → Settings → API |
| HitPay keys | [hitpay.app](https://www.hitpayapp.com) — Dashboard → API Keys |
| Cloudflare R2 CDN | [Cloudflare Dashboard](https://dash.cloudflare.com) — R2 → bucket settings |

## Secrets manager

All production secrets are stored in **1Password** (AaaS vault). Access is managed by the CTO (Owl). For onboarding, request access via the CTO.

## Adding a new CI secret

1. Add the variable to `docs/SECRETS.md` and this file.
2. Add the value to 1Password.
3. Create the GitHub Actions secret via Settings.
4. Create the EAS secret: `eas secret:create --scope project --name YOUR_VAR --value "<value>"`.
5. Reference the variable in the CI workflow file.
