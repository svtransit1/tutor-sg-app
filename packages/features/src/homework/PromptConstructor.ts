import type { Subject, OcrResult } from '@tutor-sg/shared'
import { buildHomeworkPrompt, parseHomeworkResponse, scrubPii } from '@tutor-sg/llm'
import type { ParseResult } from '@tutor-sg/llm'

export type { ParseResult }

export interface PromptConstructorInput {
  ocrResult: OcrResult
  subject: Subject
  level: number
}

export interface PromptConstructorOutput {
  prompt: string
  cleanedOcrText: string
  piisRemoved: boolean
}

export function constructHomeworkPrompt(input: PromptConstructorInput): PromptConstructorOutput {
  const fullText = input.ocrResult.fullText || ''
  const cleanedText = scrubPii(fullText)
  const piisRemoved = cleanedText !== fullText

  const prompt = buildHomeworkPrompt({
    ocrResult: input.ocrResult,
    subject: input.subject,
    level: input.level,
  })

  return { prompt, cleanedOcrText: cleanedText, piisRemoved }
}

export { parseHomeworkResponse }

export function estimateTokenCount(prompt: string): number {
  return Math.ceil(prompt.length / 4)
}
