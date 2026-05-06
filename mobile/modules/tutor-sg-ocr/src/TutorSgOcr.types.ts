/**
 * A single recognised text block returned by the native OCR engine.
 */
export interface OcrTextBlock {
  /** The recognised text string. */
  text: string;
  /** Normalised bounding box (0–1) relative to image dimensions. */
  boundingBox: OcrRect;
  /** Confidence score 0–1. */
  confidence: number;
}

/**
 * Normalised rectangle (0–1) relative to image dimensions.
 */
export interface OcrRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Top-level result from the native OCR module.
 */
export interface OcrResult {
  /** Concatenated full recognised text, blocks ordered top-to-bottom, left-to-right. */
  fullText: string;
  /** Individual text blocks with position and confidence. */
  blocks: OcrTextBlock[];
  /** Image dimensions the recognition was performed on. */
  imageSize: { width: number; height: number };
  /** Error message if recognition failed, null otherwise. */
  error: string | null;
}

/**
 * Options passed to the native OCR function.
 */
export interface OcrOptions {
  /** Minimum confidence threshold (0–1). Blocks below this are excluded. Default 0.3. */
  minConfidence?: number;
  /** Recognition language hint(s). Defaults to ["en", "zh-Hans"]. */
  recognitionLanguages?: string[];
  /** Whether to perform fast (latency-optimised) or accurate recognition. Default "accurate". */
  recognitionLevel?: "fast" | "accurate";
  /**
   * Android-specific: recognised text locale. Uses ML Kit's TextRecognizerOptions.
   * Default "en". Use "zh" for Chinese text.
   */
  androidTextLocale?: string;
}
