/**
 * Template composer — assembles a complete system prompt for math tutoring.
 * Combines: system prompt + hint taxonomy + topic scaffold + injection guard.
 * Integrates with the subject classifier output (structured JSON → prompt).
 */

import { MATH_TUTOR_SYSTEM_PROMPT } from './system-prompt';
import { getHintTemplate, type HintLevelKey, type HintLang } from './hint-taxonomy';
import { getScaffoldById, type TopicScaffold } from './topic-scaffolds';
import { INJECTION_GUARD } from './injection-guard';

export interface ClassifierInput {
  subject: 'math';
  grade: 'P1' | 'P2' | 'P3';
  topicId: string;
  language: 'en' | 'zh-Hans';
  hintLevel: 1 | 2 | 3 | 4;
  studentQuestion: string;
  priorHintsGiven: number;
}

export function composeMathPrompt(input: ClassifierInput): string {
  const lang: HintLang = input.language;
  const parts: string[] = [];

  // 1. System prompt (always first)
  parts.push(MATH_TUTOR_SYSTEM_PROMPT[lang]);

  // 2. Injection guard (always appended)
  parts.push(INJECTION_GUARD[lang]);

  // 3. Topic-specific scaffold (if available)
  const scaffold = getScaffoldById(input.topicId);
  if (scaffold) {
    const hint = getScaffoldHintText(scaffold, input.hintLevel, lang);
    parts.push(`\n## Topic-Specific Guidance\nTopic: ${scaffold.topic} (${scaffold.grade})\nHint for this topic: ${hint}`);
  }

  // 4. Current hint-level instruction
  const levelKey = hintLevelToKey(input.hintLevel);
  const hintTemplate = getHintTemplate(levelKey, lang);
  parts.push(`\n## Current Hint Level\n${hintTemplate.systemInstruction}`);

  // 5. Student's question (context for the LLM)
  parts.push(`\n## Student's Question\n${input.studentQuestion}`);

  // 6. Prior hint context
  if (input.priorHintsGiven > 0) {
    const priorMsg = lang === 'en'
      ? `You have already given ${input.priorHintsGiven} hint(s) for this question.`
      : `你已经为这道题给出了${input.priorHintsGiven}个提示。`;
    parts.push(`\n## Hint History\n${priorMsg}`);
  }

  return parts.join('\n\n');
}

function hintLevelToKey(level: 1 | 2 | 3 | 4): HintLevelKey {
  const map: Record<number, HintLevelKey> = {
    1: 'level1_nudge',
    2: 'level2_partial',
    3: 'level3_guided',
    4: 'level4_full',
  };
  return map[level];
}

function getScaffoldHintText(
  scaffold: TopicScaffold,
  level: 1 | 2 | 3 | 4,
  lang: 'en' | 'zh-Hans',
): string {
  switch (level) {
    case 1: return scaffold.level1[lang];
    case 2: return scaffold.level2[lang];
    case 3: return scaffold.level3[lang];
    case 4: return scaffold.level4_prefix[lang];
  }
}

export function getSystemPromptOnly(lang: 'en' | 'zh-Hans'): string {
  return `${MATH_TUTOR_SYSTEM_PROMPT[lang]}\n\n${INJECTION_GUARD[lang]}`;
}

export type { HintLang, HintLevelKey };
export { getHintTemplate, getScaffoldById, getScaffoldHint, getScaffoldsByGrade } from './topic-scaffolds';
export { INJECTION_GUARD } from './injection-guard';
export { MATH_TUTOR_SYSTEM_PROMPT } from './system-prompt';
export { HINT_LEVEL_TEMPLATES } from './hint-taxonomy';
