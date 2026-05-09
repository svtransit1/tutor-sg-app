/**
 * Types for the camera→LLM P95 latency measurement harness.
 *
 * Per ADD §3.5:
 *   Photo-to-first-token P95 < 8 sec on high tier, < 15 sec on low tier
 */

export type StageName =
  | 'camera_capture'
  | 'ocr'
  | 'question_segmentation'
  | 'llm_inference'
  | 'response_rendering'
  | (string & {});

export interface PipelineStage<TIn = unknown, TOut = unknown> {
  readonly name: StageName;
  readonly description?: string;
  execute(input: TIn, context?: Record<string, unknown>): Promise<TOut>;
}

export interface StageTiming {
  readonly stageName: StageName;
  readonly startTime: number;
  readonly durationMs: number;
}

export interface PipelineRunTiming {
  readonly runIndex: number;
  readonly stages: StageTiming[];
  readonly totalMs: number;
}

export interface LatencyStats {
  readonly count: number;
  readonly minMs: number;
  readonly maxMs: number;
  readonly meanMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly stdDevMs: number;
}

export interface StageLatencyReport {
  readonly stageName: StageName;
  readonly description: string;
  readonly stats: LatencyStats;
}

export interface LatencyReport {
  readonly measuredAt: string;
  readonly iterations: number;
  readonly deviceTier?: 'high' | 'mid' | 'low';
  readonly stages: StageLatencyReport[];
  readonly total: LatencyStats;
  readonly rawRuns: PipelineRunTiming[];
}

export interface HarnessConfig {
  readonly iterations: number;
  readonly deviceTier?: 'high' | 'mid' | 'low';
  readonly warmupIterations?: number;
  readonly interIterationDelayMs?: number;
}

export interface FpsMetrics {
  currentFps: number;
  isLowFps: boolean;
}
