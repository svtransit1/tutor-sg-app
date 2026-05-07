export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrBlock {
  text: string;
  boundingBox: Rect;
  confidence: number;
}

export interface OcrResult {
  fullText: string;
  blocks: OcrBlock[];
  imageSize: { width: number; height: number };
  error: string | null;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence > 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

export function isTapToType(confidence: number): boolean {
  return confidence < 0.8;
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'high': return '#22C55E';
    case 'medium': return '#EAB308';
    case 'low': return '#EF4444';
  }
}

export function getConfidenceBgColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'high': return '#DCFCE7';
    case 'medium': return '#FEF9C3';
    case 'low': return '#FEE2E2';
  }
}
