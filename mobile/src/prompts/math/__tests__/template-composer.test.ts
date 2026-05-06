import {
  composeMathPrompt,
  getSystemPromptOnly,
  getScaffoldById,
  getScaffoldsByGrade,
  TOPIC_SCAFFOLDS,
  INJECTION_GUARD,
  MATH_TUTOR_SYSTEM_PROMPT,
  getHintTemplate,
} from '../index';

describe('Math prompt templates', () => {
  describe('composeMathPrompt', () => {
    it('assembles a complete prompt with all sections', () => {
      const result = composeMathPrompt({
        subject: 'math',
        grade: 'P1',
        topicId: 'p1-addition-within-10',
        language: 'en',
        hintLevel: 1,
        studentQuestion: 'What is 3 + 5?',
        priorHintsGiven: 0,
      });

      expect(result).toContain('friendly, patient math tutor');
      expect(result).toContain('Security Rules');
      expect(result).toContain('Addition within 10');
      expect(result).toContain('Level 1 hint');
      expect(result).toContain('What is 3 + 5?');
    });

    it('includes hint history when priorHintsGiven > 0', () => {
      const result = composeMathPrompt({
        subject: 'math',
        grade: 'P1',
        topicId: 'p1-addition-within-10',
        language: 'en',
        hintLevel: 2,
        studentQuestion: 'What is 3 + 5?',
        priorHintsGiven: 1,
      });

      expect(result).toContain('already given 1 hint');
    });

    it('works in zh-Hans', () => {
      const result = composeMathPrompt({
        subject: 'math',
        grade: 'P2',
        topicId: 'p2-multiplication-concept',
        language: 'zh-Hans',
        hintLevel: 1,
        studentQuestion: '3 × 4等于多少？',
        priorHintsGiven: 0,
      });

      expect(result).toContain('友好、耐心的数学导师');
      expect(result).toContain('安全规则');
      expect(result).toContain('乘法');
      expect(result).toContain('3 × 4等于多少？');
    });

    it('works when topicId does not match any scaffold', () => {
      const result = composeMathPrompt({
        subject: 'math',
        grade: 'P3',
        topicId: 'unknown-topic',
        language: 'en',
        hintLevel: 1,
        studentQuestion: 'Some question',
        priorHintsGiven: 0,
      });

      expect(result).toContain('friendly, patient math tutor');
      expect(result).toContain('Security Rules');
      expect(result).toContain('Some question');
    });
  });

  describe('getSystemPromptOnly', () => {
    it('returns system prompt + guard for EN', () => {
      const result = getSystemPromptOnly('en');
      expect(result).toContain('friendly, patient math tutor');
      expect(result).toContain('Security Rules');
    });

    it('returns system prompt + guard for zh-Hans', () => {
      const result = getSystemPromptOnly('zh-Hans');
      expect(result).toContain('友好、耐心的数学导师');
      expect(result).toContain('安全规则');
    });
  });

  describe('getHintTemplate', () => {
    it('returns Level 1 template with systemInstruction', () => {
      const tmpl = getHintTemplate('level1_nudge', 'en');
      expect(tmpl.systemInstruction).toContain('Level 1');
      expect(tmpl.responseTemplate).toContain('{concept}');
    });

    it('returns Level 4 template for full solution', () => {
      const tmpl = getHintTemplate('level4_full', 'en');
      expect(tmpl.systemInstruction).toContain('full solution');
    });
  });

  describe('getScaffoldById', () => {
    it('finds a P1 scaffold', () => {
      const s = getScaffoldById('p1-addition-within-10');
      expect(s).toBeDefined();
      expect(s?.grade).toBe('P1');
      expect(s?.level1.en).toContain('count');
    });

    it('finds a P3 scaffold', () => {
      const s = getScaffoldById('p3-bar-model-word-problems');
      expect(s).toBeDefined();
      expect(s?.grade).toBe('P3');
    });

    it('returns undefined for unknown id', () => {
      expect(getScaffoldById('nonexistent')).toBeUndefined();
    });
  });

  describe('getScaffoldsByGrade', () => {
    it('returns 5 scaffolds for each grade', () => {
      expect(getScaffoldsByGrade('P1').length).toBe(5);
      expect(getScaffoldsByGrade('P2').length).toBe(5);
      expect(getScaffoldsByGrade('P3').length).toBe(5);
    });
  });

  describe('injection guard', () => {
    it('EN guard mentions jailbreak refusal', () => {
      expect(INJECTION_GUARD.en).toContain('ignore previous instructions');
      expect(INJECTION_GUARD.en).toContain('I\'m here to help you learn');
    });

    it('zh-Hans guard mentions jailbreak refusal', () => {
      expect(INJECTION_GUARD['zh-Hans']).toContain('忽略之前的指示');
      expect(INJECTION_GUARD['zh-Hans']).toContain('我是来帮你学习的');
    });
  });

  describe('bilingual completeness', () => {
    it('every scaffold has EN text', () => {
      for (const s of TOPIC_SCAFFOLDS) {
        expect(s.level1.en.length).toBeGreaterThan(0);
        expect(s.level2.en.length).toBeGreaterThan(0);
        expect(s.level3.en.length).toBeGreaterThan(0);
        expect(s.level4_prefix.en.length).toBeGreaterThan(0);
      }
    });

    it('every scaffold has zh-Hans text', () => {
      for (const s of TOPIC_SCAFFOLDS) {
        expect(s.level1['zh-Hans'].length).toBeGreaterThan(0);
        expect(s.level2['zh-Hans'].length).toBeGreaterThan(0);
        expect(s.level3['zh-Hans'].length).toBeGreaterThan(0);
        expect(s.level4_prefix['zh-Hans'].length).toBeGreaterThan(0);
      }
    });
  });
});
