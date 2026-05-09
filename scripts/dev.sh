#!/usr/bin/env bash
set -euo pipefail

echo "==> tutor-sg dev launch"
echo ""

echo "==> Installing dependencies (if needed)..."
pnpm install
echo ""

cleanup() {
  echo ""
  echo "==> Shutting down services..."
  kill $TSC_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "==> Starting TypeScript watch (all packages)..."
pnpm typecheck:watch &
TSC_PID=$!

echo "==> Starting Expo dev server + Metro bundler..."
echo ""
pnpm mobile:start

cleanup
