import {
  classify,
  normalizeScores,
  type Subject,
  type ClassificationResult,
} from '../index';

// ────── Helpers ──────────────────────────────

function expectSubject(text: string, expected: Subject, minConfidence = 0.3): void {
  const result = classify(text);
  expect(result.subject).toBe(expected);
  expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
}

function expectNotSubject(text: string, excluded: Subject): void {
  const result = classify(text);
  expect(result.subject).not.toBe(excluded);
}

// ────── Math classification ──────────────────

describe('classify — Math', () => {
  it('identifies a basic arithmetic problem', () => {
    expectSubject('John has 12 apples. He gives 5 to Mary. How many apples does John have left?', 'math');
  });

  it('identifies a fraction problem', () => {
    expectSubject('What is 3/4 of 20?', 'math');
  });

  it('identifies a geometry problem', () => {
    expectSubject('Find the area of a rectangle with length 8 cm and width 5 cm.', 'math');
  });

  it('identifies a ratio problem', () => {
    expectSubject('The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?', 'math');
  });

  it('identifies sum/difference/product/quotient wording', () => {
    expectSubject('Find the product of 7 and 9, then add the sum of 3 and 5.', 'math');
  });

  it('identifies a P5 fractions problem', () => {
    expectSubject(
      'Mrs Tan had 6 m of ribbon. She cut it into pieces of 2/3 m each. How many pieces did she get?',
      'math',
    );
  });

  it('identifies percentage problem', () => {
    expectSubject('A shirt costs $40. There is a 25% discount. What is the sale price?', 'math');
  });

  it('identifies a bar model reference', () => {
    expectSubject('Use a bar model to solve: Ali has twice as many stamps as Bob.', 'math');
  });

  it('identifies a multi-step heuristic problem', () => {
    expectSubject(
      'At a party, 1/3 of the guests are adults and the rest are children. 2/5 of the children are boys. There are 18 girls. How many guests are at the party?',
      'math',
    );
  });

  it('identifies math with Chinese keywords mixed in', () => {
    expectSubject('一个三角形的面积是24平方厘米。底是8厘米。高是多少？', 'math');
  });

  it('identifies a number-heavy comparison', () => {
    expectSubject('12345 + 67890 = ?', 'math');
  });
});

// ────── Science classification ───────────────

describe('classify — Science', () => {
  it('identifies photosynthesis question', () => {
    expectSubject(
      'Explain how photosynthesis takes place in a leaf. Use the words: chlorophyll, sunlight, carbon dioxide, oxygen, glucose.',
      'science',
    );
  });

  it('identifies matter / states question', () => {
    expectSubject(
      'Name the three states of matter and give one example of each.',
      'science',
    );
  });

  it('identifies water cycle question', () => {
    expectSubject(
      'Describe the process of evaporation and condensation in the water cycle.',
      'science',
    );
  });

  it('identifies food chain question', () => {
    expectSubject(
      'Construct a food chain from the following organisms: grass, grasshopper, frog, snake, eagle.',
      'science',
    );
  });

  it('identifies magnet question', () => {
    expectSubject(
      'A magnet attracts a paper clip. Explain why. What materials can a magnet attract?',
      'science',
    );
  });

  it('identifies C-E-R formatted question', () => {
    expectSubject(
      'Using the Claim-Evidence-Reasoning format, explain why a metal spoon feels colder than a wooden spoon at room temperature.',
      'science',
    );
  });

  it('identifies electricity question', () => {
    expectSubject(
      'Draw a simple circuit with a battery, a switch, and a light bulb. Explain what happens when the switch is closed.',
      'science',
    );
  });

  it('identifies plant biology question', () => {
    expectSubject(
      'Describe the life cycle of a flowering plant, starting from a seed.',
      'science',
    );
  });

  it('identifies science Chinese keywords', () => {
    expectSubject('光合作用需要什么条件？请用中文回答。', 'science');
  });
});

// ────── English classification ────────────────

describe('classify — English', () => {
  it('identifies comprehension question', () => {
    expectSubject(
      'Read the passage and answer the following questions. What did the main character feel when she found the lost puppy?',
      'english',
    );
  });

  it('identifies grammar question', () => {
    expectSubject(
      'Fill in the blanks with the correct form of the verb: She ___ (go) to school every day.',
      'english',
    );
  });

  it('identifies vocabulary question', () => {
    expectSubject(
      'Find a synonym for the word "enormous" from the passage.',
      'english',
    );
  });

  it('identifies synthesis and transformation', () => {
    expectSubject(
      'Synthesis and Transformation: John is tall. John is strong. (Rewrite using "both... and")',
      'english',
    );
  });

  it('identifies cloze passage', () => {
    expectSubject(
      'Complete the following cloze passage by filling in each blank with a suitable word.',
      'english',
    );
  });

  it('identifies composition question', () => {
    expectSubject(
      'Write a composition of at least 120 words about "A Memorable Day". Include an introduction, body, and conclusion.',
      'english',
    );
  });

  it('identifies punctuation question', () => {
    expectSubject(
      'Add the correct punctuation marks to the following sentences.',
      'english',
    );
  });

  it('identifies subject-verb agreement', () => {
    expectSubject(
      'The group of students ___ (is/are) going on a field trip. Choose the correct verb.',
      'english',
    );
  });

  it('identifies active/passive voice', () => {
    expectSubject(
      'Change the following sentence from active voice to passive voice: The chef cooked the meal.',
      'english',
    );
  });

  it('identifies PEEL structure question', () => {
    expectSubject(
      'Using the PEEL structure, write a paragraph about the benefits of reading.',
      'english',
    );
  });
});

// ────── Chinese MT classification ─────────────

describe('classify — Chinese MT', () => {
  it('identifies Chinese comprehension', () => {
    expectSubject('阅读下面的短文，然后回答问题。', 'chinese_mt');
  });

  it('identifies Chinese composition', () => {
    expectSubject('命题作文：我的梦想。请写一篇不少于200字的作文。', 'chinese_mt');
  });

  it('identifies Chinese vocabulary (词语)', () => {
    expectSubject('请写出下列词语的近义词：高兴、美丽、勇敢。', 'chinese_mt');
  });

  it('identifies Chinese sentence construction (造句/组词)', () => {
    expectSubject('用下列词语造句：因为……所以……', 'chinese_mt');
  });

  it('identifies Chinese character practice (笔画/部首)', () => {
    expectSubject('写出"家"字的笔画顺序和部首。', 'chinese_mt');
  });

  it('identifies Chinese dictation (默写/听写)', () => {
    expectSubject('默写课文第三段。', 'chinese_mt');
  });

  it('identifies ba/bei sentence transformation', () => {
    expectSubject('把下列句子改成"被"字句：妈妈洗了衣服。', 'chinese_mt');
  });

  it('identifies Chinese grammar patterns', () => {
    expectSubject('这个句子是陈述句、疑问句还是感叹句？今天天气真好啊！', 'chinese_mt');
  });

  it('identifies Chinese MT when CJK is dominant', () => {
    expectSubject(
      '小明是一个勤奋的学生。他每天都很早起床，先读华文课文，然后才吃早餐。他认为学习华文很重要。',
      'chinese_mt',
    );
  });

  it('identifies Chinese MT with pinyin patterns', () => {
    expectSubject('给下面的汉字注音：学校、图书馆、操场。', 'chinese_mt');
  });

  it('identifies Chinese MT with tone marks', () => {
    expectSubject('请写出"你叫什么名字"的汉语拼音。Nǐ jiào shénme míngzi？', 'chinese_mt');
  });
});

// ────── Edge cases ────────────────────────────

describe('classify — edge cases', () => {
  it('returns english with 0 confidence for empty string', () => {
    const result = classify('');
    expect(result.subject).toBe('english');
    expect(result.confidence).toBe(0);
  });

  it('returns english with 0 confidence for whitespace-only', () => {
    const result = classify('   \n  \t  ');
    expect(result.subject).toBe('english');
    expect(result.confidence).toBe(0);
  });

  it('defaults to english for generic text with no clear signals', () => {
    const result = classify('What is the answer?');
    expect(result.subject).toBe('english');
    // Only a tiny implicit baseline → english wins with =1 since it's the only signal
    // Real-world: generic text without any subject signals will be borderline
  });

  it('handles mixed EN/ZH where English content dominates', () => {
    const result = classify(
      'Translate the following into English: 今天天气很好。',
    );
    // This is an English class question about translation (dominant EN, low CJK %)
    // With no strong subject signals it defaults to English
    expect(result.subject).toBe('english');
  });

  it('prefers math over science when both signals present but math stronger', () => {
    const result = classify(
      'A magnet is 12 cm long. Another magnet is 8 cm long. What is the total length of both magnets?',
    );
    // Has "magnet" (science) but strong math pattern (cm + what is the total)
    expect(result.subject).toBe('math');
  });

  it('identifies science over math for pure concept question', () => {
    const result = classify('What is magnetism? Explain how magnets attract and repel.');
    // No math operators, clean science keywords
    expect(result.subject).toBe('science');
  });

  it('returns all-zero scores for empty input', () => {
    const result = classify('');
    for (const s of ['english', 'math', 'science', 'chinese_mt'] as Subject[]) {
      expect(result.scores[s]).toBe(0);
    }
  });

  it('provides non-zero scores for valid input', () => {
    const result = classify('What is 5 + 3?');
    // At least math should have a non-zero score
    expect(result.scores.math).toBeGreaterThan(0);
  });

  it('confidence is between 0 and 1 for non-empty input', () => {
    const texts = [
      '2 + 2 = 4',
      'Photosynthesis is the process by which plants make food.',
      'Read the passage and answer the questions.',
      '请写出下列词语的意思。',
    ];
    for (const text of texts) {
      const result = classify(text);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('is idempotent', () => {
    const text = 'Find the perimeter of a square with side 5 cm.';
    const r1 = classify(text);
    const r2 = classify(text);
    expect(r1.subject).toBe(r2.subject);
    expect(r1.confidence).toBe(r2.confidence);
  });
});

// ────── normalizeScores ───────────────────────

describe('normalizeScores', () => {
  it('normalizes to sum of 1', () => {
    const raw: Record<Subject, number> = { english: 3, math: 2, science: 1, chinese_mt: 0 };
    const norm = normalizeScores(raw);
    const total = Object.values(norm).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(1, 5);
    expect(norm.english).toBeCloseTo(0.5);
    expect(norm.math).toBeCloseTo(1 / 3);
    expect(norm.science).toBeCloseTo(1 / 6);
    expect(norm.chinese_mt).toBe(0);
  });

  it('clamps below-threshold values to 0', () => {
    const raw: Record<Subject, number> = { english: 0.005, math: 2, science: 0.003, chinese_mt: 0 };
    const norm = normalizeScores(raw);
    expect(norm.english).toBe(0);
    expect(norm.math).toBeCloseTo(1, 5);
    expect(norm.science).toBe(0);
    expect(norm.chinese_mt).toBe(0);
  });

  it('handles all-zero input', () => {
    const raw: Record<Subject, number> = { english: 0, math: 0, science: 0, chinese_mt: 0 };
    const norm = normalizeScores(raw);
    expect(norm.english).toBe(0);
    expect(norm.math).toBe(0);
    expect(norm.science).toBe(0);
    expect(norm.chinese_mt).toBe(0);
  });
});

// ────── CJK script handling ──────────────────

describe('classify — CJK script routing', () => {
  it('routes high-CJK text to chinese_mt when no Math/Science signal overrides', () => {
    // Predominantly CJK with Chinese MT signals
    expectSubject('请阅读下面的文章，然后用你自己的话回答问题。', 'chinese_mt');
  });

  it('routes CJK math text to math (override)', () => {
    // CJK text but clearly a math problem
    expectSubject('计算长方形的面积：长12厘米，宽8厘米。面积是多少平方厘米？', 'math');
  });

  it('routes CJK science text to science (override)', () => {
    expectSubject('什么是光合作用？植物如何进行光合作用来制造食物？', 'science');
  });

  it('handles mixed EN-ZH where CJK is minority', () => {
    const result = classify('Solve: 小明 has 5 苹果 and buys 3 more. 他一共有多少个苹果?');
    // Mix of EN and ZH; has numbers, has CJK but not dominant → math
    expect(result.subject).toBe('math');
  });
});

// ────── Realistic P1–P6 examples ──────────────

describe('classify — realistic Singapore school examples', () => {
  it('P4 Math: money word problem', () => {
    expectSubject(
      'Mrs Lim bought 3 packets of sugar for $2.40 each. She gave the cashier $10. How much change did she receive?',
      'math',
    );
  });

  it('P6 Math: speed problem', () => {
    expectSubject(
      'A car travelled from Town A to Town B at an average speed of 80 km/h. The distance between the two towns is 240 km. How long did the journey take?',
      'math',
    );
  });

  it('P3 Science: living and non-living things', () => {
    expectSubject(
      'List three characteristics of living things. Give an example of a living thing and a non-living thing.',
      'science',
    );
  });

  it('P5 Science: human circulatory system', () => {
    expectSubject(
      'Describe how blood flows through the human circulatory system. Name the organs involved.',
      'science',
    );
  });

  it('P2 English: simple comprehension', () => {
    expectSubject(
      'Tom has a dog. The dog is brown. It likes to play ball. What colour is Tom\'s dog?',
      'english',
    );
  });

  it('P5 English: editing task', () => {
    expectSubject(
      'Each of the underlined words contains a spelling or grammatical error. Write the correct word in the blank.',
      'english',
    );
  });

  it('P3 Chinese MT: reading comprehension', () => {
    expectSubject('阅读下面的短文，然后回答问题。小华是一个三年级的学生。他最喜欢上华文课。', 'chinese_mt');
  });

  it('P6 Chinese MT: picture composition', () => {
    expectSubject('看图作文：根据下面四幅图，写一篇不少于200字的短文。', 'chinese_mt');
  });
});

// ────── TypeScript type-check (compile-time) ──

describe('classify — type contracts', () => {
  it('ClassificationResult has all required keys', () => {
    const result = classify('5 + 3');
    const keys: (keyof ClassificationResult)[] = ['subject', 'confidence', 'scores'];
    for (const key of keys) {
      expect(result).toHaveProperty(key);
    }
    for (const s of ['english', 'math', 'science', 'chinese_mt'] as Subject[]) {
      expect(typeof result.scores[s]).toBe('number');
    }
  });
});
