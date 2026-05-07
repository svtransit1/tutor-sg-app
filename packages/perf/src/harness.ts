/**
 * Camera→LLM P95 latency measurement harness.
 *
 * Runs the full pipeline N times with optional warmup, records per-stage
 * wall-clock timing, and produces a LatencyReport with P50/P95/P99 stats.
 *
 * Usage:
 *   const harness = new LatencyHarness({ iterations: 30, warmupIterations: 3 });
 *   const report = await harness.measure(pipelineStages, initialInput);
 *   console.log(`Total P95: ${report.total.p95Ms}ms`);
 *   console.log(`Stage P95: ${report.stages[0].stats.p95Ms}ms`);
 */

import type {
  HarnessConfig,
  LatencyReport,
  PipelineRunTiming,
  PipelineStage,
  StageLatencyReport,
  StageTiming,
} from './types';
import { computeLatencyStats } from './stats';

export class LatencyHarness {
  private readonly config: Required<HarnessConfig>;

  constructor(config: HarnessConfig) {
    this.config = {
      iterations: config.iterations,
      deviceTier: config.deviceTier,
      warmupIterations: config.warmupIterations ?? 0,
      interIterationDelayMs: config.interIterationDelayMs ?? 0,
    };
  }

  /**
   * Run the pipeline measurement.
   *
   * @param stages - Ordered array of pipeline stages to execute.
   * @param initialInput - Input for the first stage.
   * @returns Complete LatencyReport.
   */
  async measure<TIn, TOut>(
    stages: PipelineStage<TIn, TOut>[],
    initialInput: TIn,
  ): Promise<LatencyReport> {
    const allRuns: PipelineRunTiming[] = [];
    const totalRunDurations: number[] = [];
    const stageDurations: Map<string, number[]> = new Map();

    // Collect stage names for later aggregation
    for (const stage of stages) {
      stageDurations.set(stage.name, []);
    }

    const totalIterations =
      this.config.iterations + this.config.warmupIterations;

    for (let i = 0; i < totalIterations; i++) {
      const isWarmup = i < this.config.warmupIterations;

      // Wait between iterations (but not before the first or after the last)
      if (i > 0 && this.config.interIterationDelayMs > 0) {
        await delay(this.config.interIterationDelayMs);
      }

      // Run the pipeline and time each stage
      const runTiming = await this.runSinglePass(stages, initialInput, i);

      // Skip warmup runs from aggregate stats
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

    // Build the report
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
      stages: stageReports,
      total: computeLatencyStats(totalRunDurations),
      rawRuns: allRuns,
    };
  }

  /**
   * Execute one full pipeline pass, timing each stage individually.
   */
  private async runSinglePass<TIn, TOut>(
    stages: PipelineStage<TIn, TOut>[],
    initialInput: TIn,
    runIndex: number,
  ): Promise<PipelineRunTiming> {
    const stageTimings: StageTiming[] = [];
    let currentInput: unknown = initialInput;

    for (const stage of stages) {
      const startTime = performance.now();
      const output = await stage.execute(
        currentInput as TIn,
        { runIndex },
      );
      const endTime = performance.now();

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

/**
 * Create a latency report in a condensed text format for quick inspection.
 */
export function formatReport(report: LatencyReport): string {
  const lines: string[] = [
    `# Camera→LLM Latency Report`,
    `Measured at: ${report.measuredAt}`,
    `Iterations:  ${report.iterations}`,
    report.deviceTier ? `Device tier: ${report.deviceTier}` : '',
    ``,
    `## Total pipeline`,
    `  P50:  ${report.total.p50Ms.toFixed(1)} ms  |  P95:  ${report.total.p95Ms.toFixed(1)} ms  |  P99:  ${report.total.p99Ms.toFixed(1)} ms`,
    `  Mean: ${report.total.meanMs.toFixed(1)} ms  |  Min:  ${report.total.minMs.toFixed(1)} ms  |  Max:  ${report.total.maxMs.toFixed(1)} ms`,
    `  σ:    ${report.total.stdDevMs.toFixed(1)} ms`,
    ``,
    `## Per-stage`,
    `| Stage | Count | Mean (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Min (ms) | Max (ms) |`,
    `|---|---|---|---|---|---|---|---|`,
  ];

  for (const stage of report.stages) {
    const s = stage.stats;
    const name = stage.stageName.padEnd(22);
    lines.push(
      `| ${name} | ${String(s.count).padStart(4)} | ${s.meanMs.toFixed(1).padStart(8)} | ${s.p50Ms.toFixed(1).padStart(8)} | ${s.p95Ms.toFixed(1).padStart(8)} | ${s.p99Ms.toFixed(1).padStart(8)} | ${s.minMs.toFixed(1).padStart(7)} | ${s.maxMs.toFixed(1).padStart(7)} |`,
    );
  }

  lines.push(``);

  // Add pass/fail against ADD targets
  const highTarget = 8000; // 8 sec
  const lowTarget = 15000; // 15 sec

  if (report.deviceTier === 'high') {
    const pass = report.total.p95Ms < highTarget;
    lines.push(
      `**ADD §3.5 high-tier target:** P95 < ${highTarget} ms → **${pass ? 'PASS ✅' : 'FAIL ❌'}** (actual: ${report.total.p95Ms.toFixed(0)} ms)`,
    );
  } else if (report.deviceTier === 'mid') {
    const pass = report.total.p95Ms < lowTarget;
    lines.push(
      `**ADD §3.5 mid/low-tier target:** P95 < ${lowTarget} ms → **${pass ? 'PASS ✅' : 'FAIL ❌'}** (actual: ${report.total.p95Ms.toFixed(0)} ms)`,
    );
  }

  return lines.filter((l) => l !== '' || lines.indexOf(l) > 0).join('\n');
}

/** Promise-based delay. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Export a latency report as CSV with per-stage stats.
 * Column layout: stage, count, mean_ms, p50_ms, p95_ms, p99_ms, min_ms, max_ms, stddev_ms
 */
export function formatCSV(report: LatencyReport): string {
  const lines: string[] = [];
  lines.push('stage,count,mean_ms,p50_ms,p95_ms,p99_ms,min_ms,max_ms,stddev_ms');
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

/**
 * Export a latency report as raw per-run CSV for post-hoc analysis.
 * Each row is one stage invocation.
 */
export function formatRawCSV(report: LatencyReport): string {
  const lines: string[] = [];
  lines.push('run_index,stage,duration_ms');
  for (const run of report.rawRuns) {
    for (const stage of run.stages) {
      lines.push(`${run.runIndex},${stage.stageName},${stage.durationMs.toFixed(2)}`);
    }
  }
  return lines.join('\n');
}
