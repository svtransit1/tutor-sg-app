export type Subject = 'math' | 'english' | 'chinese_mt' | 'science';

export type ScaffoldedHelpTab = 'hint' | 'steps' | 'solution';

export interface ScaffoldedHelp {
  hint: string;
  guidedSteps: string[];
  workedSolution: string;
}

export interface QuestionFeedback {
  questionNumber: number;
  subject: Subject;
  topic: string;
  questionText?: string;
  scaffoldedHelp: ScaffoldedHelp;
}

export interface HomeworkFeedbackResult {
  sessionId: string;
  questions: QuestionFeedback[];
  photoUri?: string;
  ocrText?: string;
}
