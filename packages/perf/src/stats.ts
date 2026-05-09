/**
 * Statistics computation utilities for latency measurement.
 * Computes P50, P95, P99, mean, stddev, min, max from raw observations.
 */

import type { LatencyStats } from './types';

export function computeLatencyStats(durations: number[]): LatencyStats {
  if (durations.length === 0) {
    throw new Error('Cannot compute statistics from empty dataset');
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const n = sorted.length;

  const minMs = sorted[0] as number;
  const maxMs = sorted[n - 1] as number;
  const meanMs = durations.reduce((a, b) => a + b, 0) / n;

  const variance =
    durations.reduce((acc, val) => acc + (val - meanMs) ** 2, 0) / n;
  const stdDevMs = Math.sqrt(variance);

  const p50Ms = percentile(sorted, 50);
  const p95Ms = percentile(sorted, 95);
  const p99Ms = percentile(sorted, 99);

  return {
    count: n,
    minMs,
    maxMs,
    meanMs,
    p50Ms,
    p95Ms,
    p99Ms,
    stdDevMs,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0] as number;

  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);

  if (lo === hi) return sorted[lo] as number;

  const frac = idx - lo;
  return (sorted[lo] as number) + frac * ((sorted[hi] as number) - (sorted[lo] as number));
}
