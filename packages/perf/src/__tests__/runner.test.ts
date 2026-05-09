import { describe, it, expect } from 'vitest';
import type { PerfSession } from '../types';
import { runBenchmarks, computeMetric } from '../runner';

function makeSessions(
  scenario: 'cold-start' | 'photo-to-first-token',
  durationsMs: number[],
): PerfSession[] {
  return durationsMs.map((d, i) => ({
    id: `run-${i}`,
    scenario,
    platform: 'ios',
    deviceTier: 'high',
    marks:
      scenario === 'cold-start'
        ? [
            { name: 'js_module_load', timestampMs: 0 },
            { name: 'first_interactive_frame', timestampMs: d },
          ]
        : [
            { name: 'capture_end', timestampMs: 100 },
            { name: 'first_llm_token', timestampMs: 100 + d },
          ],
    startedAt: new Date().toISOString(),
  }));
}

describe('runner', () => {
  it('computeMetric returns metric for cold-start', () => {
    const sessions = makeSessions('cold-start', [500, 1000, 1500, 2000, 2500]);
    const m = computeMetric('cold-start', sessions, 'high');
    expect(m).not.toBeNull();
    expect(m!.scenario).toBe('cold-start');
    expect(m!.count).toBe(5);
    expect(m!.p95).toBeGreaterThan(0);
    expect(m!.targetMs).toBe(3000);
  });

  it('computeMetric returns metric for photo-to-first-token', () => {
    const sessions = makeSessions('photo-to-first-token', [2000, 3500, 5000, 6500, 8000]);
    const m = computeMetric('photo-to-first-token', sessions, 'high');
    expect(m).not.toBeNull();
    expect(m!.scenario).toBe('photo-to-first-token');
    expect(m!.count).toBe(5);
  });

  it('PASSes when P95 is below target', () => {
    const sessions = makeSessions('cold-start', [500, 700, 800, 900, 1000]);
    const m = computeMetric('cold-start', sessions, 'high');
    expect(m!.passed).toBe(true);
  });

  it('FAILs when P95 is above target', () => {
    const sessions = makeSessions('cold-start', [2500, 2800, 3100, 3200, 3500]);
    const m = computeMetric('cold-start', sessions, 'high');
    expect(m!.passed).toBe(false);
  });

  it('respects device tier targets', () => {
    // low tier cold-start target is 5000ms
    const sessions = makeSessions('cold-start', [3000, 3500, 4000, 4200, 4500]);
    const mHigh = computeMetric('cold-start', sessions, 'high');
    const mLow = computeMetric('cold-start', sessions, 'low');
    expect(mHigh!.passed).toBe(false); // high target is 3000ms
    expect(mLow!.passed).toBe(true); // low target is 5000ms
  });

  it('runBenchmarks returns summary', () => {
    const coldStart = makeSessions('cold-start', [500, 700, 900]);
    const photoFtT = makeSessions('photo-to-first-token', [2000, 3500, 6000]);
    const all = [...coldStart, ...photoFtT];

    const { metrics, summary } = runBenchmarks(all, 'ios', 'high');
    expect(metrics).toHaveLength(2);
    expect(summary.total).toBe(2);
    expect(typeof summary.passed).toBe('number');
    expect(typeof summary.failed).toBe('number');
  });

  it('returns null for empty session sets', () => {
    const m = computeMetric('cold-start', [], 'high');
    expect(m).toBeNull();
  });

  it('returns null when required marks are missing', () => {
    const session: PerfSession = {
      id: 'bad',
      scenario: 'photo-to-first-token',
      platform: 'ios',
      deviceTier: 'high',
      marks: [{ name: 'capture_end', timestampMs: 100 }],
      startedAt: new Date().toISOString(),
    };
    const m = computeMetric('photo-to-first-token', [session], 'high');
    expect(m).toBeNull();
  });
});
