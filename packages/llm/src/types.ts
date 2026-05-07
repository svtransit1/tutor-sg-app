/**
 * LLM Bridge — core types for the homework camera → inference → response pipeline.
 *
 * These types define the contract between the camera/OCR layer and the
 * on-device LLM (Gemma E2B/E4B or Qwen). The bridge abstracts model selection,
 * prompt construction, and response parsing behind a clean interface.
 *
 * @see ARCHITECTURE.md §4.1 — Homework photo pipeline data flow
 * @see ADD §4.1 — Camera homework check flow
 */

// ── Subject & Grade ─────────────────────────────────────────────────

export type SubjectId = 'math' | 'english' | 'science' | 'chinese_mt';

export type GradeLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

// ── OCR Output ─────────────────────────────────────────────────────

/** Single text block detected by OCR */
export interface OcrTextBlock {
  /** Raw text recognised */
  text: string;
  /** Confidence 0–1. Blocks below 0.6 prompt manual input, below 0.3 trigger retake */
  confidence: number;
  /** Bounding box relative to the original image (0–1 normalized) */
  bbox?: { x: number; y: number; width: number; height: number };
  /** If this block was manually entered (OCR fallback) */
  manuallyEntered?: boolean;
}

/** Complete OCR result for one page/photo */
export interface OcrPageResult {
  /** Page index (0-based) */
  pageIndex: number;
  /** All detected text blocks */
  blocks: OcrTextBlock[];
  /** Overall confidence for this page (average of blocks) */
  overallConfidence: number;
  /** True if any block needed manual input */
  hasManualInput: boolean;
}

/** Combined result after all pages processed */
export interface OcrResult {
  pages: OcrPageResult[];
  /** Concatenated text from all pages (for LLM input) */
  fullText: string;
  /** Number of blocks that fell below the auto-detect threshold */
  lowConfidenceBlocks: number;
  /** True if any block required manual intervention */
  needsManualInput: boolean;
}

// ── Inference Request / Response ───────────────────────────────────

/** The question segmentation output — one detected homework question */
export interface DetectedQuestion {
  /** Question index (1-based for display) */
  index: number;
  /** Raw text of the question */
  text: string;
  /** Confidence that this is a valid question */
  confidence: number;
  /** True if this question's text was manually entered */
  manuallyEntered?: boolean;
}

/** A single step in the solution walkthrough */
export interface SolutionStep {
  /** Step number (1-based) */
  step: number;
  /** Step description in kid-friendly language */
  description: string;
  /** Optional working / intermediate result */
  working?: string;
}

/** The parsed inference response for one question */
export interface QuestionResponse {
  /** Which question this responds to */
  questionIndex: number;
  /** The original question text */
  questionText: string;
  /** Subject detected by LLM */
  detectedSubject?: string;
  /** Topic detected by LLM */
  detectedTopic?: string;
  /** Scaffolded hint — shown first, never gives away answer */
  hint: string;
  /** Guided step-by-step walkthrough */
  steps: SolutionStep[];
  /** Full solution — only shown when kid asks */
  fullSolution: string;
  /** Optional follow-up prompt the LLM suggests */
  suggestedFollowUp?: string;
}

/** The complete inference response for a homework session */
export interface InferenceResponse {
  /** Unique session ID */
  sessionId: string;
  /** ISO timestamp */
  createdAt: string;
  /** Responses per detected question */
  questions: QuestionResponse[];
  /** Overall subject detected */
  subject: SubjectId;
  /** Overall confidence (0–1) */
  confidence: number;
  /** If the LLM couldn't process, error details */
  error?: {
    code: 'ocr_too_low' | 'unsupported_subject' | 'no_questions_detected' | 'inference_failed';
    message: string;
    messageZh: string;
  };
}

/** Input to the LLM bridge */
export interface InferenceRequest {
  /** OCR result from the vision pipeline */
  ocr: OcrResult;
  /** Detected/segmented questions (may be empty, in which case LLM segments) */
  questions?: DetectedQuestion[];
  /** Known subject (may be 'auto' for LLM to detect) */
  subject: SubjectId | 'auto';
  /** Student's grade level */
  grade: GradeLevel;
  /** Device tier for model routing */
  deviceTier: 'high' | 'mid' | 'low';
  /** Language for response generation */
  language: 'en' | 'zh-Hans';
}

// ── Capability Manifest (from DeepTutor architecture lift) ──────────

export type CapabilityName = 'photo_solve' | 'quick_chat' | 'chinese_stroke_check';

export type ModelTier = 'E2B' | 'E4B';

export interface CapabilityManifest {
  name: CapabilityName;
  title: Record<'en' | 'zh-Hans', string>;
  stages: string[];
  tools: string[];
  modelTier: ModelTier;
}

export const CAPABILITY_MANIFESTS: Record<CapabilityName, CapabilityManifest> = {
  photo_solve: {
    name: 'photo_solve',
    title: { en: 'Solve this problem', 'zh-Hans': '我来解题' },
    stages: ['读题', '想步骤', '写答案'],
    tools: ['ocr', 'gemma_reasoning', 'session_log'],
    modelTier: 'E4B',
  },
  quick_chat: {
    name: 'quick_chat',
    title: { en: 'Quick chat', 'zh-Hans': '快速问答' },
    stages: ['听', '答'],
    tools: ['gemma_chat'],
    modelTier: 'E2B',
  },
  chinese_stroke_check: {
    name: 'chinese_stroke_check',
    title: { en: 'Check stroke order', 'zh-Hans': '检查笔顺' },
    stages: ['看', '评'],
    tools: ['stroke_db', 'qwen_reasoning'],
    modelTier: 'E4B',
  },
};

// ── Model Routing (from ARCHITECTURE.md §3.2) ──────────────────────

export interface ModelRoutingEntry {
  high: string;
  mid: string;
}

export type ModelRoutingTable = Record<SubjectId, ModelRoutingEntry>;

export const MODEL_ROUTING: ModelRoutingTable = {
  english:    { high: 'gemma-e4b', mid: 'gemma-e2b' },
  math:       { high: 'gemma-e4b', mid: 'gemma-e2b' },
  science:    { high: 'gemma-e4b', mid: 'gemma-e2b' },
  chinese_mt: { high: 'qwen-4b',   mid: 'qwen-2b' },
};

export function resolveModel(subject: SubjectId, tier: 'high' | 'mid'): string {
  return MODEL_ROUTING[subject][tier];
}
