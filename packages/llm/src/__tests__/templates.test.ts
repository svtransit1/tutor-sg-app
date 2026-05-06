import {
  getTemplate,
  listTemplateKeys,
  renderPrompt,
  TIER_TOKEN_BUDGETS,
} from '../index';
import type { PromptSubject, PromptTier, RenderContext } from '../types';

describe('prompt templates', () => {
  describe('listTemplateKeys', () => {
    it('returns all 12 subject × tier combinations (4 subjects × 3 tiers)', () => {
      const keys = listTemplateKeys();
      expect(keys).toHaveLength(12);

      const subjects = new Set(keys.map((k) => k.subject));
      expect(subjects).toEqual(new Set(['math', 'english', 'science', 'chinese_mt']));

      const tiers = new Set(keys.map((k) => k.tier));
      expect(tiers).toEqual(new Set(['hint', 'guided', 'solution']));
    });
  });

  describe('getTemplate', () => {
    const subjects: PromptSubject[] = ['math', 'english', 'science', 'chinese_mt'];
    const tiers: PromptTier[] = ['hint', 'guided', 'solution'];

    for (const subject of subjects) {
      for (const tier of tiers) {
        it(`returns a valid template for ${subject}/${tier}`, () => {
          const template = getTemplate(subject, tier);

          expect(template.systemPrompt.en).toBeTruthy();
          expect(template.systemPrompt['zh-Hans']).toBeTruthy();
          expect(template.userTemplate.en).toBeTruthy();
          expect(template.userTemplate['zh-Hans']).toBeTruthy();
          expect(template.maxTokens).toBeGreaterThan(0);
          expect(template.temperature).toBeGreaterThanOrEqual(0);
          expect(template.temperature).toBeLessThanOrEqual(1);
        });
      }
    }
  });

  describe('token budgets', () => {
    it('has budgets for all tiers', () => {
      expect(TIER_TOKEN_BUDGETS.hint).toBeDefined();
      expect(TIER_TOKEN_BUDGETS.guided).toBeDefined();
      expect(TIER_TOKEN_BUDGETS.solution).toBeDefined();
    });

    it('scales up from hint to solution', () => {
      expect(TIER_TOKEN_BUDGETS.hint).toBeLessThan(TIER_TOKEN_BUDGETS.guided);
      expect(TIER_TOKEN_BUDGETS.guided).toBeLessThan(TIER_TOKEN_BUDGETS.solution);
    });

    it('matches template maxTokens for each subject/tier', () => {
      for (const { subject, tier } of listTemplateKeys()) {
        const template = getTemplate(subject, tier);
        expect(template.maxTokens).toBe(TIER_TOKEN_BUDGETS[tier]);
      }
    });
  });
});

describe('prompt renderer', () => {
  const baseCtx: RenderContext = {
    problemText: 'What is 3/4 + 1/2?',
    grade: 'P3',
    language: 'en',
    attempt: 1,
  };

  it('renders an English hint prompt for math', () => {
    const template = getTemplate('math', 'hint');
    const result = renderPrompt(template, 'math', 'hint', baseCtx);

    expect(result.systemPrompt).toContain('friendly');
    expect(result.systemPrompt).toContain('Math');
    expect(result.systemPrompt).toContain('P3'); // {grade} filled in system prompt
    expect(result.userPrompt).toContain('What is 3/4 + 1/2?');
    expect(result.maxTokens).toBe(TIER_TOKEN_BUDGETS.hint);
    expect(result.tier).toBe('hint');
    expect(result.subject).toBe('math');
  });

  it('renders a Chinese solution prompt for chinese_mt', () => {
    const template = getTemplate('chinese_mt', 'solution');
    const ctx: RenderContext = {
      ...baseCtx,
      problemText: '请写出"春天"的反义词。',
      language: 'zh-Hans',
    };
    const result = renderPrompt(template, 'chinese_mt', 'solution', ctx);

    expect(result.systemPrompt).toContain('简体中文');
    expect(result.userPrompt).toContain('请写出');
    expect(result.maxTokens).toBe(TIER_TOKEN_BUDGETS.solution);
    expect(result.temperature).toBeLessThan(0.5); // solution = deterministic
  });

  it('renders a guided prompt with custom topic and attempt', () => {
    const template = getTemplate('science', 'guided');
    const ctx: RenderContext = {
      ...baseCtx,
      problemText: 'Why do plants need sunlight?',
      topic: 'photosynthesis',
      attempt: 2,
    };
    const result = renderPrompt(template, 'science', 'guided', ctx);

    expect(result.systemPrompt).toContain('photosynthesis'); // topic in system prompt
    expect(result.userPrompt).toContain('2'); // attempt number in user prompt
  });

  it('defaults attempt to 1 when not provided', () => {
    const template = getTemplate('math', 'guided');
    const ctx: RenderContext = {
      problemText: 'Solve for x: 2x + 3 = 11',
      grade: 'P5',
      language: 'en',
    };
    const result = renderPrompt(template, 'math', 'guided', ctx);

    expect(result.userPrompt).toContain('1 attempt');
  });

  it('handles empty topic gracefully', () => {
    const template = getTemplate('english', 'hint');
    const ctx: RenderContext = {
      problemText: 'Choose the correct word: She (is/are) happy.',
      grade: 'P2',
      language: 'en',
      topic: '',
    };
    const result = renderPrompt(template, 'english', 'hint', ctx);

    expect(result.userPrompt).toBeTruthy();
  });

  it('uses lower temperature for guided and solution tiers', () => {
    const hint = getTemplate('math', 'hint');
    const guided = getTemplate('math', 'guided');
    const solution = getTemplate('math', 'solution');

    expect(hint.temperature).toBeGreaterThan(guided.temperature);
    expect(guided.temperature).toBeGreaterThanOrEqual(solution.temperature);
  });
});

describe('bilingual completeness', () => {
  for (const { subject, tier } of listTemplateKeys()) {
    it(`${subject}/${tier} has non-empty EN and zh-Hans system prompts`, () => {
      const template = getTemplate(subject, tier);
      expect(template.systemPrompt.en.length).toBeGreaterThan(50);
      expect(template.systemPrompt['zh-Hans'].length).toBeGreaterThan(20);
    });

    it(`${subject}/${tier} has non-empty EN and zh-Hans user templates`, () => {
      const template = getTemplate(subject, tier);
      expect(template.userTemplate.en.length).toBeGreaterThan(10);
      expect(template.userTemplate['zh-Hans'].length).toBeGreaterThan(10);
    });
  }
});
