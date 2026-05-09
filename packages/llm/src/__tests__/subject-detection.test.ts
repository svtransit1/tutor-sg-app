import { describe, it, expect } from 'vitest';
import {
  buildSubjectDetectionPrompt,
  parseSubjectDetectionResult,
} from '../prompts/subject-detection';
import type { SubjectDetectionResult } from '../types';

describe('buildSubjectDetectionPrompt', () => {
  it('returns system and user prompts for English questions', () => {
    const result = buildSubjectDetectionPrompt('What is 8 times 7?');
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('user');
    expect(result.system).toContain('subject classifier');
    expect(result.user).toContain('What is 8 times 7?');
  });

  it('returns system and user prompts for Chinese questions', () => {
    const result = buildSubjectDetectionPrompt('小明有48颗弹珠，他给了朋友1/4。他还剩多少颗？');
    expect(result.system).toContain('学科分类器');
    expect(result.user).toContain('请分类这道题');
  });

  it('includes classification rules for all 4 subjects in EN', () => {
    const result = buildSubjectDetectionPrompt('test question');
    expect(result.system).toContain('math');
    expect(result.system).toContain('english');
    expect(result.system).toContain('science');
    expect(result.system).toContain('chinese_mt');
  });

  it('includes classification rules for all 4 subjects in ZH', () => {
    const result = buildSubjectDetectionPrompt('测试题');
    expect(result.system).toContain('数学');
  });

  it('includes grade level guidance in EN', () => {
    const result = buildSubjectDetectionPrompt('test');
    expect(result.system).toContain('P1-P2');
    expect(result.system).toContain('P3-P4');
    expect(result.system).toContain('P5-P6');
  });

  it('includes few-shot examples in EN', () => {
    const result = buildSubjectDetectionPrompt('test');
    expect(result.system).toContain('Few-Shot Examples');
    expect(result.system).toContain('John has 48 marbles');
    expect(result.system).toContain('grammar');
    expect(result.system).toContain('caterpillar');
  });

  it('includes few-shot examples in ZH', () => {
    const result = buildSubjectDetectionPrompt('测试');
    expect(result.system).toContain('示例');
    expect(result.system).toContain('小明有48颗弹珠');
  });

  it('uses English system prompt for English questions', () => {
    const result = buildSubjectDetectionPrompt('What is photosynthesis?');
    expect(result.system).toContain('Singapore primary school');
    expect(result.user).toContain('Classify this question:');
  });

  it('uses Chinese system prompt for Chinese questions', () => {
    const result = buildSubjectDetectionPrompt('什么是光合作用？');
    expect(result.system).toContain('新加坡小学');
    expect(result.user).toContain('请分类这道题');
  });
});

describe('parseSubjectDetectionResult', () => {
  it('parses valid JSON', () => {
    const raw = '{"subject": "math", "topic": "Fractions", "level": 4, "language": "en"}';
    const result = parseSubjectDetectionResult(raw);
    expect(result).toEqual({
      subject: 'math',
      topic: 'Fractions',
      level: 4,
      language: 'en',
    } satisfies SubjectDetectionResult);
  });

  it('parses Chinese MT result', () => {
    const raw = '{"subject": "chinese_mt", "topic": "造句", "level": 4, "language": "zh-Hans"}';
    const result = parseSubjectDetectionResult(raw);
    expect(result).toEqual({
      subject: 'chinese_mt',
      topic: '造句',
      level: 4,
      language: 'zh-Hans',
    } satisfies SubjectDetectionResult);
  });

  it('parses science result', () => {
    const raw = '{"subject": "science", "topic": "Cycles - Water", "level": 5, "language": "en"}';
    const result = parseSubjectDetectionResult(raw);
    expect(result).toEqual({
      subject: 'science',
      topic: 'Cycles - Water',
      level: 5,
      language: 'en',
    } satisfies SubjectDetectionResult);
  });

  it('parses JSON with surrounding whitespace', () => {
    const raw = '  \n{"subject": "math", "topic": "Division", "level": 3, "language": "en"}\n  ';
    const result = parseSubjectDetectionResult(raw);
    expect(result).not.toBeNull();
    expect(result!.subject).toBe('math');
  });

  it('parses JSON with markdown preamble', () => {
    const raw = 'Here is the classification:\n{"subject": "english", "topic": "Grammar", "level": 3, "language": "en"}';
    const result = parseSubjectDetectionResult(raw);
    expect(result).not.toBeNull();
    expect(result!.subject).toBe('english');
  });

  it('returns null for invalid subject', () => {
    const result = parseSubjectDetectionResult('{"subject": "history", "topic": "WWII", "level": 5, "language": "en"}');
    expect(result).toBeNull();
  });

  it('returns null for invalid level', () => {
    const result = parseSubjectDetectionResult('{"subject": "math", "topic": "Test", "level": 7, "language": "en"}');
    expect(result).toBeNull();
  });

  it('returns null for invalid language', () => {
    const result = parseSubjectDetectionResult('{"subject": "math", "topic": "Test", "level": 3, "language": "fr"}');
    expect(result).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    const result = parseSubjectDetectionResult('not json at all');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = parseSubjectDetectionResult('');
    expect(result).toBeNull();
  });

  it('handles missing topic field gracefully', () => {
    const raw = '{"subject": "math", "level": 3, "language": "en"}';
    const result = parseSubjectDetectionResult(raw);
    expect(result).not.toBeNull();
    expect(result!.topic).toBe('');
  });
});
