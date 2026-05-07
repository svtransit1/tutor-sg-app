/**
 * Simulated camera→LLM pipeline stages for testing the measurement harness.
 *
 * Each simulated stage generates realistic latency distributions using
 * a simple log-normal model. The default parameters target the ADD §3.5
 * budgets: P95 < 8 sec (high tier), P95 < 15 sec (mid/low tier).
 *
 * Real pipeline implementations will replace these with:
 *   - Camera capture → expo-camera / react-native-camera
 *   - OCR → Apple Vision / ML Kit native modules
 *   - Question segmentation → in-house segmentation layer
 *   - LLM inference → ExecuTorch / LiteRT-LM
 *   - Response rendering → React Native chat UI
 */

import type { PipelineStage } from './types';

// ── Stage timing profiles (log-normal parameters) ─────────────────

interface StageProfile {
  /** Name of the stage. */
  name: string;
  /** Description. */
  description: string;
  /** Median latency in ms (mu for the log-normal). */
  medianMs: number;
  /** Scatter factor: higher = more variance. stddev ~ median * scatter. */
  scatter: number;
}

/**
 * Default high-tier profiles (target: P95 < 8 sec total).
 * These represent a mid-tier device with modern NPU and ≥6 GB RAM.
 */
const HIGH_TIER_PROFILES: StageProfile[] = [
  { name: 'camera_capture',          description: 'Camera capture + frame preparation',       medianMs: 400,  scatter: 0.3 },
  { name: 'ocr',                     description: 'Platform OCR (Apple Vision / ML Kit)',     medianMs: 1200, scatter: 0.4 },
  { name: 'question_segmentation',   description: 'Question separation + classification',     medianMs: 250,  scatter: 0.3 },
  { name: 'llm_inference',           description: 'LLM inference (Gemma E4B / Qwen 4B)',      medianMs: 3000, scatter: 0.5 },
  { name: 'response_rendering',      description: 'Structured response rendering in chat UI', medianMs: 300,  scatter: 0.3 },
];

/**
 * Default mid-tier profiles (target: P95 < 15 sec total).
 * Represents a device with 4 GB RAM or older NPU → E2B / Qwen 2B.
 */
const MID_TIER_PROFILES: StageProfile[] = [
  { name: 'camera_capture',          description: 'Camera capture + frame preparation',       medianMs: 500,  scatter: 0.3 },
  { name: 'ocr',                     description: 'Platform OCR (Apple Vision / ML Kit)',     medianMs: 1800, scatter: 0.4 },
  { name: 'question_segmentation',   description: 'Question separation + classification',     medianMs: 350,  scatter: 0.3 },
  { name: 'llm_inference',           description: 'LLM inference (Gemma E2B / Qwen 2B)',      medianMs: 6000, scatter: 0.5 },
  { name: 'response_rendering',      description: 'Structured response rendering in chat UI', medianMs: 400,  scatter: 0.3 },
];

// ── Simulated stage factory ───────────────────────────────────────

/**
 * Create a simulated pipeline stage that produces log-normal latencies.
 * Useful for testing the harness without real hardware.
 */
export function createSimulatedStage(
  profile: StageProfile,
  options?: { fastMode?: boolean },
): PipelineStage<string, string> {
  return {
    name: profile.name,
    description: profile.description,
    async execute(input: string): Promise<string> {
      const duration = sampleLogNormal(profile.medianMs, profile.scatter);
      if (!options?.fastMode) {
        await busyWait(duration);
      }
      // Simulated output tags the input with the stage name
      return `${input} \u2192 [${profile.name}]`;
    },
  };
}

/**
 * Create a full simulated pipeline for a given device tier.
 *
 * @param tier - 'high' or 'mid' (defaults to 'high').
 * @returns Ordered array of simulated PipelineStages.
 */
export function createSimulatedPipeline(
  tier: 'high' | 'mid' = 'high',
  options?: { fastMode?: boolean },
): PipelineStage<string, string>[] {
  const profiles = tier === 'high' ? HIGH_TIER_PROFILES : MID_TIER_PROFILES;
  return profiles.map((p) => createSimulatedStage(p, options));
}

// ── Latency distribution helpers ──────────────────────────────────

/**
 * Sample from a log-normal distribution.
 *
 * @param medianMs - Desired median value in ms.
 * @param scatter  - Relative scatter (0 = deterministic).
 * @returns Sampled latency in ms, clamped to ≥ 1 ms.
 */
function sampleLogNormal(medianMs: number, scatter: number): number {
  if (scatter <= 0) return medianMs;

  // Log-normal: ln(X) ~ N(mu, sigma^2)
  // median = e^mu  →  mu = ln(medianMs)
  const mu = Math.log(medianMs);
  // sigma controls the spread: we want ~68% of values within
  // [median * e^{-sigma}, median * e^{sigma}]
  // scatter 0.5 → most values within ~1.65× of median
  const sigma = scatter;

  // Box-Muller transform for standard normal
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const sample = Math.exp(mu + sigma * z);
  return Math.max(1, sample);
}

/**
 * Busy-wait for the given duration.
 * In a real pipeline this would be actual work; here it's a simulated delay.
 */
function busyWait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
