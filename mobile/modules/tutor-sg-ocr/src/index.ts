/**
 * tutor-sg-ocr — Platform-native OCR module for React Native / Expo.
 *
 * Provides a unified TypeScript API over:
 * - iOS: Apple Vision Framework (VNRecognizeTextRequest)
 * - Android: Google ML Kit Text Recognition
 *
 * @packageDocumentation
 */

export {
  recognizeText,
  isOcrAvailable,
} from "./TutorSgOcrModule";

export type {
  OcrResult,
  OcrTextBlock,
  OcrRect,
  OcrOptions,
} from "./TutorSgOcr.types";
