import { describe, it, expect } from 'vitest';
import type { BenchmarkMetric, BenchReport } from '../types';
import { formatReport, createReport } from '../reporter';

function makeMetric(
  scenario: 'cold-start' | 'photo-to-first-token',
  valuesMs: number[],
  passed: boolean,
): BenchmarkMetric {
  const sorted = [...valuesMs].sort((a, b) => a - b);
  return {
    scenario,
    metric: scenario === 'cold-start' ? 'cold-start (ms)' : 'photo-to-first-token (ms)',
    valuesMs,
    p50: 500,
    p75: 700,
    p95: 900,
    p99: 950,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean: valuesMs.reduce((a, b) => a + b, 0) / valuesMs.length,
    stddev: 100,
    count: valuesMs.length,
    targetMs: scenario === 'cold-start' ? 3000 : 8000,
    passed,
  };
}

describe('reporter', () => {
  it('formatReport generates readable output', () => {
    const report: BenchReport = {
      platform: 'ios',
      deviceTier: 'high',
      generatedAt: '2025-05-10T00:00:00.000Z',
      metrics: [makeMetric('cold-start', [500, 700, 900], true)],
      summary: { total: 1, passed: 1, failed: 0 },
    };

    const output = formatReport(report);
    expect(output).toContain('tutor-sg Performance Benchmark Report');
    expect(output).toContain('Platform:    ios');
    expect(output).toContain('PASS');
    expect(output).toContain('All metrics within ADD targets');
  });

  it('formatReport shows FAIL for metrics over target', () => {
    const report: BenchReport = {
      platform: 'android',
      deviceTier: 'mid',
      generatedAt: '2025-05-10T00:00:00.000Z',
      metrics: [makeMetric('photo-to-first-token', [9000, 10000, 12000], false)],
      summary: { total: 1, passed: 0, failed: 1 },
    };

    const output = formatReport(report);
    expect(output).toContain('FAIL');
    expect(output).toContain('metric(s) FAILED');
  });

  it('createReport builds a valid report', () => {
    const m = makeMetric('cold-start', [500, 700, 900], true);
    const report = createReport('ios', 'high', [m], { total: 1, passed: 1, failed: 0 });
    expect(report.platform).toBe('ios');
    expect(report.deviceTier).toBe('high');
    expect(report.metrics).toHaveLength(1);
    expect(report.summary.total).toBe(1);
  });
});
