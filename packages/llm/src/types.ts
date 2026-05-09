export type Subject = 'math' | 'english' | 'chinese_mt' | 'science';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export type Language = 'en' | 'zh-Hans';

export type ScaffoldLevel = 'hint' | 'steps' | 'solution' | 'all';

export interface PromptContext {
  subject: Subject;
  grade: Grade;
  language: Language;
  questionText: string;
  topic?: string;
  previousAttempts?: string;
  requestedLevel: ScaffoldLevel;
}

export interface FollowUpContext {
  subject: Subject;
  grade: Grade;
  language: Language;
  originalQuestion: string;
  followUpQuestion: string;
  previousHints?: string;
  topic?: string;
}

export interface SubjectDetectionResult {
  subject: Subject;
  topic: string;
  level: Grade;
  language: Language;
}

export interface PromptOutput {
  system: string;
  user: string;
}

export interface SubjectAdapter {
  subject: Subject;
  language: Language;
  instruction: string;
  exampleHints: string[];
  forbiddenPatterns: string[];
}

export interface ToneConfig {
  language: Language;
  role: string;
  rules: string[];
  encouragementPhrases: string[];
}

export function isGrade(value: number): value is Grade {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

export function ensureGrade(value: number): Grade {
  if (isGrade(value)) return value;
  throw new Error(`Invalid grade: ${value}. Must be 1-6.`);
}
