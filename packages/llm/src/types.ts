import type { Subject } from '@tutor-sg/shared'

export interface QuestionFeedback {
  questionNumber: number
  topic: string
  plan: string
  steps: string[]
  final: string
}

export interface HomeworkFeedbackResult {
  questions: QuestionFeedback[]
  subject: Subject
  level: number
  rawPrompt: string
  rawResponse: string
}

export interface PromptInput {
  fullText: string
  subject: Subject
  level: number
  detectedLanguage: string
}

export interface ParseResult {
  success: boolean
  data: HomeworkFeedbackResult | null
  error: string | null
}
