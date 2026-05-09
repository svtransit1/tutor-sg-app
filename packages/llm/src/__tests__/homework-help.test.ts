import { describe, it, expect } from 'vitest';
import {
  buildHomeworkHelpPrompt,
  buildHomeworkHelpSystemPrompt,
  buildHomeworkHelpUserPrompt,
} from '../prompts/homework-help';
import { getToneConfig, buildToneSection } from '../prompts/tone';
import {
  getSubjectAdapter,
  buildSubjectSection,
} from '../prompts/subject-adapters';
import { isGrade, ensureGrade } from '../types';
import type { PromptContext, Subject, Grade, Language } from '../types';
import sampleOutputs from './fixtures/sample-outputs.json';

const ALL_SUBJECTS: Subject[] = ['math', 'english', 'chinese_mt', 'science'];
const ALL_LANGUAGES: Language[] = ['en', 'zh-Hans'];
const ALL_GRADES: Grade[] = [1, 2, 3, 4, 5, 6];

function makeContext(overrides: Partial<PromptContext> = {}): PromptContext {
  return {
    subject: 'math',
    grade: 3,
    language: 'en',
    questionText: 'What is 48 divided by 12?',
    requestedLevel: 'all',
    ...overrides,
  };
}

describe('buildHomeworkHelpPrompt', () => {
  it('returns system and user prompts', () => {
    const ctx = makeContext();
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('user');
    expect(typeof result.system).toBe('string');
    expect(typeof result.user).toBe('string');
    expect(result.system.length).toBeGreaterThan(100);
    expect(result.user.length).toBeGreaterThan(10);
  });

  it('includes the question text in the user prompt', () => {
    const ctx = makeContext({ questionText: 'Find 3/4 of 20' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('Find 3/4 of 20');
  });

  it('includes tone rules in the system prompt', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('friendly');
    expect(result.system).toContain('Never give the full answer immediately');
    expect(result.system).toContain('Never say');
  });

  it('includes scaffold section in the system prompt', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('Hint');
    expect(result.system).toContain('Guided Steps');
    expect(result.system).toContain('Worked Solution');
  });

  it('includes subject-specific instructions for math', () => {
    const ctx = makeContext({ subject: 'math' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('step-by-step');
    expect(result.system).toContain('model drawing');
  });

  it('includes subject-specific instructions for science (CER)', () => {
    const ctx = makeContext({ subject: 'science' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('Claim, Evidence, Reasoning');
    expect(result.system).toContain('variable');
  });

  it('includes subject-specific instructions for chinese_mt', () => {
    const ctx = makeContext({ subject: 'chinese_mt', language: 'zh-Hans' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('简体中文');
    expect(result.system).toContain('拼音');
  });

  it('includes forbidden patterns for each subject', () => {
    for (const subject of ALL_SUBJECTS) {
      const ctx = makeContext({ subject });
      const result = buildHomeworkHelpPrompt(ctx);
      expect(result.system).toContain('DO NOT DO');
    }
  });

  it('includes grade-level adaptation', () => {
    const ctx = makeContext({ grade: 1 });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('Lower Primary');
    expect(result.system).toContain('simple words');
  });

  it('includes P6 PSLE alignment', () => {
    const ctx = makeContext({ grade: 6 });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('Upper Primary');
    expect(result.system).toContain('PSLE');
  });

  it('uses zh-Hans language sections when language is zh-Hans', () => {
    const ctx = makeContext({ language: 'zh-Hans' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('角色');
    expect(result.system).toContain('提示');
    expect(result.system).toContain('引导步骤');
    expect(result.system).toContain('完整解答');
  });

  it('uses English language sections when language is en', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('## Role');
    expect(result.system).toContain('## Tone Rules');
    expect(result.system).toContain('## Scaffolding Rules');
  });
});

describe('buildHomeworkHelpPrompt — all subjects × languages', () => {
  for (const subject of ALL_SUBJECTS) {
    for (const lang of ALL_LANGUAGES) {
      it(`builds prompt for ${subject} in ${lang}`, () => {
        const ctx = makeContext({ subject, language: lang });
        const result = buildHomeworkHelpPrompt(ctx);
        expect(result.system.length).toBeGreaterThan(100);
        expect(result.user.length).toBeGreaterThan(10);
      });
    }
  }
});

describe('buildHomeworkHelpPrompt — all grades', () => {
  for (const grade of ALL_GRADES) {
    it(`builds prompt for P${grade}`, () => {
      const ctx = makeContext({ grade });
      const result = buildHomeworkHelpPrompt(ctx);
      expect(result.system).toContain(`P${grade}`);
    });
  }
});

describe('buildHomeworkHelpPrompt — scaffold levels', () => {
  it('hint level instruction limits to hint only', () => {
    const ctx = makeContext({ requestedLevel: 'hint' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('student only needs a hint');
    expect(result.user).toContain('do NOT give away');
  });

  it('steps level instruction', () => {
    const ctx = makeContext({ requestedLevel: 'steps' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('guided steps');
    expect(result.user).toContain('do NOT reveal the final answer');
  });

  it('solution level instruction', () => {
    const ctx = makeContext({ requestedLevel: 'solution' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('full worked solution');
    expect(result.user).toContain('Show all working');
  });

  it('all level instruction', () => {
    const ctx = makeContext({ requestedLevel: 'all' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('Provide all three levels');
  });
});

describe('buildHomeworkHelpPrompt — previous attempts', () => {
  it('includes previous attempts when provided', () => {
    const ctx = makeContext({
      previousAttempts: 'I tried 48 + 12 = 60, but that seems wrong',
    });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).toContain('previous attempt');
    expect(result.user).toContain('48 + 12 = 60');
  });

  it('does not include previous attempts section when not provided', () => {
    const ctx = makeContext({ previousAttempts: undefined });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.user).not.toContain('previous attempt');
  });
});

describe('buildHomeworkHelpPrompt — encouragement phrases', () => {
  it('includes encouragement phrases in English', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain("Good try!");
    expect(result.system).toContain("You've got this!");
  });

  it('includes encouragement phrases in Chinese', () => {
    const ctx = makeContext({ language: 'zh-Hans' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('试得好');
    expect(result.system).toContain('你可以的');
  });
});

describe('buildHomeworkHelpPrompt — privacy constraint', () => {
  it('does not reference any cloud or remote service', () => {
    for (const subject of ALL_SUBJECTS) {
      const ctx = makeContext({ subject });
      const result = buildHomeworkHelpPrompt(ctx);
      expect(result.system).not.toMatch(/cloud|server|upload|remote|online|internet|API/i);
    }
  });
});

describe('buildHomeworkHelpPrompt — JSON output format instruction', () => {
  it('includes JSON structure in system prompt', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('"hint"');
    expect(result.system).toContain('"guidedSteps"');
    expect(result.system).toContain('"workedSolution"');
  });

  it('warns against markdown code fences', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('No markdown code fences');
  });
});

describe('buildHomeworkHelpSystemPrompt', () => {
  it('returns only the system prompt', () => {
    const ctx = makeContext();
    const result = buildHomeworkHelpSystemPrompt(ctx);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });
});

describe('buildHomeworkHelpUserPrompt', () => {
  it('returns only the user prompt', () => {
    const ctx = makeContext();
    const result = buildHomeworkHelpUserPrompt(ctx);
    expect(typeof result).toBe('string');
    expect(result).toContain('What is 48 divided by 12?');
  });
});

describe('tone', () => {
  it('getToneConfig returns config for en', () => {
    const config = getToneConfig('en');
    expect(config.language).toBe('en');
    expect(config.rules.length).toBeGreaterThan(0);
    expect(config.encouragementPhrases.length).toBeGreaterThan(0);
  });

  it('getToneConfig returns config for zh-Hans', () => {
    const config = getToneConfig('zh-Hans');
    expect(config.language).toBe('zh-Hans');
    expect(config.rules.length).toBeGreaterThan(0);
    expect(config.encouragementPhrases.length).toBeGreaterThan(0);
  });

  it('buildToneSection contains role header in en', () => {
    const section = buildToneSection('en');
    expect(section).toContain('## Role');
    expect(section).toContain('tutor-sg');
  });

  it('buildToneSection contains rules in zh-Hans', () => {
    const section = buildToneSection('zh-Hans');
    expect(section).toContain('## 角色');
    expect(section).toContain('永远不要立即给出完整答案');
  });
});

describe('subject adapters', () => {
  it('returns math adapter with model drawing', () => {
    const adapter = getSubjectAdapter('math', 'en');
    expect(adapter.subject).toBe('math');
    expect(adapter.instruction).toContain('model drawing');
    expect(adapter.exampleHints.length).toBeGreaterThan(0);
    expect(adapter.forbiddenPatterns.length).toBeGreaterThan(0);
  });

  it('returns english adapter with grammar rule', () => {
    const adapter = getSubjectAdapter('english', 'en');
    expect(adapter.instruction).toContain('grammar');
    expect(adapter.forbiddenPatterns.some((p) => p.includes('composition'))).toBe(true);
  });

  it('returns science adapter with CER', () => {
    const adapter = getSubjectAdapter('science', 'en');
    expect(adapter.instruction).toContain('Claim, Evidence, Reasoning');
  });

  it('returns chinese_mt adapter with 拼音', () => {
    const adapter = getSubjectAdapter('chinese_mt', 'zh-Hans');
    expect(adapter.instruction).toContain('拼音');
  });

  it('chinese_mt adapter forbids Traditional Chinese', () => {
    const adapter = getSubjectAdapter('chinese_mt', 'en');
    expect(adapter.forbiddenPatterns.some((p) => p.includes('Traditional Chinese'))).toBe(true);
  });

  it('buildSubjectSection contains DO NOT DO', () => {
    const section = buildSubjectSection('math', 'en');
    expect(section).toContain('DO NOT DO');
    expect(section).toContain('Subject-Specific Instructions');
  });

  it('every subject has en and zh-Hans adapters', () => {
    for (const subject of ALL_SUBJECTS) {
      expect(() => getSubjectAdapter(subject, 'en')).not.toThrow();
      expect(() => getSubjectAdapter(subject, 'zh-Hans')).not.toThrow();
    }
  });
});

describe('types', () => {
  it('isGrade returns true for valid grades', () => {
    expect(isGrade(1)).toBe(true);
    expect(isGrade(3)).toBe(true);
    expect(isGrade(6)).toBe(true);
  });

  it('isGrade returns false for invalid grades', () => {
    expect(isGrade(0)).toBe(false);
    expect(isGrade(7)).toBe(false);
    expect(isGrade(1.5)).toBe(false);
  });

  it('ensureGrade throws for invalid grades', () => {
    expect(() => ensureGrade(0)).toThrow();
    expect(() => ensureGrade(7)).toThrow();
  });

  it('ensureGrade returns valid grades', () => {
    expect(ensureGrade(1)).toBe(1);
    expect(ensureGrade(6)).toBe(6);
  });
});

describe('sample output fixture validation', () => {
  it('math sample has correct structure', () => {
    const sample = sampleOutputs.math_p3_en as Record<string, unknown>;
    expect(sample).toHaveProperty('hint');
    expect(sample).toHaveProperty('guidedSteps');
    expect(sample).toHaveProperty('workedSolution');
    expect(Array.isArray(sample.guidedSteps)).toBe(true);
    expect((sample.guidedSteps as string[]).length).toBeGreaterThanOrEqual(2);
  });

  it('chinese mt sample is in Chinese', () => {
    const sample = sampleOutputs.chinese_mt_p4_zh as Record<string, unknown>;
    const hint = sample.hint as string;
    expect(hint).toMatch(/[\u4e00-\u9fff]/);
  });
});

describe('few-shot examples', () => {
  it('includes few-shot examples in English system prompt', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('Few-Shot Examples');
    expect(result.system).toContain('Siti has 48 stickers');
    expect(result.system).toContain('Example 1 — Math');
    expect(result.system).toContain('Example 2 — English');
    expect(result.system).toContain('Example 3 — Science');
  });

  it('includes few-shot examples in Chinese system prompt', () => {
    const ctx = makeContext({ language: 'zh-Hans' });
    const result = buildHomeworkHelpPrompt(ctx);
    expect(result.system).toContain('示例');
    expect(result.system).toContain('Siti有48张贴纸');
    expect(result.system).toContain('示例1 — 数学');
    expect(result.system).toContain('示例2 — 英文');
    expect(result.system).toContain('示例3 — 科学');
  });
});
