# tutor-sg

Singapore primary school AI tutor — on-device LLM, EN + Simplified Chinese, P1–P6, all 4 core subjects.

**Owner:** Agent as a Service Pte. Ltd.
**Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
**Authoritative spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
**Framework:** React Native + Expo + TypeScript (single codebase, iOS + Android)

Do not commit secrets, child data, or model weights. See `.gitignore`.

---

## Quick start

```bash
git clone git@github.com:aaas-pte-ltd/tutor-sg-app.git
cd tutor-sg-app
npm install
```

## Environment config

1. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` — all keys are documented in `.env.example`.

3. The config module (`@tutor-sg/shared/config`) validates required vars at startup.
   See `packages/shared/src/config/env.ts` for the full Zod schema.

4. Build-time secrets are managed via EAS Secrets / GitHub Actions Secrets.
   See [`docs/SECRETS.md`](docs/SECRETS.md) for step-by-step setup.

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
