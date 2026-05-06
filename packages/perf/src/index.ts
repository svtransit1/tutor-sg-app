/**
 * @tutor-sg/perf — Camera→LLM P95 latency measurement harness.
 *
 * Per ADD §3.5:
 *   Photo-to-first-token P95 < 8 sec on high tier
 *   Photo-to-first-token P95 < 15 sec on mid/low tier
 *
 * Exports:
 *   - LatencyHarness         — main measurement harness
 *   - formatReport           — text report generator
 *   - computeLatencyStats    — stats utilities
 *   - createSimulatedStage   — sim stage factory for testing
 *   - createSimulatedPipeline — full simulated pipeline for CI
 *   - PipelineStage          — type for real stage implementations
 *   - LatencyReport          — report type
 *   - HarnessConfig          — config type
 *   - StageTiming, PipelineRunTiming, StageLatencyReport, LatencyStats
 */

export { LatencyHarness, formatReport } from './harness';
export { computeLatencyStats } from './stats';
export { createSimulatedStage, createSimulatedPipeline } from './stages';

export type {
  HarnessConfig,
  LatencyReport,
  LatencyStats,
  PipelineRunTiming,
  PipelineStage,
  StageLatencyReport,
  StageName,
  StageTiming,
} from './types';
