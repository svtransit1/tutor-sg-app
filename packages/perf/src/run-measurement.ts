/**
 * Standalone camera→LLM latency measurement script.
 *
 * Runs the simulated pipeline and outputs report + CSV to stdout.
 * Designed to be run on-device via `npx expo run:ios` or in CI.
 *
 * Usage:
 *   npx tsx packages/perf/src/run-measurement.ts             # defaults: high tier, 10 iterations
 *   npx tsx packages/perf/src/run-measurement.ts --tier mid  # mid tier
 *   npx tsx packages/perf/src/run-measurement.ts --iter 30   # 30 iterations
 *   npx tsx packages/perf/src/run-measurement.ts --tier high --iter 30 --csv --warmup 3
 *
 * Outputs:
 *   - Text report to stdout (--no-csv) or CSV to stdout (--csv)
 *   - Both formats to stdout (default)
 */

import { LatencyHarness, formatReport, formatCSV, formatRawCSV } from './harness';
import { createSimulatedPipeline } from './stages';

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const key = raw[i].replace(/^--/, '');
    if (key === 'csv' || key === 'raw-csv' || key === 'fast') {
      args[key] = 'true';
    } else if (i + 1 < raw.length && !raw[i + 1].startsWith('--')) {
      args[key] = raw[i + 1];
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const tier = (args.tier as 'high' | 'mid') || 'high';
  const iterations = parseInt(args.iter || '10', 10);
  const warmup = parseInt(args.warmup || '2', 10);
  const interDelay = parseInt(args.delay || '200', 10);
  const outputCSV = args.csv === 'true';
  const outputRawCSV = args['raw-csv'] === 'true';
  const fastMode = args.fast === 'true';

  // Validate
  if (!['high', 'mid'].includes(tier)) {
    console.error(`Invalid tier "${tier}". Use "high" or "mid".`);
    process.exit(1);
  }
  if (iterations < 1 || iterations > 1000) {
    console.error('Iterations must be between 1 and 1000.');
    process.exit(1);
  }

  const pipeline = createSimulatedPipeline(tier, { fastMode });

  const harness = new LatencyHarness({
    iterations,
    warmupIterations: warmup,
    interIterationDelayMs: interDelay,
    deviceTier: tier,
  });

  console.error(
    `[perf] Running ${iterations} iterations (${warmup} warmup) on ${tier}-tier simulated pipeline...`,
  );

  const startTime = performance.now();
  const report = await harness.measure(pipeline, 'input-photo.jpg');
  const elapsed = performance.now() - startTime;

  console.error(
    `[perf] Done in ${(elapsed / 1000).toFixed(2)}s. P95: ${report.total.p95Ms.toFixed(0)} ms`,
  );

  // Determine output mode
  const both = !outputCSV && !outputRawCSV;

  if (both || outputCSV) {
    console.log('=== CSV (summary) ===');
    console.log(formatCSV(report));
  }

  if (both || outputRawCSV) {
    console.log('=== CSV (raw runs) ===');
    console.log(formatRawCSV(report));
  }

  if (both) {
    console.log('=== Report ===');
    console.log(formatReport(report));
  }
}

main().catch((err: unknown) => {
  console.error('[perf] Fatal error:', err);
  process.exit(1);
});
