export interface QuestionFeedback {
  questionNumber: number
  topic: string
  scaffoldedHelp: { hint: string; guidedSteps: string[]; workedSolution: string }
  subject?: string
}
export interface HomeworkFeedbackResult { questions: QuestionFeedback[] }
export type ScaffoldedHelpTab = 'hint' | 'steps' | 'solution'
