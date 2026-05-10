# Node.js Version Pin

- **Date:** 2026-05-09
- **Decision:** Pin Node.js to 25.9.0 via `.nvmrc`, `.node-version`, and `package.json` `engines` field
- **Context:** Team consistency — all devs must use the same Node.js version
- **Files created:**
  - `.nvmrc` — nvm/fnm compatible
  - `.node-version` — nodenv compatible
  - `mobile/package.json` — added `engines.node >=25.9.0` and `engines.pnpm >=10.33.0`
  - `mobile/package.json` — added `packageManager: pnpm@10.33.0`
- **Rationale:** Current dev environment runs Node 25.9.0. Pin matches reality. pnpm 10.33.0 installed, lockfile v9.
- **CI alignment:** `.github/workflows/ci.yml` env vars updated to `NODE_VERSION: '25.9.0'` / `PNPM_VERSION: '10.33.0'` (commit `6b5b7cdfd`)
- **Status:** Implemented on `feat/aaas-839-nvmrc-node-version`
