#!/usr/bin/env npx tsx
/**
 * tutor-sg Performance Benchmark CLI
 *
 * Reads one or more JSON session files (each file = array of PerfSession)
 * and produces a benchmark report with P95 pass/fail against ADD targets.
 *
 * Usage:
 *   npx tsx scripts/bench.ts --input sessions.json --platform ios --tier high
 *   npx tsx scripts/bench.ts --input batch1.json batch2.json --platform android --tier mid
 *   npx tsx scripts/bench.ts --input sessions.json --platform ios --tier high --json
 *
 * Input JSON format:
 *   Array of PerfSession objects (see src/types.ts).
 *
 * ADD targets:
 *   cold-start           P95 < 3s  (mid/high), < 5s  (low)
 *   photo-to-first-token P95 < 8s  (high),    < 15s (low)
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PerfSession } from '../src/types';
import { runBenchmarks } from '../src/runner';
import { createReport, formatReport, emitReportJson } from '../src/reporter';

function parseArgs(argv: string[]) {
  const args: Record<string, string[]> = {};
  let current: string | null = null;
  for (const a of argv.slice(2)) {
    if (a.startsWith('--')) {
      current = a.slice(2);
      args[current] = [];
    } else if (current) {
      args[current].push(a);
    }
  }
  return args;
}

function printUsage() {
  console.log(`
Usage: npx tsx scripts/bench.ts [options]

Options:
  --input <file...>     JSON file(s) containing PerfSession arrays (required)
  --platform <name>     Platform label: ios, android (default: unknown)
  --tier <tier>         Device tier: high, mid, low (default: mid)
  --json                Output JSON instead of human-readable report
  --help                Show this help

Input JSON files should contain a JSON array of PerfSession objects.
Sessions without the required marks are silently skipped.
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.input || args.input.length === 0) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const platform = args.platform?.[0] ?? 'unknown';
  const deviceTier = args.tier?.[0] ?? 'mid';
  const emitJson = args.json !== undefined;

  // Read all session files
  const sessions: PerfSession[] = [];
  for (const file of args.input) {
    const absPath = path.resolve(file);
    if (!fs.existsSync(absPath)) {
      console.error(`File not found: ${absPath}`);
      process.exit(1);
    }
    try {
      const raw = fs.readFileSync(absPath, 'utf-8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        console.error(`${file}: expected a JSON array of PerfSession objects`);
        process.exit(1);
      }
      sessions.push(...data);
    } catch (err) {
      console.error(`Failed to read ${file}: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  }

  if (sessions.length === 0) {
    console.error('No valid sessions found in input files.');
    process.exit(1);
  }

  const { metrics, summary } = runBenchmarks(sessions, platform, deviceTier);

  if (metrics.length === 0) {
    console.error('No benchmarkable sessions found. Ensure sessions include required marks.');
    console.error('Cold-start needs: js_module_load, first_interactive_frame');
    console.error('Photo-to-first-token needs: capture_end, first_llm_token');
    process.exit(1);
  }

  const report = createReport(platform, deviceTier, metrics, summary);

  if (emitJson) {
    emitReportJson(report);
  } else {
    console.log(formatReport(report));
  }

  // Exit with non-zero if any metric failed
  process.exit(summary.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(2);
});
