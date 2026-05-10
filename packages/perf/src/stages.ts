import type { PipelineStage } from './types';

interface StageProfile {
  name: string;
  description: string;
  medianMs: number;
  scatter: number;
}

const HIGH: StageProfile[] = [
  { name: 'camera_capture', description: 'Camera capture + frame preparation', medianMs: 400, scatter: 0.3 },
  { name: 'ocr', description: 'Platform OCR', medianMs: 1200, scatter: 0.4 },
  { name: 'question_segmentation', description: 'Question separation + classification', medianMs: 250, scatter: 0.3 },
  { name: 'llm_inference', description: 'LLM inference (Gemma E4B / Qwen 4B)', medianMs: 3000, scatter: 0.5 },
  { name: 'response_rendering', description: 'Response rendering in chat UI', medianMs: 300, scatter: 0.3 },
];

const MID: StageProfile[] = [
  { name: 'camera_capture', description: 'Camera capture + frame preparation', medianMs: 500, scatter: 0.3 },
  { name: 'ocr', description: 'Platform OCR', medianMs: 1800, scatter: 0.4 },
  { name: 'question_segmentation', description: 'Question separation + classification', medianMs: 350, scatter: 0.3 },
  { name: 'llm_inference', description: 'LLM inference (Gemma E2B / Qwen 2B)', medianMs: 6000, scatter: 0.5 },
  { name: 'response_rendering', description: 'Response rendering in chat UI', medianMs: 400, scatter: 0.3 },
];

const LOW: StageProfile[] = [
  { name: 'camera_capture', description: 'Camera capture + frame preparation', medianMs: 700, scatter: 0.3 },
  { name: 'ocr', description: 'Platform OCR', medianMs: 2500, scatter: 0.4 },
  { name: 'question_segmentation', description: 'Question separation + classification', medianMs: 500, scatter: 0.3 },
  { name: 'llm_inference', description: 'LLM inference (Gemma E2B / Qwen 2B, low RAM)', medianMs: 9000, scatter: 0.5 },
  { name: 'response_rendering', description: 'Response rendering in chat UI', medianMs: 500, scatter: 0.3 },
];

export function createSimulatedStage(
  p: StageProfile,
  o?: { fastMode?: boolean },
): PipelineStage<string, string> {
  return {
    name: p.name,
    description: p.description,
    async execute(input: string): Promise<string> {
      const d = sampleLogNormal(p.medianMs, p.scatter);
      if (!o?.fastMode) await busyWait(d);
      return input + ' → [' + p.name + ']';
    },
  };
}

export function createSimulatedPipeline(
  t: 'high' | 'mid' | 'low' = 'high',
  o?: { fastMode?: boolean },
): PipelineStage<string, string>[] {
  const map: Record<string, StageProfile[]> = { high: HIGH, mid: MID, low: LOW };
  return (map[t] ?? HIGH).map((p) => createSimulatedStage(p, o));
}

function sampleLogNormal(m: number, s: number): number {
  if (s <= 0) return m;
  const mu = Math.log(m),
    u1 = Math.random(),
    u2 = Math.random(),
    z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(1, Math.exp(mu + s * z));
}

function busyWait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
