import type { BenchReport, BenchmarkMetric } from './types';
import { ADD_TARGETS } from './types';
import { p50, p75, p95, p99, mean, stddev, min, max } from './statistics';

interface RepoOptions {
  color?: boolean;
}

const CHECK = 'PASS';
const CROSS = 'FAIL';

function fmtMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatReport(report: BenchReport, options: RepoOptions = {}): string {
  const { color = false } = options;
  const lines: string[] = [];

  lines.push(`========================================`);
  lines.push(`tutor-sg Performance Benchmark Report`);
  lines.push(`========================================`);
  lines.push(`Platform:    ${report.platform}`);
  lines.push(`Device Tier: ${report.deviceTier}`);
  lines.push(`Generated:   ${report.generatedAt}`);
  lines.push(``);

  for (const metric of report.metrics) {
    const status = metric.passed ? CHECK : CROSS;
    const target =
      ADD_TARGETS[metric.scenario]?.[report.deviceTier] ?? ADD_TARGETS[metric.scenario]?.mid ?? 0;

    lines.push(`---`);
    lines.push(`Metric: ${metric.metric}`);
    lines.push(`  Target:  P95 < ${fmtMs(target)}`);
    lines.push(`  Status:  ${status}`);
    lines.push(`  Samples: ${metric.count}`);
    lines.push(`  P50:     ${fmtMs(metric.p50)}`);
    lines.push(`  P75:     ${fmtMs(metric.p75)}`);
    lines.push(`  P95:     ${fmtMs(metric.p95)}`);
    lines.push(`  P99:     ${fmtMs(metric.p99)}`);
    lines.push(`  Min:     ${fmtMs(metric.min)}`);
    lines.push(`  Max:     ${fmtMs(metric.max)}`);
    lines.push(`  Mean:    ${fmtMs(metric.mean)}`);
    lines.push(`  StdDev:  ${fmtMs(metric.stddev)}`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`Summary: ${report.summary.passed}/${report.summary.total} passed`);
  if (report.summary.failed > 0) {
    lines.push(
      `*** ${report.summary.failed} metric(s) FAILED — see optimization candidates below ***`,
    );
    lines.push(``);
    for (const m of report.metrics.filter((x) => !x.passed)) {
      const overBy = m.p95 - m.targetMs;
      lines.push(
        `  - ${m.metric}: P95 ${fmtMs(m.p95)} exceeds target ${fmtMs(m.targetMs)} by ${fmtMs(overBy)}`,
      );
    }
  }

  if (report.summary.failed === 0) {
    lines.push(`All metrics within ADD targets.`);
  }

  return lines.join('\n');
}

export function emitReport(report: BenchReport): void {
  console.log(formatReport(report));
}

export function emitReportJson(report: BenchReport): void {
  console.log(JSON.stringify(report, null, 2));
}

export function createReport(
  platform: string,
  deviceTier: string,
  metrics: BenchmarkMetric[],
  summary: { total: number; passed: number; failed: number },
): BenchReport {
  return {
    platform,
    deviceTier,
    generatedAt: new Date().toISOString(),
    metrics,
    summary,
  };
}
