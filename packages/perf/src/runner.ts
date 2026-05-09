import type { PerfSession, BenchmarkMetric, PerfMark } from './types';
import { ADD_TARGETS } from './types';
import { p50, p75, p95, p99, mean, stddev, min, max } from './statistics';

/**
 * Derive the metric value in ms from a session's marks.
 *
 * Cold-start: mark "js_module_load" → "first_interactive_frame"
 * Photo-to-first-token: mark "capture_end" → "first_llm_token"
 */
function deriveMetric(session: PerfSession): number | null {
  if (session.scenario === 'cold-start') {
    const start = findMark(session.marks, 'js_module_load');
    const end = findMark(session.marks, 'first_interactive_frame');
    if (start && end) return end.timestampMs - start.timestampMs;
    return null;
  }

  if (session.scenario === 'photo-to-first-token') {
    const start = findMark(session.marks, 'capture_end');
    const end = findMark(session.marks, 'first_llm_token');
    if (start && end) return end.timestampMs - start.timestampMs;
    return null;
  }

  return null;
}

function findMark(marks: PerfMark[], name: string): PerfMark | undefined {
  return marks.find((m) => m.name === name);
}

/**
 * Compute benchmark metrics from collected sessions.
 */
export function computeMetric(
  scenario: 'cold-start' | 'photo-to-first-token',
  sessions: PerfSession[],
  deviceTier: string,
): BenchmarkMetric | null {
  const values: number[] = [];
  for (const s of sessions) {
    if (s.scenario !== scenario) continue;
    const v = deriveMetric(s);
    if (v !== null) values.push(v);
  }

  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const targetKey = deviceTier in ADD_TARGETS[scenario] ? deviceTier : 'mid';
  const targetMs = ADD_TARGETS[scenario][targetKey] ?? ADD_TARGETS[scenario].mid;

  return {
    scenario,
    metric: scenario === 'cold-start' ? 'cold-start (ms)' : 'photo-to-first-token (ms)',
    valuesMs: values,
    p50: p50(sorted),
    p75: p75(sorted),
    p95: p95(sorted),
    p99: p99(sorted),
    min: min(sorted),
    max: max(sorted),
    mean: mean(values),
    stddev: stddev(values),
    count: values.length,
    targetMs,
    passed: p95(sorted) <= targetMs,
  };
}

/**
 * Run benchmark analysis over collected sessions.
 * Returns a list of metrics and a summary.
 */
export function runBenchmarks(
  sessions: PerfSession[],
  platform: string,
  deviceTier: string,
): { metrics: BenchmarkMetric[]; summary: { total: number; passed: number; failed: number } } {
  const metrics: BenchmarkMetric[] = [];

  for (const scenario of ['cold-start', 'photo-to-first-token'] as const) {
    const m = computeMetric(scenario, sessions, deviceTier);
    if (m) metrics.push(m);
  }

  const summary = {
    total: metrics.length,
    passed: metrics.filter((m) => m.passed).length,
    failed: metrics.filter((m) => !m.passed).length,
  };

  return { metrics, summary };
}
