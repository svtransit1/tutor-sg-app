export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface OcrTextBlock {
  text: string
  confidence: number
  boundingBox: BoundingBox
}

export interface OcrPage {
  blocks: OcrTextBlock[]
  dimensions: { width: number; height: number }
}

export interface OcrResult {
  pages: OcrPage[]
  language: string
  fullText: string
  processingTimeMs: number
}
