import { LatencyHarness, formatReport, formatCSV, formatRawCSV } from './harness';
import { createSimulatedPipeline } from './stages';
import type { DeviceSpec } from './types';

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const key = raw[i]!.replace(/^--/, '');
    if (key === 'csv' || key === 'raw-csv' || key === 'fast' || key === 'json') {
      args[key] = 'true';
    } else if (i + 1 < raw.length && !raw[i + 1]!.startsWith('--')) {
      args[key] = raw[i + 1]!;
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function detectDeviceSpec(args: Record<string, string>): DeviceSpec {
  return {
    platform: (args.platform as 'ios' | 'android') || 'unknown',
    ramGB: parseInt(args.ram || '0', 10) || 0,
    npuName: args.npu || 'unknown',
    modelName: args.model || 'unknown',
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const tier = (args.tier as 'high' | 'mid' | 'low') || 'high';
  const iterations = parseInt(args.iter || '10', 10);
  const warmup = parseInt(args.warmup || '2', 10);
  const interDelay = parseInt(args.delay || '200', 10);
  const outputCSV = args.csv === 'true';
  const outputRawCSV = args['raw-csv'] === 'true';
  const outputJSON = args.json === 'true';
  const fastMode = args.fast === 'true';

  if (!['high', 'mid', 'low'].includes(tier)) {
    process.stderr.write('Invalid tier "' + tier + '". Use "high", "mid", or "low".\n');
    process.exit(1);
  }
  if (iterations < 1 || iterations > 1000) {
    process.stderr.write('Iterations must be between 1 and 1000.\n');
    process.exit(1);
  }

  const deviceSpec = detectDeviceSpec(args);
  const pipeline = createSimulatedPipeline(tier, { fastMode });
  const harness = new LatencyHarness({
    iterations,
    warmupIterations: warmup,
    interIterationDelayMs: interDelay,
    deviceTier: tier,
    deviceSpec,
  });
  process.stderr.write(
    '[perf] Running ' + iterations + ' iterations (' + warmup + ' warmup) on ' + tier + '-tier simulated pipeline...\n',
  );
  const startTime = Date.now();
  const report = await harness.measure(pipeline, 'input-photo.jpg');
  const elapsed = Date.now() - startTime;
  process.stderr.write(
    '[perf] Done in ' + (elapsed / 1000).toFixed(2) + 's. P95: ' + report.total.p95Ms.toFixed(0) + ' ms\n',
  );

  if (outputJSON) {
    process.stdout.write(
      JSON.stringify(
        {
          generatedAt: report.measuredAt,
          deviceSpec,
          llmReport: report,
        },
        null,
        2,
      ) + '\n',
    );
  } else {
    const both = !outputCSV && !outputRawCSV;
    if (both || outputCSV) {
      process.stdout.write('=== CSV (summary) ===\n');
      process.stdout.write(formatCSV(report) + '\n');
    }
    if (both || outputRawCSV) {
      process.stdout.write('=== CSV (raw runs) ===\n');
      process.stdout.write(formatRawCSV(report) + '\n');
    }
    if (both) {
      process.stdout.write('=== Report ===\n');
      process.stdout.write(formatReport(report) + '\n');
    }
  }
}

main().catch((err: unknown) => {
  process.stderr.write('[perf] Fatal error: ' + String(err) + '\n');
  process.exit(1);
});
