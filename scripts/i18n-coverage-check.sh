#!/usr/bin/env bash
# i18n coverage check — delegates to Python script
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
exec python3 scripts/i18n-coverage-check.py "$@"
