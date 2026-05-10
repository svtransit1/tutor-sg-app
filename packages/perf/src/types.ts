/**
 * Types for the camera→LLM P95 latency measurement harness.
 *
 * ADD §3.5 targets:
 *   Photo-to-first-token P95 < 8s (high tier), < 15s (low tier)
 * ADD §9 Q6:
 *   Cold start < 3s on mid-tier device
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

export interface DeviceSpec {
  readonly platform: 'ios' | 'android' | 'unknown';
  readonly ramGB: number;
  readonly npuName: string;
  readonly modelName: string;
}

export interface LatencyReport {
  readonly measuredAt: string;
  readonly iterations: number;
  readonly deviceTier?: 'high' | 'mid' | 'low';
  readonly deviceSpec?: DeviceSpec;
  readonly stages: StageLatencyReport[];
  readonly total: LatencyStats;
  readonly rawRuns: PipelineRunTiming[];
}

export interface HarnessConfig {
  readonly iterations: number;
  readonly deviceTier?: 'high' | 'mid' | 'low';
  readonly deviceSpec?: DeviceSpec;
  readonly warmupIterations?: number;
  readonly interIterationDelayMs?: number;
}

export interface FpsMetrics {
  currentFps: number;
  isLowFps: boolean;
}

export interface ColdStartResult {
  readonly loadTimeMs: number;
  readonly firstFrameMs: number;
  readonly interactiveMs: number;
}

export interface BenchResult {
  readonly generatedAt: string;
  readonly deviceSpec: DeviceSpec;
  readonly coldStart?: ColdStartResult;
  readonly llmReport?: LatencyReport;
  readonly cameraFps?: FpsMetrics;
}

export const ADD_TARGETS: Record<string, Record<string, number>> = {
  'cold-start': { high: 3000, mid: 3000, low: 5000 },
  'photo-to-first-token': { high: 8000, mid: 12000, low: 15000 },
  'camera-fps': { high: 30, mid: 25, low: 20 },
};
