/**
 * Standalone verification script for low-tier smoke test (AAAS-1073 / M2-131).
 * Run with: npx tsx packages/perf/src/__tests__/verify-low-tier.ts
 */

import { LatencyHarness, formatReport, formatCSV, formatRawCSV, computeLatencyStats } from '../index';
import { createSimulatedPipeline } from '../stages';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

async function run() {
  console.log('=== Low-Tier Smoke Test — AAAS-1073 / M2-131 ===\n');

  // ── 1. Pipeline structure ──
  console.log('LTSMOKE-01: Pipeline structure');
  {
    const pipeline = createSimulatedPipeline('low');
    assert(pipeline.length === 5, 'low-tier pipeline has 5 stages');
    assert(pipeline[0].name === 'camera_capture', 'stage 0 is camera_capture');
    assert(pipeline[1].name === 'ocr', 'stage 1 is ocr');
    assert(pipeline[2].name === 'question_segmentation', 'stage 2 is question_segmentation');
    assert(pipeline[3].name === 'llm_inference', 'stage 3 is llm_inference');
    assert(pipeline[4].name === 'response_rendering', 'stage 4 is response_rendering');

    for (const stage of pipeline) {
      assert(typeof stage.description === 'string' && stage.description.length > 10,
        `stage '${stage.name}' has a description`);
    }
  }

  // ── 2. Fast-mode measurement ──
  console.log('LTSMOKE-02: Fast-mode measurement');
  {
    const pipeline = createSimulatedPipeline('low', { fastMode: true });
    const harness = new LatencyHarness({ iterations: 20, deviceTier: 'low' });
    const report = await harness.measure(pipeline, 'photo.jpg');

    assert(report.iterations === 20, 'iterations match');
    assert(report.deviceTier === 'low', 'device tier is low');
    assert(report.stages.length === 5, '5 stages in report');
    assert(report.total.count === 20, 'total count is 20');
    assert(report.rawRuns.length === 20, '20 raw runs');

    for (const stage of report.stages) {
      assert(stage.stats.count === 20, `stage ${stage.stageName} has 20 samples`);
      assert(stage.stats.p95Ms >= stage.stats.p50Ms, `P95 >= P50 for ${stage.stageName}`);
      assert(stage.stats.p99Ms >= stage.stats.p95Ms, `P99 >= P95 for ${stage.stageName}`);
    }

    // Verify run-level consistency
    for (const run of report.rawRuns) {
      const computedTotal = run.stages.reduce((sum, s) => sum + s.durationMs, 0);
      assert(Math.abs(run.totalMs - computedTotal) < 1, 'run total matches stage sum');
    }
  }

  // ── 3. ADD §3.5 target validation ──
  console.log('LTSMOKE-03: ADD §3.5 target validation');
  {
    // Fast test: deterministic stages within budget
    const stages = [
      {
        name: 'camera_capture',
        execute: async (input: string) => { await delay(500); return `${input} → cam`; },
      },
      {
        name: 'ocr',
        execute: async (input: string) => { await delay(2000); return `${input} → ocr`; },
      },
      {
        name: 'question_segmentation',
        execute: async (input: string) => { await delay(400); return `${input} → seg`; },
      },
      {
        name: 'llm_inference',
        execute: async (input: string) => { await delay(7000); return `${input} → llm`; },
      },
      {
        name: 'response_rendering',
        execute: async (input: string) => { await delay(400); return `${input} → render`; },
      },
    ];

    const harness = new LatencyHarness({ iterations: 3, warmupIterations: 1, deviceTier: 'low' });
    const report = await harness.measure(stages, 'photo.jpg');

    // Total should be ~10.3s with small variance, well under 15s
    assert(report.total.p95Ms < 15000,
      `P95 ${report.total.p95Ms.toFixed(0)}ms < 15000ms (ADD §3.5 low-tier budget)`);
    assert(report.total.meanMs > 9000 && report.total.meanMs < 12000,
      `Mean ~10.3s (actual: ${report.total.meanMs.toFixed(0)}ms)`);

    // Test that an over-budget pipeline is correctly flagged as FAIL
    const slowStages = [
      { name: 'camera_capture', execute: async (input: string) => { await delay(1000); return input; } },
      { name: 'ocr', execute: async (input: string) => { await delay(4000); return input; } },
      { name: 'llm_inference', execute: async (input: string) => { await delay(12000); return input; } },
      { name: 'response_rendering', execute: async (input: string) => { await delay(1000); return input; } },
    ];
    const slowHarness = new LatencyHarness({ iterations: 1, deviceTier: 'low' });
    const slowReport = await slowHarness.measure(slowStages, 'x');
    assert(slowReport.total.p95Ms > 15000,
      `Over-budget pipeline correctly exceeds 15s (P95: ${slowReport.total.p95Ms.toFixed(0)}ms)`);
  }

  // ── 4. Report formatting ──
  console.log('LTSMOKE-04: Report formatting');
  {
    const stage = { name: 'test', execute: async (input: string) => input };
    const harness = new LatencyHarness({ iterations: 1, deviceTier: 'low' });
    const report = await harness.measure([stage], 'x');
    const text = formatReport(report);

    assert(text.includes('Device tier: low'), 'shows device tier');
    assert(text.includes('ADD'), 'shows ADD reference');
    assert(text.toLowerCase().includes('low-tier'), 'shows low-tier label');
    assert(text.includes('PASS'), 'low-tier within budget shows PASS');

    // Verify mid-tier label differs from low-tier
    const midHarness = new LatencyHarness({ iterations: 1, deviceTier: 'mid' });
    const midReport = await midHarness.measure([stage], 'x');
    const midText = formatReport(midReport);
    assert(midText.toLowerCase().includes('mid-tier'), 'mid-tier label distinct from low-tier');
  }

  // ── 5. CSV export ──
  console.log('LTSMOKE-05: CSV export');
  {
    const stage = { name: 'llm_inference', execute: async (input: string) => input };
    const harness = new LatencyHarness({ iterations: 3, deviceTier: 'low' });
    const report = await harness.measure([stage], 'x');

    const csv = formatCSV(report);
    const lines = csv.split('\n');
    assert(lines.length === 3, 'CSV has header + stage row + total row');
    assert(lines[0].includes('stage,count,mean_ms'), 'CSV has header');
    assert(lines[1].startsWith('llm_inference,'), 'stage row starts with name');
    assert(lines[2].startsWith('total,'), 'total row present');

    const totalCols = lines[2].split(',');
    assert(parseFloat(totalCols[3]) >= 0, 'P50 in CSV is valid');

    // Raw CSV
    const rawCsv = formatRawCSV(report);
    const rawLines = rawCsv.trim().split('\n');
    assert(rawLines.length === 4, 'raw CSV has header + 3 run rows');
    assert(rawLines[0] === 'run_index,stage,duration_ms', 'raw CSV header correct');
  }

  // ── 6. Edge cases ──
  console.log('LTSMOKE-06: Edge cases');
  {
    // Single iteration
    const stage = { name: 'camera_capture', execute: async (input: string) => input };
    const harness = new LatencyHarness({ iterations: 1, deviceTier: 'low' });
    const report = await harness.measure([stage], 'start');
    assert(report.iterations === 1, 'single iteration works');
    assert(report.stages[0].stats.p50Ms === report.stages[0].stats.p95Ms, 'P50==P95 for single');

    // Warmup exclusion
    let callCount = 0;
    const countingStage = {
      name: 'test',
      execute: async (input: string) => { callCount++; return input; },
    };
    const warmupHarness = new LatencyHarness({ iterations: 3, warmupIterations: 2, deviceTier: 'low' });
    const warmupReport = await warmupHarness.measure([countingStage], 'start');
    assert(callCount === 5, '5 total calls (2 warmup + 3 measured)');
    assert(warmupReport.stages[0].stats.count === 3, 'only 3 counted after warmup exclusion');

    // Inter-iteration delay
    const delayedStage = { name: 'test', execute: async (input: string) => { await delay(5); return input; } };
    const delayHarness = new LatencyHarness({ iterations: 2, interIterationDelayMs: 50, deviceTier: 'low' });
    const start = performance.now();
    await delayHarness.measure([delayedStage], 'start');
    const elapsed = performance.now() - start;
    assert(elapsed >= 50, `inter-iteration delay respected (elapsed: ${elapsed.toFixed(0)}ms >= 50ms)`);

    // ISO 8601 timestamp
    const date = new Date(report.measuredAt);
    assert(date.toISOString() === report.measuredAt, 'measuredAt is ISO 8601');

    // Empty dataset error
    try {
      computeLatencyStats([]);
      assert(false, 'should have thrown');
    } catch (e) {
      assert((e as Error).message.includes('empty dataset'), 'empty dataset throws');
    }
  }

  // ── 7. All three tiers comparison ──
  console.log('LTSMOKE-07: Tier comparison');
  {
    const high = createSimulatedPipeline('high', { fastMode: true });
    const mid = createSimulatedPipeline('mid', { fastMode: true });
    const low = createSimulatedPipeline('low', { fastMode: true });

    assert(high.length === 5, 'high tier has 5 stages');
    assert(mid.length === 5, 'mid tier has 5 stages');
    assert(low.length === 5, 'low tier has 5 stages');

    for (let i = 0; i < 5; i++) {
      assert(high[i].name === mid[i].name && mid[i].name === low[i].name,
        `all tiers have same stage name at index ${i}: ${high[i].name}`);
    }

    // Verify each tier reports correctly
    const h = new LatencyHarness({ iterations: 1, deviceTier: 'high' });
    const m = new LatencyHarness({ iterations: 1, deviceTier: 'mid' });
    const l = new LatencyHarness({ iterations: 1, deviceTier: 'low' });

    const hr = await h.measure(high, 'x');
    const mr = await m.measure(mid, 'x');
    const lr = await l.measure(low, 'x');

    assert(hr.deviceTier === 'high', 'high tier reported');
    assert(mr.deviceTier === 'mid', 'mid tier reported');
    assert(lr.deviceTier === 'low', 'low tier reported');
  }

  // ── Results ──
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
