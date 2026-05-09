/**
 * Statistical utilities for benchmark analysis.
 */

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
}

export function p50(values: number[]): number {
  return percentile(
    [...values].sort((a, b) => a - b),
    50,
  );
}

export function p75(values: number[]): number {
  return percentile(
    [...values].sort((a, b) => a - b),
    75,
  );
}

export function p95(values: number[]): number {
  return percentile(
    [...values].sort((a, b) => a - b),
    95,
  );
}

export function p99(values: number[]): number {
  return percentile(
    [...values].sort((a, b) => a - b),
    99,
  );
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function min(values: number[]): number {
  return values.length > 0 ? Math.min(...values) : 0;
}

export function max(values: number[]): number {
  return values.length > 0 ? Math.max(...values) : 0;
}
