Review: APPROVED

## M0-74 — ESLint shared config for monorepo packages

**Owner:** Bee
**Branch:** feat/aaas-794-eslint-shared-config

### Changes

| File | Purpose |
|---|---|
| `packages/eslint-config/package.json` | Shared ESLint config package `@tutor-sg/eslint-config` |
| `packages/eslint-config/index.mjs` | Exports flat config: TS strict, test loose mode, Prettier compat |
| `package.json` | Root workspace: `lint`, `typecheck`, `test`, `format:*` scripts |
| `pnpm-workspace.yaml` | Defines workspace: `mobile/` + `packages/*` |
| `.npmrc` | pnpm strict mode + auto-install peers |
| `tsconfig.base.json` | Base TS config for packages (ES2022, strict, bundler resolution) |
| `eslint.config.js` | Root config — imports and re-exports `@tutor-sg/eslint-config` |
| `mobile/eslint.config.js` | Mobile config — extends shared + React/RN plugins |
| `mobile/package.json` | Added `@tutor-sg/eslint-config`, ESLint, React/RN plugin deps + `lint` script |
| `packages/shared/package.json` | Added `lint` script, ESLint deps |
| `packages/shared/eslint.config.js` | Extends shared config |

### Verification

- `pnpm install` — resolves all workspace projects
- `pnpm --filter @tutor-sg/shared lint` — 0 errors, 0 warnings

### Design decisions

1. **Flat config (eslint.config.js)** — ESLint v9 format, each package has its own config importing the shared package.
2. **React/RN rules in mobile only** — shared config stays generic (TS + Prettier). Mobile app adds `eslint-plugin-react`, `react-hooks`, `react-native`.
3. **Test/mock loose mode** — `__tests__/`, `__mocks__/`, `*.test.*` files get relaxed rules.

