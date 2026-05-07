/**
 * @tutor-sg/llm — LLM bridge for the homework camera → inference → response pipeline.
 *
 * This package provides:
 * - Types for OCR results, inference requests/responses, capability manifests
 * - A prompt builder that constructs structured prompts from OCR output
 * - A response parser that validates and parses LLM JSON output
 * - An InferenceBridge interface and MockInferenceBridge for development
 * - Model routing tables and capability manifests (from ADD §3.2, §3.3)
 *
 * Usage (with mock for dev):
 * ```ts
 * import { MockInferenceBridge, type InferenceRequest } from '@tutor-sg/llm';
 *
 * const bridge = new MockInferenceBridge();
 * await bridge.loadModel('E4B');
 * const response = await bridge.infer(request);
 * ```
 *
 * @see packages/llm/src/types.ts — core data types
 * @see packages/llm/src/prompt-builder.ts — prompt construction
 * @see packages/llm/src/response-parser.ts — response validation
 * @see packages/llm/src/inference-bridge.ts — bridge interface + mock
 * @see packages/llm/src/mock-data.ts — realistic mock homework scenarios
 */

// ── Types ──────────────────────────────────────────────────────────

export type {
  SubjectId,
  GradeLevel,
  OcrTextBlock,
  OcrPageResult,
  OcrResult,
  DetectedQuestion,
  SolutionStep,
  QuestionResponse,
  InferenceResponse,
  InferenceRequest,
  CapabilityName,
  ModelTier,
  CapabilityManifest,
  ModelRoutingEntry,
  ModelRoutingTable,
} from './types';

export {
  CAPABILITY_MANIFESTS,
  MODEL_ROUTING,
  resolveModel,
} from './types';

// ── Prompt Builder ─────────────────────────────────────────────────

export { buildPrompt, buildFollowUpPrompt } from './prompt-builder';
export type { BuiltPrompt } from './prompt-builder';

// ── Response Parser ────────────────────────────────────────────────

export { parseInferenceResponse } from './response-parser';

// ── Inference Bridge ───────────────────────────────────────────────

export { MockInferenceBridge } from './inference-bridge';
export type { InferenceBridge } from './inference-bridge';
