import {
  PromptTemplate,
  PromptSubject,
  PromptTier,
  PromptLanguage,
  RenderContext,
  RenderedPrompt,
} from './types';

/** Resolve a bilingual string to the requested language. */
function localize(text: { en: string; 'zh-Hans': string }, lang: PromptLanguage): string {
  return text[lang];
}

/**
 * Fill placeholder tokens in a template string with values from the render context.
 *
 * Supported placeholders:
 *   {problemText} — the homework question
 *   {grade}       — e.g. "P3"
 *   {attempt}     — attempt number (default: 1)
 *   {topic}       — detected topic (default: empty string)
 */
function fillTemplate(template: string, ctx: RenderContext): string {
  const attempt = ctx.attempt ?? 1;
  const topic = ctx.topic ?? '';

  return template
    .replace(/\{problemText\}/g, ctx.problemText)
    .replace(/\{grade\}/g, ctx.grade)
    .replace(/\{attempt\}/g, String(attempt))
    .replace(/\{topic\}/g, topic);
}

/**
 * Render a full prompt (system + user) from a template and context.
 * Both system prompt and user template are filled with context variables.
 */
export function renderPrompt(
  template: PromptTemplate,
  subject: PromptSubject,
  tier: PromptTier,
  ctx: RenderContext,
): RenderedPrompt {
  const { language } = ctx;

  return {
    systemPrompt: fillTemplate(localize(template.systemPrompt, language), ctx),
    userPrompt: fillTemplate(localize(template.userTemplate, language), ctx),
    maxTokens: template.maxTokens,
    temperature: template.temperature,
    tier,
    subject,
  };
}
