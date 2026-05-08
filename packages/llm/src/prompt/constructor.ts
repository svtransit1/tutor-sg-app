import type { Subject, OcrResult } from '@tutor-sg/shared'
import type { PromptInput } from '../types'
import { TEMPLATES } from './templates'
import { scrubPii, scrubOcrResult } from './scrub'

export interface BuildPromptOptions {
  ocrResult: OcrResult
  subject: Subject
  level: number
}

export function buildHomeworkPrompt(options: BuildPromptOptions): string {
  const { ocrResult, subject, level } = options
  const template = TEMPLATES[subject]
  const systemInstruction = template.systemInstruction.replace(/\{level\}/g, String(level))

  const cleaned = scrubOcrResult(ocrResult)

  const lines: string[] = [
    systemInstruction,
    '',
    template.outputFormatInstruction,
    template.jsonFormatHint,
    '',
    '--- OCR text from homework photo ---',
    '',
    cleaned.fullText || cleaned.pages.map((p) => p.blocks.map((b) => b.text).join('\n')).join('\n\n'),
    '',
    '--- end of OCR text ---',
    '',
    'Now respond with the JSON object:',
  ]

  return lines.join('\n')
}

export function buildPrompt(input: PromptInput): string {
  const template = TEMPLATES[input.subject]
  const systemInstruction = template.systemInstruction.replace(/\{level\}/g, String(input.level))

  const cleaned = scrubPii(input.fullText)

  const lines: string[] = [
    systemInstruction,
    '',
    template.outputFormatInstruction,
    template.jsonFormatHint,
    '',
    '--- OCR text from homework photo ---',
    '',
    cleaned,
    '',
    '--- end of OCR text ---',
    '',
    'Now respond with the JSON object:',
  ]

  return lines.join('\n')
}

export function estimatePromptTokens(prompt: string): number {
  return Math.ceil(prompt.length / 4)
}
