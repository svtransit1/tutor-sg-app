import { OcrBlock, OcrResult } from '../types/homework';
import { v4 as uuidv4 } from 'uuid';

const CONFIDENCE_THRESHOLD = 0.6;

export interface OcrService {
  processImage(imageUri: string): Promise<OcrResult>;
}

/**
 * Platform-agnostic OCR service.
 * For v1: mock implementation that simulates OCR results.
 * Replace with Apple Vision (iOS) / ML Kit (Android) native modules when ready.
 */
export class MockOcrService implements OcrService {
  async processImage(imageUri: string): Promise<OcrResult> {
    await simulateDelay(800);

    const mockBlocks: OcrBlock[] = [
      {
        id: uuidv4(),
        text: 'Question 1: What is 25 × 4?',
        confidence: 0.95,
        boundingBox: { x: 20, y: 50, width: 300, height: 40 },
      },
      {
        id: uuidv4(),
        text: 'Question 2: Simplify 3/4 + 1/8',
        confidence: 0.88,
        boundingBox: { x: 20, y: 120, width: 300, height: 40 },
      },
      {
        id: uuidv4(),
        text: 'Question 3: Find the area of a triangle with base 6cm and height 8cm',
        confidence: 0.72,
        boundingBox: { x: 20, y: 190, width: 300, height: 40 },
      },
      {
        id: uuidv4(),
        text: '',
        confidence: 0.35,
        boundingBox: { x: 20, y: 260, width: 300, height: 40 },
      },
    ];

    const blocks = mockBlocks.filter((b) => b.confidence >= CONFIDENCE_THRESHOLD);
    const lowConfidenceBlocks = mockBlocks.filter((b) => b.confidence < CONFIDENCE_THRESHOLD);

    return {
      blocks,
      lowConfidenceBlocks,
      imageUri,
      pageCount: 1,
      timestamp: Date.now(),
    };
  }
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
