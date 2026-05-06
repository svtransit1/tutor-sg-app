/**
 * OCR Service — abstraction over platform-specific OCR.
 *
 * On iOS: Apple Vision Framework (VNRecognizeTextRequest) via native module.
 * On Android: ML Kit Text Recognition via native module.
 *
 * For v1 development, we provide a mock implementation that simulates OCR
 * output from a captured image. The real platform OCR integration will be
 * plugged in once the native modules are set up (M1 camera/OCR spike).
 *
 * @see ARCHITECTURE.md §4.1 — Homework photo pipeline
 * @see ADD §4.1 — OCR fallback: manual-input when confidence < 0.6
 */

import type { OcrResult, OcrPageResult, OcrTextBlock } from '@tutor-sg/llm';

// ── OCR Options ────────────────────────────────────────────────────

export interface OcrOptions {
  /** Language hint for OCR engine */
  language?: 'en' | 'zh-Hans' | 'mixed';
  /** Minimum confidence threshold for auto-accept (0–1). Blocks below this prompt manual input */
  confidenceThreshold?: number;
  /** Minimum confidence threshold below which retake is prompted */
  retakeThreshold?: number;
}

const DEFAULT_OPTIONS: Required<OcrOptions> = {
  language: 'mixed',
  confidenceThreshold: 0.6,
  retakeThreshold: 0.3,
};

// ── OCR Service Interface ──────────────────────────────────────────

export interface OcrService {
  /**
   * Perform OCR on an image URI.
   * Returns structured OCR result with per-block confidence.
   */
  recognizeImage(imageUri: string, options?: OcrOptions): Promise<OcrResult>;

  /**
   * Process multiple images (multi-page capture).
   */
  recognizeImages(imageUris: string[], options?: OcrOptions): Promise<OcrResult>;

  /**
   * Check if the OCR engine is available on this device.
   */
  isAvailable(): boolean;
}

// ── Mock OCR Service ───────────────────────────────────────────────

/**
 * Mock OCR for development. Simulates realistic OCR output.
 *
 * In development mode, we cheat slightly: the mock extracts meaningful-looking
 * text from the image URI (which would be a file path like
 * `file:///.../photo_123.jpg`) and returns plausible homework text.
 *
 * When the real platform OCR native modules are integrated, swap this for
 * the real implementation.
 */
export class MockOcrService implements OcrService {
  isAvailable(): boolean {
    return true;
  }

  async recognizeImage(imageUri: string, options?: OcrOptions): Promise<OcrResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Simulate processing delay (real OCR takes ~500-1500ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For mock, we generate plausible homework text based on a hash of the URI
    // This simulates different homework subjects each time
    const hash = simpleHash(imageUri);
    const mockText = generateMockHomeworkText(hash, opts.language);

    return buildOcrResult(mockText, opts);
  }

  async recognizeImages(imageUris: string[], options?: OcrOptions): Promise<OcrResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const pages: OcrPageResult[] = [];

    for (let i = 0; i < imageUris.length; i++) {
      const result = await this.recognizeImage(imageUris[i], opts);
      pages.push(...result.pages);
    }

    return {
      pages,
      fullText: pages.map((p) => p.blocks.map((b) => b.text).join(' ')).join('\n'),
      lowConfidenceBlocks: pages.reduce((sum, p) => sum + p.blocks.filter((b) => b.confidence < opts.confidenceThreshold).length, 0),
      needsManualInput: pages.some((p) => p.hasManualInput),
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

const MOCK_HOMEWORK_TEXTS: string[] = [
  // Math
  '1. What is 3/4 of 20?\n2. There are 4 rows of chairs. Each row has 6 chairs. How many chairs are there altogether?\n3. A bag costs $80. It is now sold at 25% discount. What is the sale price?',
  // English grammar
  'Fill in the blanks with the correct verb tense:\n1. Yesterday, Sarah _____ (go) to the library.\n2. The children _____ (play) in the park right now.\n3. I _____ (finish) my homework before dinner.',
  // Science
  '1. Name one way to change a liquid into a solid.\n2. What are the three states of matter?\n3. Why does a metal spoon feel colder than a wooden spoon at the same temperature?',
  // Chinese
  '一、组词：\n1. 快___  2. 乐___  3. 大___\n二、用下列词语造句：\n1. 快乐  2. 认真  3. 帮助',
  // P6 Math PSLE
  'The ratio of boys to girls in a school is 3 : 5. There are 240 more girls than boys. How many students are there altogether?\nA. 480  B. 720  C. 960  D. 1200',
  // P3 Multiplication
  '1. 4 × 7 = ?\n2. 6 × 8 = ?\n3. There are 5 bags. Each bag has 9 apples. How many apples are there altogether?',
];

function generateMockHomeworkText(hash: number, _language: 'en' | 'zh-Hans' | 'mixed'): string {
  const index = hash % MOCK_HOMEWORK_TEXTS.length;
  return MOCK_HOMEWORK_TEXTS[index];
}

function buildOcrResult(text: string, opts: Required<OcrOptions>): OcrResult {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const blocks: OcrTextBlock[] = lines.map((line, i) => ({
    text: line.trim(),
    // Simulate realistic confidence: most blocks are clear, some are slightly lower
    confidence: Math.max(0.5, 0.95 - i * 0.03 - Math.random() * 0.05),
    bbox: { x: 0.1, y: 0.1 + i * 0.08, width: 0.8, height: 0.05 },
  }));

  const lowConfBlocks = blocks.filter((b) => b.confidence < opts.confidenceThreshold);
  const veryLowBlocks = blocks.filter((b) => b.confidence < opts.retakeThreshold);

  const page: OcrPageResult = {
    pageIndex: 0,
    blocks,
    overallConfidence: blocks.reduce((sum, b) => sum + b.confidence, 0) / blocks.length,
    hasManualInput: lowConfBlocks.length > 0,
  };

  return {
    pages: [page],
    fullText: text,
    lowConfidenceBlocks: lowConfBlocks.length,
    needsManualInput: veryLowBlocks.length > 0,
  };
}
