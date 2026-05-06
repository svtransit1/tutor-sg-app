/**
 * Statistics computation utilities for latency measurement.
 * Computes P50, P95, P99, mean, stddev, min, max from raw observations.
 */

import type { LatencyStats } from './types';

/**
 * Compute latency statistics from an array of duration observations.
 * Uses linear interpolation for percentile estimation (P50, P95, P99).
 *
 * @param durations - Array of duration values in milliseconds.
 * @returns Computed LatencyStats.
 * @throws If durations is empty.
 */
export function computeLatencyStats(durations: number[]): LatencyStats {
  if (durations.length === 0) {
    throw new Error('Cannot compute statistics from empty dataset');
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const n = sorted.length;
  const count = n;

  const minMs = sorted[0];
  const maxMs = sorted[n - 1];
  const meanMs = durations.reduce((a, b) => a + b, 0) / n;

  const variance =
    durations.reduce((acc, val) => acc + (val - meanMs) ** 2, 0) / n;
  const stdDevMs = Math.sqrt(variance);

  const p50Ms = percentile(sorted, 50);
  const p95Ms = percentile(sorted, 95);
  const p99Ms = percentile(sorted, 99);

  return { count, minMs, maxMs, meanMs, p50Ms, p95Ms, p99Ms, stdDevMs };
}

/**
 * Compute an approximate percentile from a sorted array.
 * Uses linear interpolation between the floor and ceiling indices.
 *
 * @param sorted - Sorted ascending array of values.
 * @param percentile - Desired percentile (0–100).
 * @returns Interpolated value at the given percentile.
 */
function percentile(sorted: number[], percentile: number): number {
  if (sorted.length === 1) return sorted[0];

  const idx = (percentile / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);

  if (lo === hi) return sorted[lo];

  const frac = idx - lo;
  return sorted[lo] + frac * (sorted[hi] - sorted[lo]);
}
