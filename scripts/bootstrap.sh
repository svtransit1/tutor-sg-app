#!/usr/bin/env bash
set -euo pipefail

echo "==> Bootstrapping tutor-sg monorepo..."
echo ""

# Check prerequisites
command -v pnpm >/dev/null 2>&1 || {
  echo "ERROR: pnpm is not installed. Install it first: https://pnpm.io/installation"
  exit 1
}

echo "pnpm version: $(pnpm --version)"
echo ""

echo "==> Installing dependencies..."
pnpm install

echo ""
echo "==> Bootstrap complete!"
echo "   Run 'pnpm dev' to start the Expo dev server."
echo "   Run 'pnpm dev:ios' for iOS Simulator."
echo "   Run 'pnpm dev:android' for Android emulator."
