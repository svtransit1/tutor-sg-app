import type { Subject } from '@tutor-sg/shared'
import type { HomeworkFeedbackResult, QuestionFeedback, ParseResult } from '../types'
import { estimatePromptTokens } from '../prompt/constructor'

export function parseHomeworkResponse(
  rawResponse: string,
  context: { subject: Subject; level: number; prompt: string },
): ParseResult {
  try {
    const jsonStr = extractJson(rawResponse)

    if (!jsonStr) {
      return {
        success: false,
        data: null,
        error: 'No JSON object found in LLM response',
      }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return {
        success: false,
        data: null,
        error: 'Invalid JSON: failed to parse extracted content',
      }
    }

    if (!isValidResponse(parsed)) {
      return {
        success: false,
        data: null,
        error: 'Response JSON does not match expected structure. Missing required fields: questions array, or per-question fields.',
      }
    }

    const questions: QuestionFeedback[] = parsed.questions.map(
      (q: Record<string, unknown>, i: number) => ({
        questionNumber: typeof q.questionNumber === 'number' ? q.questionNumber : i + 1,
        topic: String(q.topic ?? ''),
        plan: String(q.plan ?? ''),
        steps: Array.isArray(q.steps) ? q.steps.map(String) : [],
        final: String(q.final ?? ''),
      }),
    )

    const result: HomeworkFeedbackResult = {
      questions,
      subject: context.subject,
      level: context.level,
      rawPrompt: context.prompt,
      rawResponse,
    }

    return { success: true, data: result, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, data: null, error: `Unexpected parse error: ${message}` }
  }
}

export function extractJson(text: string): string | null {
  const trimmed = text.trim()

  const jsonMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  if (jsonMatch) {
    const candidate = jsonMatch[1].trim()
    if (looksLikeJson(candidate)) return candidate
  }

  const braceMatch = trimmed.match(/^\{[\s\S]*\}$/m)
  if (braceMatch) {
    const candidate = braceMatch[0].trim()
    if (looksLikeJson(candidate)) return candidate
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1)
    if (looksLikeJson(candidate)) return candidate
  }

  if (looksLikeJson(trimmed)) return trimmed

  return null
}

function looksLikeJson(s: string): boolean {
  try {
    JSON.parse(s)
    return true
  } catch {
    return false
  }
}

function isValidResponse(value: unknown): value is { questions: Record<string, unknown>[] } {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.questions)) return false
  for (const q of obj.questions) {
    if (typeof q !== 'object' || q === null) return false
    const qObj = q as Record<string, unknown>
    if (typeof qObj.questionNumber !== 'number' && typeof qObj.questionNumber !== 'undefined') return false
  }
  return true
}

export function trimToTokenBudget(prompt: string, maxTokens: number): string {
  const currentTokens = estimatePromptTokens(prompt)
  if (currentTokens <= maxTokens) return prompt

  const ratio = maxTokens / currentTokens
  const targetChars = Math.floor(prompt.length * ratio)

  const ocrMarker = '--- OCR text from homework photo ---'
  const ocrEndMarker = '--- end of OCR text ---'
  const ocrStart = prompt.indexOf(ocrMarker)

  if (ocrStart === -1) {
    return prompt.slice(0, targetChars)
  }

  const beforeOcr = prompt.slice(0, ocrStart + ocrMarker.length)
  const afterOcrStart = prompt.indexOf(ocrEndMarker, ocrStart)
  const afterOcr = prompt.slice(afterOcrStart)

  const ocrSectionStart = ocrStart + ocrMarker.length
  const ocrSectionEnd = afterOcrStart
  const ocrText = prompt.slice(ocrSectionStart, ocrSectionEnd).trim()

  const fixedOverhead = estimatePromptTokens(beforeOcr + '\n\n' + afterOcr)
  const ocrBudgetTokens = Math.max(0, maxTokens - fixedOverhead)
  const ocrBudgetChars = ocrBudgetTokens * 4

  const truncatedOcr = ocrText.length > ocrBudgetChars
    ? ocrText.slice(0, ocrBudgetChars) + '\n[OCR text truncated to fit token budget]'
    : ocrText

  return beforeOcr + '\n' + truncatedOcr + '\n' + afterOcr
}
