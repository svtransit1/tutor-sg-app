import {
  getTemplate,
  listTemplateKeys,
  renderPrompt,
  TIER_TOKEN_BUDGETS,
  type PromptTemplate,
  type PromptSubject,
  type PromptTier,
  type PromptLanguage,
  type RenderContext,
  type RenderedPrompt,
} from '../index';
import SAMPLE_QUESTIONS from './fixtures/sample-questions';

const SUBJECTS: PromptSubject[] = ['math', 'english', 'science', 'chinese_mt'];
const TIERS: PromptTier[] = ['hint', 'guided', 'solution'];
const LANGUAGES: PromptLanguage[] = ['en', 'zh-Hans'];

function defaultRenderCtx(overrides?: Partial<RenderContext>): RenderContext {
  return {
    problemText: 'What is 2 + 2?',
    grade: 'P3',
    language: 'en',
    attempt: 1,
    ...overrides,
  };
}

describe('template registration', () => {
  it('all 4 subjects × 3 tiers are registered', () => {
    const keys = listTemplateKeys();
    expect(keys.length).toBe(12);
    for (const subject of SUBJECTS) {
      for (const tier of TIERS) {
        expect(keys).toContainEqual({ subject, tier });
      }
    }
  });

  it('getTemplate returns a valid PromptTemplate for every subject × tier', () => {
    for (const subject of SUBJECTS) {
      for (const tier of TIERS) {
        const tpl = getTemplate(subject, tier);
        expect(tpl).toBeDefined();
        expect(typeof tpl.systemPrompt).toBe('object');
        expect(typeof tpl.userTemplate).toBe('object');
        expect(typeof tpl.maxTokens).toBe('number');
        expect(typeof tpl.temperature).toBe('number');
      }
    }
  });

  it('maxTokens matches TIER_TOKEN_BUDGETS for each tier', () => {
    for (const subject of SUBJECTS) {
      for (const tier of TIERS) {
        const tpl = getTemplate(subject, tier);
        expect(tpl.maxTokens).toBe(TIER_TOKEN_BUDGETS[tier]);
      }
    }
  });

  it('temperature decreases from hint (most creative) to solution (most deterministic)', () => {
    for (const subject of SUBJECTS) {
      const hint = getTemplate(subject, 'hint');
      const guided = getTemplate(subject, 'guided');
      const solution = getTemplate(subject, 'solution');
      expect(hint.temperature).toBeGreaterThanOrEqual(guided.temperature);
      expect(guided.temperature).toBeGreaterThanOrEqual(solution.temperature);
    }
  });
});

describe('bilingual completeness', () => {
  it('every template has both en and zh-Hans for systemPrompt', () => {
    for (const subject of SUBJECTS) {
      for (const tier of TIERS) {
        const tpl = getTemplate(subject, tier);
        expect(tpl.systemPrompt.en.length).toBeGreaterThan(10);
        expect(tpl.systemPrompt['zh-Hans'].length).toBeGreaterThan(10);
      }
    }
  });

  it('every template has both en and zh-Hans for userTemplate', () => {
    for (const subject of SUBJECTS) {
      for (const tier of TIERS) {
        const tpl = getTemplate(subject, tier);
        expect(tpl.userTemplate.en.length).toBeGreaterThan(10);
        expect(tpl.userTemplate['zh-Hans'].length).toBeGreaterThan(10);
      }
    }
  });
});

describe('template rendering', () => {
  it('fills {problemText} placeholder', () => {
    const result = renderPrompt(
      getTemplate('math', 'hint'),
      'math',
      'hint',
      defaultRenderCtx({ problemText: '45 + 37 = ?' }),
    );
    expect(result.systemPrompt).not.toContain('{problemText}');
    expect(result.userPrompt).toContain('45 + 37 = ?');
  });

  it('fills {grade} placeholder', () => {
    const result = renderPrompt(
      getTemplate('english', 'guided'),
      'english',
      'guided',
      defaultRenderCtx({ grade: 'P5' }),
    );
    expect(result.systemPrompt).toContain('P5');
    expect(result.userPrompt).toContain('P5');
  });

  it('fills {attempt} placeholder', () => {
    const result = renderPrompt(
      getTemplate('science', 'solution'),
      'science',
      'solution',
      defaultRenderCtx({ attempt: 3 }),
    );
    expect(result.userPrompt).toContain('3');
  });

  it('fills {topic} placeholder when provided', () => {
    const result = renderPrompt(
      getTemplate('science', 'guided'),
      'science',
      'guided',
      defaultRenderCtx({ topic: 'Water Cycle' }),
    );
    expect(result.systemPrompt).toContain('Water Cycle');
  });

  it('leaves {topic} empty when not provided', () => {
    const result = renderPrompt(
      getTemplate('math', 'hint'),
      'math',
      'hint',
      defaultRenderCtx({ topic: undefined }),
    );
    expect(result.systemPrompt).not.toContain('{topic}');
  });

  it('defaults attempt to 1 when not provided', () => {
    const result = renderPrompt(
      getTemplate('english', 'hint'),
      'english',
      'hint',
      defaultRenderCtx({ attempt: undefined }),
    );
    expect(result.userPrompt).not.toContain('{attempt}');
  });

  it('renders zh-Hans output when language is zh-Hans', () => {
    const result = renderPrompt(
      getTemplate('chinese_mt', 'hint'),
      'chinese_mt',
      'hint',
      defaultRenderCtx({ language: 'zh-Hans' }),
    );
    expect(result.systemPrompt.length).toBeGreaterThan(10);
    expect(result.userPrompt).toContain('华文');
  });

  it('returns correct RenderedPrompt metadata', () => {
    const result = renderPrompt(
      getTemplate('math', 'solution'),
      'math',
      'solution',
      defaultRenderCtx(),
    );
    expect(result.subject).toBe('math');
    expect(result.tier).toBe('solution');
    expect(result.maxTokens).toBe(1024);
    expect(result.temperature).toBe(0.3);
  });
});

describe('per-subject template uniqueness', () => {
  it('each subject has distinct system prompts (not cross-contaminated)', () => {
    const englishHint = getTemplate('english', 'hint').systemPrompt.en;
    const mathHint = getTemplate('math', 'hint').systemPrompt.en;
    const scienceHint = getTemplate('science', 'hint').systemPrompt.en;
    const chineseHint = getTemplate('chinese_mt', 'hint').systemPrompt.en;

    expect(englishHint).toContain('English');
    expect(mathHint).toContain('Math');
    expect(scienceHint).toContain('Science');
    expect(chineseHint).toContain('Chinese');
  });

  it('each tier for a subject is distinct', () => {
    const mathHint = getTemplate('math', 'hint').systemPrompt.en;
    const mathGuided = getTemplate('math', 'guided').systemPrompt.en;
    const mathSolution = getTemplate('math', 'solution').systemPrompt.en;
    expect(mathHint).not.toEqual(mathGuided);
    expect(mathGuided).not.toEqual(mathSolution);
  });
});

describe('renderPrompt edge cases', () => {
  it('handles empty problemText gracefully', () => {
    const result = renderPrompt(
      getTemplate('english', 'hint'),
      'english',
      'hint',
      defaultRenderCtx({ problemText: '' }),
    );
    expect(result.userPrompt).toBeDefined();
    expect(result.systemPrompt.length).toBeGreaterThan(10);
  });

  it('handles very long problemText', () => {
    const longText = 'A. ' + 'x'.repeat(2000);
    const result = renderPrompt(
      getTemplate('science', 'guided'),
      'science',
      'guided',
      defaultRenderCtx({ problemText: longText }),
    );
    expect(result.userPrompt).toContain('x'.repeat(2000));
  });
});

describe('sample questions — rendered prompt validation', () => {
  it.each(SAMPLE_QUESTIONS.map((q) => [q.description, q]))(
    '%s — renders valid prompts for all 3 tiers',
    (_desc: string, q: typeof SAMPLE_QUESTIONS[number]) => {
      for (const tier of TIERS) {
        const ctx: RenderContext = {
          problemText: q.problemText,
          grade: q.grade,
          language: q.language,
          attempt: 1,
          topic: q.topic,
        };
        const result = renderPrompt(getTemplate(q.subject, tier), q.subject, tier, ctx);

        expect(result.subject).toBe(q.subject);
        expect(result.tier).toBe(tier);
        expect(result.maxTokens).toBe(TIER_TOKEN_BUDGETS[tier]);
        expect(typeof result.temperature).toBe('number');
        expect(result.systemPrompt.length).toBeGreaterThan(50);
        expect(result.userPrompt.length).toBeGreaterThan(20);
        expect(result.userPrompt).toContain(q.problemText);
        expect(result.userPrompt).toContain(q.grade);
      }
    },
  );

  it('all 12 sample questions render hint prompts that forbid giving answers', () => {
    for (const q of SAMPLE_QUESTIONS) {
      const ctx: RenderContext = {
        problemText: q.problemText,
        grade: q.grade,
        language: q.language,
        attempt: 1,
        topic: q.topic,
      };
      const result = renderPrompt(getTemplate(q.subject, 'hint'), q.subject, 'hint', ctx);

      if (q.language === 'zh-Hans') {
        expect(result.systemPrompt).toMatch(/不要直接|不给答案|不给.*答案/);
      } else {
        expect(result.systemPrompt).toMatch(/NEVER|never give|Hint/i);
      }
    }
  });

  it('sample questions produce distinct prompts per tier per subject', () => {
    const promptsBySubject: Record<string, Set<string>> = {};
    for (const q of SAMPLE_QUESTIONS) {
      const key = `${q.subject}:${q.description}`;
      const prompts = new Set<string>();
      for (const tier of TIERS) {
        const ctx: RenderContext = {
          problemText: q.problemText,
          grade: q.grade,
          language: q.language,
          attempt: 1,
          topic: q.topic,
        };
        const result = renderPrompt(getTemplate(q.subject, tier), q.subject, tier, ctx);
        prompts.add(result.systemPrompt);
      }
      expect(prompts.size).toBe(3);
      promptsBySubject[key] = prompts;
    }
  });

  it('all 4 subjects have at least 3 sample questions', () => {
    const counts: Record<string, number> = {};
    for (const q of SAMPLE_QUESTIONS) {
      counts[q.subject] = (counts[q.subject] ?? 0) + 1;
    }
    for (const subject of SUBJECTS) {
      expect(counts[subject]).toBeGreaterThanOrEqual(3);
    }
  });
});
