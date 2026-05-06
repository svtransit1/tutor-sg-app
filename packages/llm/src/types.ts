/** Prompt tier for scaffolded tutoring (ADD §4.1). */
export type PromptTier = 'hint' | 'guided' | 'solution';

/** Subject keys matching the LLM routing table. */
export type PromptSubject = 'math' | 'english' | 'science' | 'chinese_mt';

/** Primary school grade levels in Singapore. */
export type GradeLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

/** UI language for prompt output. */
export type PromptLanguage = 'en' | 'zh-Hans';

/** Token budget per tier (ADD §4.1). */
export const TIER_TOKEN_BUDGETS: Record<PromptTier, number> = {
  hint: 384,
  guided: 768,
  solution: 1024,
};

/** Bilingual text pair. */
export interface BilingualText {
  en: string;
  'zh-Hans': string;
}

/** A scaffolded prompt template for one subject × tier. */
export interface PromptTemplate {
  /** System prompt that defines tutor behavior for this subject + tier. */
  systemPrompt: BilingualText;
  /** User prompt template — placeholders filled at render time. */
  userTemplate: BilingualText;
  /** Maximum tokens the model should generate for this tier. */
  maxTokens: number;
  /** Temperature for generation (0 = deterministic). */
  temperature: number;
}

/** Parameters passed to the template renderer. */
export interface RenderContext {
  /** The homework problem text (from OCR or manual entry). */
  problemText: string;
  /** Student's grade level (P1–P6). */
  grade: GradeLevel;
  /** Output language. */
  language: PromptLanguage;
  /** Student's attempt number on this problem (1 = first try). */
  attempt?: number;
  /** Detected topic from the syllabus tree (e.g. "fractions", "reading comprehension"). */
  topic?: string;
}

/** Rendered prompt ready for LLM inference. */
export interface RenderedPrompt {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  tier: PromptTier;
  subject: PromptSubject;
}
