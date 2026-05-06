/**
 * Types for the camera→LLM P95 latency measurement harness.
 *
 * Per ADD §3.5:
 *   Photo-to-first-token P95 < 8 sec on high tier, < 15 sec on low tier
 *
 * Pipeline stages (ADD §4.1, ARCHITECTURE §4.1):
 *   1. Camera capture
 *   2. Platform OCR (Apple Vision / ML Kit)
 *   3. Question segmentation
 *   4. LLM inference (Gemma / Qwen via ExecuTorch / LiteRT-LM)
 *   5. Response rendering
 */

// ── Pipeline stage interface ──────────────────────────────────────

/** Unique identifier for a pipeline stage. */
export type StageName =
  | 'camera_capture'
  | 'ocr'
  | 'question_segmentation'
  | 'llm_inference'
  | 'response_rendering'
  | (string & {}); // allow custom stages for extensibility

/**
 * A single stage in the camera→LLM pipeline.
 * Each stage has a name and an async execute function.
 * The input/output types are generic so the harness works with any
 * pipeline implementation (real or simulated).
 */
export interface PipelineStage<TIn = unknown, TOut = unknown> {
  readonly name: StageName;
  readonly description?: string;
  execute(input: TIn, context?: Record<string, unknown>): Promise<TOut>;
}

// ── Timing data ───────────────────────────────────────────────────

/** Timing result for a single stage invocation. */
export interface StageTiming {
  readonly stageName: StageName;
  /** Timestamp (ms since epoch) when the stage started. */
  readonly startTime: number;
  /** Duration in milliseconds. */
  readonly durationMs: number;
}

/** Timing result for one full pipeline run. */
export interface PipelineRunTiming {
  /** Sequential run index (0-based). */
  readonly runIndex: number;
  /** Per-stage timings in execution order. */
  readonly stages: StageTiming[];
  /** Total pipeline duration for this run (sum of stage durations). */
  readonly totalMs: number;
}

// ── Statistics ────────────────────────────────────────────────────

/** Computed statistics for a set of observations. */
export interface LatencyStats {
  readonly count: number;
  readonly minMs: number;
  readonly maxMs: number;
  readonly meanMs: number;
  /** Median (50th percentile). */
  readonly p50Ms: number;
  /** 95th percentile. */
  readonly p95Ms: number;
  /** 99th percentile. */
  readonly p99Ms: number;
  /** Standard deviation in ms. */
  readonly stdDevMs: number;
}

/** Per-stage statistics. */
export interface StageLatencyReport {
  readonly stageName: StageName;
  readonly description: string;
  readonly stats: LatencyStats;
}

/** Complete latency report for a pipeline measurement session. */
export interface LatencyReport {
  /** ISO-8601 timestamp of when the measurement ran. */
  readonly measuredAt: string;
  /** Number of iterations. */
  readonly iterations: number;
  /** Target device tier context (optional). */
  readonly deviceTier?: 'high' | 'mid' | 'low';
  /** Per-stage reports. */
  readonly stages: StageLatencyReport[];
  /** Total pipeline latency statistics. */
  readonly total: LatencyStats;
  /** All raw run timings (for post-hoc analysis). */
  readonly rawRuns: PipelineRunTiming[];
}

// ── Harness configuration ─────────────────────────────────────────

export interface HarnessConfig {
  /** Number of iterations to run. */
  readonly iterations: number;
  /** Device tier context for reporting. */
  readonly deviceTier?: 'high' | 'mid' | 'low';
  /** Optional warmup iterations (timed but excluded from report). */
  readonly warmupIterations?: number;
  /** Delay between iterations in ms (to avoid thermal throttling skew). */
  readonly interIterationDelayMs?: number;
}
