import { describe, it, expect } from 'vitest';
import {
  buildFollowUpPrompt,
  buildFollowUpSystemPrompt,
  buildFollowUpUserPrompt,
} from '../prompts/follow-up';
import type { FollowUpContext } from '../types';

function makeContext(overrides: Partial<FollowUpContext> = {}): FollowUpContext {
  return {
    subject: 'math',
    grade: 3,
    language: 'en',
    originalQuestion: 'What is 48 divided by 12?',
    followUpQuestion: 'What is division?',
    ...overrides,
  };
}

describe('buildFollowUpPrompt', () => {
  it('returns system and user prompts', () => {
    const ctx = makeContext();
    const result = buildFollowUpPrompt(ctx);
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('user');
    expect(typeof result.system).toBe('string');
    expect(typeof result.user).toBe('string');
  });

  it('includes the follow-up question in the user prompt', () => {
    const ctx = makeContext({ followUpQuestion: 'How do I know when to divide?' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.user).toContain('How do I know when to divide?');
  });

  it('includes the original question in the system prompt', () => {
    const ctx = makeContext({ originalQuestion: '48 marbles divided into 6 bags' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('48 marbles divided into 6 bags');
  });

  it('includes previous hints when provided', () => {
    const ctx = makeContext({ previousHints: 'Think about sharing equally.' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('Think about sharing equally.');
  });

  it('includes placeholder text when no previous hints', () => {
    const ctx = makeContext({ previousHints: undefined });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('No hints given yet');
  });

  it('uses zh-Hans user prompt when language is zh-Hans', () => {
    const ctx = makeContext({
      language: 'zh-Hans',
      followUpQuestion: '除法是什么意思？',
    });
    const result = buildFollowUpPrompt(ctx);
    expect(result.user).toContain('学生的后续问题');
    expect(result.user).toContain('除法是什么意思？');
  });

  it('uses zh-Hans system prompt when language is zh-Hans', () => {
    const ctx = makeContext({ language: 'zh-Hans' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('你的任务');
    expect(result.system).toContain('之前的帮助');
    expect(result.system).toContain('还没有给出提示');
  });

  it('includes tone rules in system prompt', () => {
    const ctx = makeContext();
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('friendly');
    expect(result.system).toContain('Never give the full answer');
  });

  it('includes subject-specific instructions', () => {
    const ctx = makeContext({ subject: 'science' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('Claim, Evidence, Reasoning');
  });

  it('stays concise — instructs 2-4 sentences', () => {
    const ctx = makeContext({ language: 'en' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('2-4 sentences maximum');
  });

  it('stays concise — instructs 2-4 sentences in zh-Hans', () => {
    const ctx = makeContext({ language: 'zh-Hans' });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('最多回答2-4句话');
  });

  it('includes grade level in instructions', () => {
    const ctx = makeContext({ grade: 5 });
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).toContain('P5 student');
  });
});

describe('buildFollowUpSystemPrompt', () => {
  it('returns only the system prompt', () => {
    const ctx = makeContext();
    const result = buildFollowUpSystemPrompt(ctx);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });
});

describe('buildFollowUpUserPrompt', () => {
  it('returns only the user prompt', () => {
    const ctx = makeContext({ followUpQuestion: 'Help please' });
    const result = buildFollowUpUserPrompt(ctx);
    expect(result).toContain('Help please');
  });
});

describe('buildFollowUpPrompt — privacy constraint', () => {
  it('does not reference cloud or remote service', () => {
    const ctx = makeContext();
    const result = buildFollowUpPrompt(ctx);
    expect(result.system).not.toMatch(/cloud|server|upload|remote|online|internet|API/i);
  });
});
