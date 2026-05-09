import { describe, it, expect } from 'vitest';
import { p50, p75, p95, p99, mean, stddev, min, max } from '../statistics';

describe('statistics', () => {
  const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  it('p50 returns median', () => {
    expect(p50(values)).toBeCloseTo(550, 0);
  });

  it('p75 returns 75th percentile', () => {
    expect(p75(values)).toBeCloseTo(775, 0);
  });

  it('p95 returns 95th percentile', () => {
    expect(p95(values)).toBeCloseTo(955, 0);
  });

  it('p99 returns 99th percentile', () => {
    expect(p99(values)).toBeCloseTo(991, 0);
  });

  it('mean returns arithmetic mean', () => {
    expect(mean(values)).toBe(550);
  });

  it('stddev returns population stddev', () => {
    expect(stddev(values)).toBeCloseTo(302.77, 1);
  });

  it('min returns minimum', () => {
    expect(min(values)).toBe(100);
  });

  it('max returns maximum', () => {
    expect(max(values)).toBe(1000);
  });

  it('handles empty arrays', () => {
    expect(p50([])).toBe(0);
    expect(mean([])).toBe(0);
    expect(stddev([])).toBe(0);
    expect(min([])).toBe(0);
    expect(max([])).toBe(0);
  });

  it('handles single-element arrays', () => {
    expect(p50([42])).toBe(42);
    expect(mean([42])).toBe(42);
    expect(stddev([42])).toBe(0);
  });
});
