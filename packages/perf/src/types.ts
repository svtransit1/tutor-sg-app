/**
 * Performance Benchmarking — core types.
 *
 * ADD §3.5 targets:
 *   photo-to-first-token P95 < 8s (high tier), < 15s (low tier)
 * ADD §9 Q6:
 *   cold start < 3s on mid-tier device
 */

export interface PerfMark {
  name: string;
  timestampMs: number;
  metadata?: Record<string, unknown>;
}

export interface PerfSession {
  /** UUID or run identifier */
  id: string;
  scenario: 'cold-start' | 'photo-to-first-token';
  platform: 'ios' | 'android' | 'unknown';
  deviceTier: 'high' | 'mid' | 'low' | 'unknown';
  marks: PerfMark[];
  startedAt: string;
}

export interface BenchmarkMetric {
  scenario: string;
  metric: string;
  valuesMs: number[];
  p50: number;
  p75: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  stddev: number;
  count: number;
  targetMs: number;
  passed: boolean;
}

export interface BenchReport {
  platform: string;
  deviceTier: string;
  generatedAt: string;
  metrics: BenchmarkMetric[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

export const ADD_TARGETS: Record<string, Record<string, number>> = {
  'cold-start': { high: 3000, mid: 3000, low: 5000 },
  'photo-to-first-token': { high: 8000, mid: 12000, low: 15000 },
};
