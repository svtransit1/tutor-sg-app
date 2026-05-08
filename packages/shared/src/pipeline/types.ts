// ── Camera → OCR → Classifier → LLM pipeline TypeScript interfaces ──
//
// Per ADD §4.1 and ARCHITECTURE.md §4.1:
//
//   Camera capture
//     → Stage 1: Platform OCR (Apple Vision / ML Kit)
//       → Confidence scoring per text block
//         → Blocks ≥ 0.6 confidence: keep
//         → Blocks < 0.6 confidence: prompt manual input
//         → All blocks < 0.3: show retake prompt
//     → Stage 2: Subject classification + question segmentation
//     → Stage 3: Gemma semantic analysis
//       → Input: OcrResult { blocks, subject, level }
//       → Output: { hint, steps, solution } — single-pass structured JSON
//     → Stage 4: Response rendering in chat UI
//     → Auto-save session to Parent Log

import type { Subject, DetectedLanguage, SubjectClassification } from '../classifier/SubjectClassifier'
import type { DeviceTier } from '@tutor-sg/device-tier'
import type { Locale } from '../i18n/keys'

// ── Camera ───────────────────────────────────────────────────────────

export interface CameraImage {
  uri: string
  width: number
  height: number
  timestamp: string // ISO 8601
}

export interface MultiPageCapture {
  images: CameraImage[]
  pageCount: number
}

// ── OCR ──────────────────────────────────────────────────────────────

export type OcrPlatform = 'apple-vision' | 'ml-kit'
export type OcrConfidenceLevel = 'high' | 'medium' | 'low'

export interface OcrBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface OcrBlock {
  id: string
  text: string
  confidence: number // 0–1
  boundingBox: OcrBoundingBox
  language: DetectedLanguage
  /** Derived classification: ≥0.6 = high, ≥0.3 = medium, <0.3 = low */
  confidenceLevel: OcrConfidenceLevel
}

export interface OcrResult {
  blocks: OcrBlock[]
  rawText: string
  language: DetectedLanguage
  processingTimeMs: number
  platform: OcrPlatform
  timestamp: string // ISO 8601
}

export interface OcrQualityAssessment {
  highConfidenceBlocks: OcrBlock[]
  lowConfidenceBlocks: OcrBlock[]
  /** true when ALL blocks have confidence < 0.3 */
  needsRetake: boolean
  /** true when at least one block has confidence < 0.6 */
  needsManualInput: boolean
}

/** Per ADD §4.1 — confidence thresholds for OCR processing. */
export const OCR_THRESHOLDS = {
  KEEP: 0.6,
  RETAKE: 0.3,
} as const

// ── Question segmentation ───────────────────────────────────────────

export type QuestionType =
  | 'multiple_choice'
  | 'fill_in_blank'
  | 'short_answer'
  | 'structured'
  | 'open_ended'
  | 'unknown'

export interface QuestionSegment {
  id: string
  index: number // 1-based question number in the photo
  text: string
  blocks: OcrBlock[] // OCR blocks belonging to this question
  confidence: number // aggregate confidence across blocks
  type: QuestionType
  subQuestions: QuestionSegment[] // for multi-part questions
}

export interface QuestionSegmentationResult {
  questions: QuestionSegment[]
  unrecognizedSegments: OcrBlock[]
  totalQuestions: number
}

// ── Pipeline request / response ──────────────────────────────────────

export type PipelineMode = 'hint' | 'steps' | 'solution'

export interface PipelineRequest {
  sessionId: number
  images: CameraImage[]
  /** Pre-specified by user (picker), or omitted for auto-classification. */
  subject?: Subject
  /** P1–P6 */
  level: number
  language: Locale
  /** What the kid wants first. Default: 'hint' per ADD §4.1. */
  mode: PipelineMode
}

export interface HomeworkHelp {
  hint: string // always generated first per ADD §4.1
  steps: string[]
  /** Worked solution — only generated on explicit request. */
  solution: string
}

export interface QuestionFeedback {
  questionSegment: QuestionSegment
  help: HomeworkHelp
  subject: Subject
  classification: SubjectClassification
  topic: string
  topicId?: string
  /** Whether the kid can follow up with chat questions. */
  followUpChat: boolean
}

export interface PipelineResponse {
  sessionId: number
  subject: Subject
  questions: QuestionFeedback[]
  unrecognizedItems: number
  processingTimeMs: number
  modelUsed: string // e.g. 'gemma-e4b', 'qwen-2b'
  deviceTier: DeviceTier
  timestamp: string // ISO 8601
}

// ── Full session (canonical view across pipeline) ────────────────────

/** Canonical homework session: photos → OCR → classification → feedback → timestamps.
 *  Aligns with the KidSession SQLite schema from M0-11 (mobile/src/storage/sessions.ts). */
export interface HomeworkSession {
  sessionId: number
  subject: Subject
  level: number // P1–P6
  language: Locale
  images: CameraImage[]
  ocrResult?: OcrResult
  classification?: SubjectClassification
  segmentation?: QuestionSegmentationResult
  feedback?: PipelineResponse
  createdAt: string // ISO 8601
  closedAt: string | null // ISO 8601 — null if still in progress
}

// ── Pipeline status tracking ─────────────────────────────────────────

export type PipelineStage =
  | 'idle'
  | 'capturing'
  | 'ocr'
  | 'classifying'
  | 'segmenting'
  | 'inferring'
  | 'complete'
  | 'error'

export interface PipelineProgress {
  stage: PipelineStage
  progress: number // 0–1
  currentQuestion: number
  totalQuestions: number
  /** Bilingual displayable status text key. */
  statusKey: string
  error?: string
}

// ── Pipeline config ──────────────────────────────────────────────────

export interface PipelineConfig {
  maxImagesPerCapture: number
  ocrConfidenceThreshold: number // 0.6 per ADD
  retakeThreshold: number // 0.3 per ADD
  maxFollowUpQuestions: number
  freeTierQuestionLimit: number
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  maxImagesPerCapture: 3,
  ocrConfidenceThreshold: OCR_THRESHOLDS.KEEP,
  retakeThreshold: OCR_THRESHOLDS.RETAKE,
  maxFollowUpQuestions: 5,
  freeTierQuestionLimit: 3, // TBD by Owl + product testing (ADD §6)
}

// ── Model routing ────────────────────────────────────────────────────

/** Per ARCHITECTURE.md §3.2 — static config map, never hardcode model IDs. */
export interface ModelRoutingTable {
  english: ModelTierSelection
  math: ModelTierSelection
  science: ModelTierSelection
  chinese_mt: ModelTierSelection
}

export interface ModelTierSelection {
  high: string // e.g. 'gemma-e4b'
  mid: string // e.g. 'gemma-e2b'
}

export const MODEL_ROUTING: ModelRoutingTable = {
  english: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  math: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  science: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  chinese_mt: { high: 'qwen-4b', mid: 'qwen-2b' },
}

/** Per ARCHITECTURE.md §3.3 — capability-based inference budget. */
export type InferenceCapability =
  | 'photo_solve'
  | 'quick_chat'
  | 'chinese_stroke_check'

export interface CapabilityTier {
  capability: InferenceCapability
  tier: 'high' | 'mid'
}

export const CAPABILITY_TIERS: Record<InferenceCapability, CapabilityTier['tier']> = {
  photo_solve: 'high',
  quick_chat: 'mid',
  chinese_stroke_check: 'high',
}

/** Feature gates for model capabilities (ARCHITECTURE.md §4.3). */
export type EntitlementTier = 'free' | 'trial' | 'paid'
export type FeatureGateId =
  | 'photo_solve'
  | 'photo_solve_unlimited'
  | 'parent_report'
  | 'chinese_stroke_check'
  | 'study_programme'

export interface FeatureGate {
  feature: FeatureGateId
  minimumTier: EntitlementTier
}

export const FEATURE_GATES: FeatureGate[] = [
  { feature: 'photo_solve', minimumTier: 'free' },
  { feature: 'photo_solve_unlimited', minimumTier: 'trial' },
  { feature: 'parent_report', minimumTier: 'trial' },
  { feature: 'chinese_stroke_check', minimumTier: 'trial' },
  { feature: 'study_programme', minimumTier: 'paid' },
]

// ── Utility — compute OcrQualityAssessment from OCR result ───────────

export function assessOcrQuality(result: OcrResult): OcrQualityAssessment {
  const highConfidenceBlocks: OcrBlock[] = []
  const lowConfidenceBlocks: OcrBlock[] = []

  for (const block of result.blocks) {
    if (block.confidence >= OCR_THRESHOLDS.KEEP) {
      highConfidenceBlocks.push(block)
    } else {
      lowConfidenceBlocks.push(block)
    }
  }

  const needsRetake = result.blocks.length > 0 && highConfidenceBlocks.length === 0
  const needsManualInput = lowConfidenceBlocks.length > 0

  return { highConfidenceBlocks, lowConfidenceBlocks, needsRetake, needsManualInput }
}

/** Select the model ID for a given subject + tier from the routing table. */
export function selectModel(
  subject: Subject,
  deviceTier: DeviceTier,
): string {
  const table = MODEL_ROUTING
  const key = subject === 'chinese_mt' ? 'chinese_mt' : subject
  const tierKey: 'high' | 'mid' = deviceTier === 'high' ? 'high' : 'mid'
  return table[key][tierKey]
}
