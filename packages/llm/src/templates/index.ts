import { PromptTemplate, PromptSubject, PromptTier } from '../types';
import { mathTemplates } from './math';
import { englishTemplates } from './english';
import { scienceTemplates } from './science';
import { chineseMtTemplates } from './chinese_mt';

const templateRegistry: Record<PromptSubject, Record<PromptTier, PromptTemplate>> = {
  math: {
    hint: mathTemplates.hint,
    guided: mathTemplates.guided,
    solution: mathTemplates.solution,
  },
  english: {
    hint: englishTemplates.hint,
    guided: englishTemplates.guided,
    solution: englishTemplates.solution,
  },
  science: {
    hint: scienceTemplates.hint,
    guided: scienceTemplates.guided,
    solution: scienceTemplates.solution,
  },
  chinese_mt: {
    hint: chineseMtTemplates.hint,
    guided: chineseMtTemplates.guided,
    solution: chineseMtTemplates.solution,
  },
};

/**
 * Get a prompt template by subject and tier.
 */
export function getTemplate(subject: PromptSubject, tier: PromptTier): PromptTemplate {
  return templateRegistry[subject][tier];
}

/**
 * List all available subject × tier combinations.
 */
export function listTemplateKeys(): Array<{ subject: PromptSubject; tier: PromptTier }> {
  const subjects: PromptSubject[] = ['math', 'english', 'science', 'chinese_mt'];
  const tiers: PromptTier[] = ['hint', 'guided', 'solution'];
  const keys: Array<{ subject: PromptSubject; tier: PromptTier }> = [];
  for (const subject of subjects) {
    for (const tier of tiers) {
      keys.push({ subject, tier });
    }
  }
  return keys;
}
