#!/usr/bin/env bash
# ci-e2e.sh — Run Maestro E2E flow with timing capture and 120s gate.
#
# Usage:
#   ./scripts/ci-e2e.sh [ios|android] [flow]
#
# Arguments:
#   flow    Which Maestro flow to run. Default: onboarding-to-feedback.yaml
#
# Output:
#   - Timing report written to e2e-timing-report-<platform>.json
#   - Exit code 1 if total time > 120s (MID_TIER_BUDGET_MS)
#
# Designed for CI but works locally too. Requires:
#   - maestro CLI installed
#   - A built dev client (expo run:ios or expo run:android)

set -euo pipefail

PLATFORM="${1:-android}"
FLOW="${2:-onboarding-to-feedback.yaml}"

# ── Configuration ──────────────────────────────────────────────────
MID_TIER_BUDGET_MS=120000  # 120 seconds — fail if exceeded
MAESTRO_FLOWS_DIR="mobile/.maestro/flows"
TIMING_REPORT="e2e-timing-report-${PLATFORM}.json"

# ── Validate ───────────────────────────────────────────────────────
if [[ ! -f "${MAESTRO_FLOWS_DIR}/${FLOW}" ]]; then
  echo "ERROR: Flow not found: ${MAESTRO_FLOWS_DIR}/${FLOW}"
  exit 1
fi

if ! command -v maestro &>/dev/null; then
  echo "ERROR: maestro CLI not found. Install: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

# ── Run with timing ───────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "  E2E: ${FLOW}"
echo "  Platform: ${PLATFORM}"
echo "  Budget: ${MID_TIER_BUDGET_MS}ms (${MID_TIER_BUDGET_MS}ms)"
echo "═══════════════════════════════════════════════════════"

START_NS=$(date +%s%N)
START_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Run Maestro with verbose output, capture to log for step parsing
MAESTRO_LOG="maestro-run-${PLATFORM}.log"
set +e
maestro test \
  "${MAESTRO_FLOWS_DIR}/${FLOW}" \
  --verbose \
  2>&1 | tee "${MAESTRO_LOG}"
MAESTRO_EXIT=$?
set -e

END_NS=$(date +%s%N)
END_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Calculate total elapsed in milliseconds
ELAPSED_MS=$(( (END_NS - START_NS) / 1000000 ))
ELAPSED_SEC=$(echo "scale=2; ${ELAPSED_MS} / 1000" | bc)

# ── Parse per-step timing from Maestro output ─────────────────────
# Maestro outputs lines like:
#   ✓ Step 1: launchApp (234ms)
#   ✓ Step 2: tapOn: "English" (156ms)
# We extract these into a JSON array.
STEPS_JSON="[]"
if grep -q '✓\|✗\|▶' "${MAESTRO_LOG}" 2>/dev/null; then
  # Extract step lines and format as JSON
  STEPS_JSON=$(grep -E '(✓|✗|▶)' "${MAESTRO_LOG}" \
    | sed 's/^[[:space:]]*//' \
    | jq -R -s '
      split("\n") | map(select(length > 0)) |
      map(
        capture("(?<status>[✓✗▶]) (?<step>.+?)(?: \\((?<ms>[0-9]+)ms\\))?$") |
        {
          status: (if .status == "✓" then "pass" elif .status == "✗" then "fail" else "info" end),
          name: .step,
          duration_ms: (.ms | tonumber? // 0)
        }
      )
    ' 2>/dev/null || echo '[]')
fi

# ── Determine pass/fail ───────────────────────────────────────────
if [[ ${MAESTRO_EXIT} -ne 0 ]]; then
  OVERALL_STATUS="failed"
  FAILURE_REASON="Maestro test exited with code ${MAESTRO_EXIT}"
elif [[ ${ELAPSED_MS} -gt ${MID_TIER_BUDGET_MS} ]]; then
  OVERALL_STATUS="failed"
  FAILURE_REASON="Total time ${ELAPSED_MS}ms exceeded budget ${MID_TIER_BUDGET_MS}ms"
else
  OVERALL_STATUS="passed"
  FAILURE_REASON=""
fi

# ── Write timing report ───────────────────────────────────────────
jq -n \
  --arg status "${OVERALL_STATUS}" \
  --arg platform "${PLATFORM}" \
  --arg flow "${FLOW}" \
  --arg start "${START_ISO}" \
  --arg end "${END_ISO}" \
  --argjson elapsed_ms "${ELAPSED_MS}" \
  --argjson budget_ms "${MID_TIER_BUDGET_MS}" \
  --argjson steps "${STEPS_JSON}" \
  --arg failure "${FAILURE_REASON}" \
  '{
    status: $status,
    platform: $platform,
    flow: $flow,
    start_time: $start,
    end_time: $end,
    total_elapsed_ms: $elapsed_ms,
    budget_ms: $budget_ms,
    over_budget: ($elapsed_ms > $budget_ms),
    steps: $steps,
    failure_reason: $failure
  }' > "${TIMING_REPORT}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Result: ${OVERALL_STATUS}"
echo "  Total: ${ELAPSED_SEC}s (${ELAPSED_MS}ms)"
echo "  Budget: ${MID_TIER_BUDGET_MS}ms"
echo "  Report: ${TIMING_REPORT}"
echo "═══════════════════════════════════════════════════════"

# ── Exit with appropriate code ─────────────────────────────────────
if [[ "${OVERALL_STATUS}" != "passed" ]]; then
  echo "FAIL: ${FAILURE_REASON}"
  exit 1
fi

echo "PASS: All steps completed within budget."
exit 0
