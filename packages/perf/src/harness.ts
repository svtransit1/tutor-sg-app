import type {
  HarnessConfig,
  LatencyReport,
  PipelineRunTiming,
  PipelineStage,
  StageLatencyReport,
  StageTiming,
  DeviceSpec,
} from './types';
import { computeLatencyStats } from './stats';

export class LatencyHarness {
  private readonly config: {
    readonly iterations: number;
    readonly deviceTier?: 'high' | 'mid' | 'low';
    readonly deviceSpec?: DeviceSpec;
    readonly warmupIterations: number;
    readonly interIterationDelayMs: number;
  };

  constructor(config: HarnessConfig) {
    this.config = {
      iterations: config.iterations,
      deviceTier: config.deviceTier,
      deviceSpec: config.deviceSpec,
      warmupIterations: config.warmupIterations ?? 0,
      interIterationDelayMs: config.interIterationDelayMs ?? 0,
    };
  }

  async measure<TIn, TOut>(
    stages: PipelineStage<TIn, TOut>[],
    initialInput: TIn,
  ): Promise<LatencyReport> {
    const allRuns: PipelineRunTiming[] = [];
    const totalRunDurations: number[] = [];
    const stageDurations: Map<string, number[]> = new Map();

    for (const stage of stages) {
      stageDurations.set(stage.name, []);
    }

    const totalIterations =
      this.config.iterations + this.config.warmupIterations;

    for (let runIndex = 0; runIndex < totalIterations; runIndex++) {
      const isWarmup = runIndex < this.config.warmupIterations;

      if (runIndex > 0 && this.config.interIterationDelayMs > 0) {
        await delay(this.config.interIterationDelayMs);
      }

      const runTiming = await this.runSinglePass(
        stages,
        initialInput,
        runIndex,
      );

      if (!isWarmup) {
        allRuns.push(runTiming);
        totalRunDurations.push(runTiming.totalMs);
        for (const stageTiming of runTiming.stages) {
          const existing = stageDurations.get(stageTiming.stageName);
          if (existing) {
            existing.push(stageTiming.durationMs);
          }
        }
      }
    }

    const stageReports: StageLatencyReport[] = stages.map((stage) => {
      const durations = stageDurations.get(stage.name) ?? [];
      return {
        stageName: stage.name,
        description: stage.description ?? stage.name,
        stats: computeLatencyStats(durations),
      };
    });

    return {
      measuredAt: new Date().toISOString(),
      iterations: this.config.iterations,
      deviceTier: this.config.deviceTier,
      deviceSpec: this.config.deviceSpec,
      stages: stageReports,
      total: computeLatencyStats(totalRunDurations),
      rawRuns: allRuns,
    };
  }

  private async runSinglePass<TIn, TOut>(
    stages: PipelineStage<TIn, TOut>[],
    initialInput: TIn,
    runIndex: number,
  ): Promise<PipelineRunTiming> {
    const stageTimings: StageTiming[] = [];
    let currentInput: unknown = initialInput;

    for (const stage of stages) {
      const startTime = Date.now();
      const output = await stage.execute(currentInput as TIn, { runIndex });
      const endTime = Date.now();

      stageTimings.push({
        stageName: stage.name,
        startTime,
        durationMs: endTime - startTime,
      });

      currentInput = output;
    }

    const totalMs = stageTimings.reduce(
      (sum, s) => sum + s.durationMs,
      0,
    );

    return { runIndex, stages: stageTimings, totalMs };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatReport(report: LatencyReport): string {
  const specLine = report.deviceSpec
    ? `${report.deviceSpec.platform} / ${report.deviceSpec.modelName} / ${report.deviceSpec.ramGB}GB RAM / ${report.deviceSpec.npuName}`
    : '';

  const lines: string[] = [
    '# Camera→LLM Latency Report',
    `Measured at: ${report.measuredAt}`,
    `Iterations:  ${report.iterations}`,
    report.deviceTier ? `Device tier: ${report.deviceTier}` : '',
    specLine ? `Device spec: ${specLine}` : '',
    '',
    '## Total pipeline',
    `  P50:  ${report.total.p50Ms.toFixed(1)} ms  |  P95:  ${report.total.p95Ms.toFixed(1)} ms  |  P99:  ${report.total.p99Ms.toFixed(1)} ms`,
    `  Mean: ${report.total.meanMs.toFixed(1)} ms  |  Min:  ${report.total.minMs.toFixed(1)} ms  |  Max:  ${report.total.maxMs.toFixed(1)} ms`,
    `  σ:    ${report.total.stdDevMs.toFixed(1)} ms`,
    '',
    '## Per-stage',
    '| Stage | Count | Mean (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Min (ms) | Max (ms) |',
    '|---|---|---|---|---|---|---|---|',
  ];

  for (const stage of report.stages) {
    const s = stage.stats;
    const name = stage.stageName.padEnd(22);
    lines.push(
      `| ${name} | ${String(s.count).padStart(4)} | ${s.meanMs.toFixed(1).padStart(8)} | ${s.p50Ms.toFixed(1).padStart(8)} | ${s.p95Ms.toFixed(1).padStart(8)} | ${s.p99Ms.toFixed(1).padStart(8)} | ${s.minMs.toFixed(1).padStart(7)} | ${s.maxMs.toFixed(1).padStart(7)} |`,
    );
  }

  lines.push('');

  const highTarget = 8000;
  const midTarget = 12000;
  const lowTarget = 15000;

  if (report.deviceTier === 'high') {
    const pass = report.total.p95Ms < highTarget;
    lines.push(
      `**ADD §3.5 high-tier target:** P95 < ${highTarget} ms → **${pass ? 'PASS ✅' : 'FAIL ❌'}** (actual: ${report.total.p95Ms.toFixed(0)} ms)`,
    );
  } else if (report.deviceTier === 'mid') {
    const pass = report.total.p95Ms < midTarget;
    lines.push(
      `**ADD §3.5 mid-tier target:** P95 < ${midTarget} ms → **${pass ? 'PASS ✅' : 'FAIL ❌'}** (actual: ${report.total.p95Ms.toFixed(0)} ms)`,
    );
  } else if (report.deviceTier === 'low') {
    const pass = report.total.p95Ms < lowTarget;
    lines.push(
      `**ADD §3.5 low-tier target:** P95 < ${lowTarget} ms → **${pass ? 'PASS ✅' : 'FAIL ❌'}** (actual: ${report.total.p95Ms.toFixed(0)} ms)`,
    );
  }

  return lines
    .filter((line, idx) => line !== '' || idx === 0 || lines[idx - 1] !== '')
    .join('\n');
}

export function formatCSV(report: LatencyReport): string {
  const lines: string[] = [];
  lines.push(
    'stage,count,mean_ms,p50_ms,p95_ms,p99_ms,min_ms,max_ms,stddev_ms',
  );
  for (const stage of report.stages) {
    const s = stage.stats;
    lines.push(
      `${stage.stageName},${s.count},${s.meanMs.toFixed(2)},${s.p50Ms.toFixed(2)},${s.p95Ms.toFixed(2)},${s.p99Ms.toFixed(2)},${s.minMs.toFixed(2)},${s.maxMs.toFixed(2)},${s.stdDevMs.toFixed(2)}`,
    );
  }
  lines.push(
    `total,${report.total.count},${report.total.meanMs.toFixed(2)},${report.total.p50Ms.toFixed(2)},${report.total.p95Ms.toFixed(2)},${report.total.p99Ms.toFixed(2)},${report.total.minMs.toFixed(2)},${report.total.maxMs.toFixed(2)},${report.total.stdDevMs.toFixed(2)}`,
  );
  return lines.join('\n');
}

export function formatRawCSV(report: LatencyReport): string {
  const lines: string[] = [];
  lines.push('run_index,stage,duration_ms');
  for (const run of report.rawRuns) {
    for (const stage of run.stages) {
      lines.push(
        `${run.runIndex},${stage.stageName},${stage.durationMs.toFixed(2)}`,
      );
    }
  }
  return lines.join('\n');
}
