#!/usr/bin/env bash
set -euo pipefail

# tutor-sg bootstrap — idempotent dev environment setup
# Safe to run multiple times. Run from repo root.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

say_ok()   { printf "${GREEN}✓${NC} %s\n" "$1"; }
say_warn() { printf "${YELLOW}!${NC} %s\n" "$1"; }
say_err()  { printf "${RED}✗${NC} %s\n" "$1"; }

# ── Node version ──────────────────────────────────────────────
REQUIRED_NODE_MAJOR=20

if ! command -v node &>/dev/null; then
  say_err "Node.js is not installed. Install Node >=${REQUIRED_NODE_MAJOR} (LTS): https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node -e 'console.log(process.versions.node.split(".")[0])')
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  say_err "Node $(node --version) is too old. Requires Node >=${REQUIRED_NODE_MAJOR} (LTS)."
  exit 1
fi
say_ok "Node $(node --version)"

# ── pnpm via corepack ────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  say_warn "pnpm not found — enabling via corepack"
  corepack enable
  # corepack prepare is needed on some Node versions to install pnpm
  corepack prepare pnpm@latest --activate 2>/dev/null || true
fi

PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "0")
PNPM_MAJOR=$(echo "$PNPM_VERSION" | cut -d. -f1)
if [ "$PNPM_MAJOR" -lt 9 ]; then
  say_warn "pnpm ${PNPM_VERSION} is too old — upgrading via corepack"
  corepack prepare pnpm@latest --activate
  # re-read after upgrade
  PNPM_VERSION=$(pnpm --version)
fi
say_ok "pnpm ${PNPM_VERSION}"

# ── Watchman (recommended for React Native) ──────────────────
if command -v watchman &>/dev/null; then
  say_ok "watchman $(watchman version 2>/dev/null || echo 'installed')"
else
  say_warn "watchman not found — recommended for React Native file watching"
  say_warn "  brew install watchman"
fi

# ── Install dependencies ──────────────────────────────────────
echo ""
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# ── Validate Expo CLI ────────────────────────────────────────
EXPO_BIN="./mobile/node_modules/.bin/expo"
if [ -x "$EXPO_BIN" ]; then
  EXPO_VERSION=$("$EXPO_BIN" --version 2>/dev/null)
  say_ok "expo-cli ${EXPO_VERSION}"
else
  say_err "expo-cli not found in mobile workspace — check pnpm install output above"
  exit 1
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Bootstrap complete. Start developing:"
echo ""
echo "    pnpm --filter mobile start     # Expo dev server"
echo "    pnpm --filter web dev          # Next.js dashboard"
echo ""
echo "  Run checks before pushing:"
echo "    pnpm typecheck  &&  pnpm lint  &&  pnpm test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
