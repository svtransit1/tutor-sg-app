import type { OcrResult } from '@tutor-sg/shared'

const NAME_PATTERN = /\b(?:My name is|I am|I'm|Called|Name)[:：]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi
const NRIC_PATTERN = /\b[STFGMstfgm]\d{7}[A-Za-z]\b/g
const PHONE_PATTERN = /\b(?:6|8|9)\d{7}\b|(?:\+\d{1,3}[\s-]?\d[\d\s-]{6,11})\b/g
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const BLOCK_PATTERN = /\b(?:Blk|Block)[.\s]*\d+[A-Za-z]?(?:\s*[A-Za-z]+)*/gi
const POSTAL_PATTERN = /\b(?:Singapore\s+)?\d{6}\b/g

const PII_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: NAME_PATTERN, replacement: '[name removed]' },
  { pattern: NRIC_PATTERN, replacement: '[NRIC removed]' },
  { pattern: PHONE_PATTERN, replacement: '[phone removed]' },
  { pattern: EMAIL_PATTERN, replacement: '[email removed]' },
  { pattern: BLOCK_PATTERN, replacement: '[address removed]' },
  { pattern: POSTAL_PATTERN, replacement: '[postal removed]' },
]

export function scrubPii(text: string): string {
  let result = text
  for (const { pattern, replacement } of PII_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

export function scrubOcrResult(ocrResult: OcrResult): OcrResult {
  return {
    ...ocrResult,
    pages: ocrResult.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => ({
        ...block,
        text: scrubPii(block.text),
      })),
    })),
    fullText: scrubPii(ocrResult.fullText),
  }
}
