/**
 * Tests for the camera→LLM P95 latency measurement harness.
 */

import {
  LatencyHarness,
  formatReport,
  formatCSV,
  formatRawCSV,
  computeLatencyStats,
} from '../index';
import { createSimulatedPipeline } from '../stages';
import {
  markColdStartLoad,
  markColdStartFirstFrame,
  markColdStartInteractive,
  getColdStartResult,
  resetColdStart,
} from '../cold-start';

function stage(name: string, ms: number, desc?: string) {
  return {
    name,
    description: desc ?? name,
    execute: jest.fn().mockImplementation(async (input: string) => {
      await d(ms);
      return input + ' → [' + name + ']';
    }),
  };
}
function d(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describe('computeLatencyStats', () => {
  it('computes basic stats', () => {
    const s = computeLatencyStats([100, 200, 300, 400, 500]);
    expect(s.count).toBe(5);
    expect(s.minMs).toBe(100);
    expect(s.maxMs).toBe(500);
    expect(s.meanMs).toBe(300);
  });
  it('computes P50 odd', () => {
    expect(computeLatencyStats([10, 20, 30, 40, 50]).p50Ms).toBe(30);
  });
  it('computes P50 even', () => {
    expect(computeLatencyStats([10, 20, 30, 40]).p50Ms).toBe(25);
  });
  it('computes P95', () => {
    const s = computeLatencyStats(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(s.p95Ms).toBeGreaterThan(18);
    expect(s.p95Ms).toBeLessThan(20);
  });
  it('computes P99', () => {
    const s = computeLatencyStats(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
    expect(s.p99Ms).toBeGreaterThan(98);
    expect(s.p99Ms).toBeLessThanOrEqual(100);
  });
  it('computes stddev', () => {
    const s = computeLatencyStats([10, 12, 23, 23, 16, 23, 21, 16]);
    expect(s.stdDevMs).toBeGreaterThan(4);
    expect(s.stdDevMs).toBeLessThan(6);
  });
  it('handles single element', () => {
    const s = computeLatencyStats([42]);
    expect(s.count).toBe(1);
    expect(s.p50Ms).toBe(42);
    expect(s.stdDevMs).toBe(0);
  });
  it('throws on empty', () => {
    expect(() => computeLatencyStats([])).toThrow('empty dataset');
  });
});

describe('LatencyHarness', () => {
  it('measures single stage', async () => {
    const s = stage('camera_capture', 50);
    const h = new LatencyHarness({ iterations: 3 });
    const r = await h.measure([s], 'start');
    expect(r.iterations).toBe(3);
    expect(r.stages).toHaveLength(1);
    expect(r.stages[0]!.stats.count).toBe(3);
    expect(r.rawRuns).toHaveLength(3);
  });
  it('measures pipeline', async () => {
    const stages = [
      stage('camera_capture', 20),
      stage('ocr', 50),
      stage('llm_inference', 100),
    ];
    const h = new LatencyHarness({ iterations: 5 });
    const r = await h.measure(stages, 'photo.jpg');
    expect(r.stages).toHaveLength(3);
    expect(r.stages[0]!.stats.count).toBe(5);
    expect(r.total.meanMs).toBeGreaterThanOrEqual(150);
  });
  it('passes input through stages', async () => {
    const s1 = stage('a', 10);
    const s2 = stage('b', 10);
    await new LatencyHarness({ iterations: 1 }).measure([s1, s2], 'input');
    expect(s1.execute).toHaveBeenCalledWith('input', expect.any(Object));
    expect(s2.execute).toHaveBeenCalledWith(
      'input → [a]',
      expect.any(Object),
    );
  });
  it('sets device tier', async () => {
    const r = await new LatencyHarness({
      iterations: 2,
      deviceTier: 'high',
    }).measure([stage('x', 10)], 'x');
    expect(r.deviceTier).toBe('high');
  });
  it('sets device spec', async () => {
    const spec = {
      platform: 'ios' as const,
      ramGB: 8,
      npuName: 'A16',
      modelName: 'iPhone 14 Pro',
    };
    const r = await new LatencyHarness({
      iterations: 1,
      deviceSpec: spec,
    }).measure([stage('x', 10)], 'x');
    expect(r.deviceSpec).toEqual(spec);
  });
  it('excludes warmup', async () => {
    const s = stage('t', 10);
    const r = await new LatencyHarness({
      iterations: 3,
      warmupIterations: 2,
    }).measure([s], 'x');
    expect(s.execute).toHaveBeenCalledTimes(5);
    expect(r.iterations).toBe(3);
    expect(r.rawRuns).toHaveLength(3);
  });
  it('enforces inter-iteration delay', async () => {
    const s = stage('slow', 5);
    const start = Date.now();
    await new LatencyHarness({
      iterations: 2,
      interIterationDelayMs: 50,
    }).measure([s], 'x');
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });
});

describe('simulated pipeline', () => {
  it('creates high-tier 5 stages', () => {
    const p = createSimulatedPipeline('high');
    expect(p).toHaveLength(5);
    expect(p[0]!.name).toBe('camera_capture');
  });
  it('creates mid-tier 5 stages', () => {
    expect(createSimulatedPipeline('mid')).toHaveLength(5);
  });
  it('creates low-tier 5 stages', () => {
    const p = createSimulatedPipeline('low');
    expect(p).toHaveLength(5);
    expect(p[0]!.name).toBe('camera_capture');
  });
  it('computes stats in fast mode', async () => {
    const r = await new LatencyHarness({ iterations: 5 }).measure(
      createSimulatedPipeline('high', { fastMode: true }),
      'x',
    );
    expect(r.stages).toHaveLength(5);
  });
  it('mid-tier works in fast mode', async () => {
    const r = await new LatencyHarness({ iterations: 30 }).measure(
      createSimulatedPipeline('mid', { fastMode: true }),
      'x',
    );
    expect(r.iterations).toBe(30);
    expect(r.total.count).toBe(30);
  });
  it('low-tier works in fast mode', async () => {
    const r = await new LatencyHarness({ iterations: 10 }).measure(
      createSimulatedPipeline('low', { fastMode: true }),
      'x',
    );
    expect(r.iterations).toBe(10);
    expect(r.total.count).toBe(10);
  });
});

describe('formatReport', () => {
  it('includes timestamp', async () => {
    const r = await new LatencyHarness({ iterations: 1 }).measure(
      [stage('t', 5)],
      'x',
    );
    expect(formatReport(r)).toContain('Measured at:');
  });
  it('includes P95/P50', async () => {
    const r = await new LatencyHarness({ iterations: 3 }).measure(
      [stage('t', 10)],
      'x',
    );
    const t = formatReport(r);
    expect(t).toContain('P50');
    expect(t).toContain('P95');
  });
  it('includes ADD when tier set', async () => {
    const r = await new LatencyHarness({
      iterations: 1,
      deviceTier: 'high',
    }).measure([stage('t', 5)], 'x');
    expect(formatReport(r)).toContain('ADD §3.5');
  });
  it('excludes ADD when no tier', async () => {
    const r = await new LatencyHarness({ iterations: 1 }).measure(
      [stage('t', 5)],
      'x',
    );
    expect(formatReport(r)).not.toContain('ADD §3.5');
  });
  it('includes device spec when set', async () => {
    const spec = {
      platform: 'android' as const,
      ramGB: 6,
      npuName: 'Tensor G3',
      modelName: 'Pixel 8',
    };
    const r = await new LatencyHarness({
      iterations: 1,
      deviceSpec: spec,
    }).measure([stage('t', 5)], 'x');
    expect(formatReport(r)).toContain('Pixel 8');
    expect(formatReport(r)).toContain('6GB RAM');
    expect(formatReport(r)).toContain('Tensor G3');
  });
  it('includes low-tier PASS/FAIL', async () => {
    const r = await new LatencyHarness({
      iterations: 1,
      deviceTier: 'low',
    }).measure([stage('t', 5)], 'x');
    expect(formatReport(r)).toContain('low-tier');
  });
});

describe('edge cases', () => {
  it('single iteration', async () => {
    const r = await new LatencyHarness({ iterations: 1 }).measure(
      [stage('s', 10)],
      'x',
    );
    expect(r.iterations).toBe(1);
    expect(r.rawRuns).toHaveLength(1);
  });
  it('zero inter-delay', async () => {
    const r = await new LatencyHarness({
      iterations: 3,
      interIterationDelayMs: 0,
    }).measure([stage('f', 1)], 'x');
    expect(r.iterations).toBe(3);
  });
  it('zero warmup', async () => {
    const r = await new LatencyHarness({
      iterations: 2,
      warmupIterations: 0,
    }).measure([stage('t', 5)], 'x');
    expect(r.iterations).toBe(2);
  });
});

describe('formatCSV', () => {
  it('has header and rows', async () => {
    const r = await new LatencyHarness({ iterations: 2 }).measure(
      [stage('t', 5)],
      'x',
    );
    const csv = formatCSV(r);
    const l = csv.split('\n');
    expect(l).toHaveLength(3);
    expect(l[0]).toContain('stage,count');
    expect(l[1]).toMatch(/^t,/);
    expect(l[2]).toMatch(/^total,/);
  });
});

describe('formatRawCSV', () => {
  it('outputs per-stage rows', async () => {
    const r = await new LatencyHarness({ iterations: 2 }).measure(
      [stage('ocr', 10), stage('llm', 20)],
      'x',
    );
    const csv = formatRawCSV(r);
    const l = csv.trim().split('\n');
    expect(l).toHaveLength(5);
    expect(l[0]).toBe('run_index,stage,duration_ms');
  });
});

describe('cold start', () => {
  beforeEach(() => resetColdStart());

  it('returns null before any marks', () => {
    expect(getColdStartResult()).toBeNull();
  });

  it('records first frame time relative to load', async () => {
    markColdStartLoad();
    await d(50);
    markColdStartFirstFrame();
    const r = getColdStartResult();
    expect(r).not.toBeNull();
    expect(r!.firstFrameMs).toBeGreaterThanOrEqual(45);
    expect(r!.firstFrameMs).toBeLessThan(100);
  });

  it('records interactive time relative to load', async () => {
    markColdStartLoad();
    await d(100);
    markColdStartInteractive();
    const r = getColdStartResult();
    expect(r!.interactiveMs).toBeGreaterThanOrEqual(95);
    expect(r!.interactiveMs).toBeLessThan(150);
  });

  it('returns 0 for unset timestamps', () => {
    markColdStartLoad();
    const r = getColdStartResult();
    expect(r!.loadTimeMs).toBe(0);
    expect(r!.firstFrameMs).toBe(0);
    expect(r!.interactiveMs).toBe(0);
  });

  it('reset clears all marks', () => {
    markColdStartLoad();
    markColdStartFirstFrame();
    resetColdStart();
    expect(getColdStartResult()).toBeNull();
  });
});
