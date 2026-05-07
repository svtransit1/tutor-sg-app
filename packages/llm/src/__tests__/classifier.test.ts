import {
  classify,
  normalizeScores,
  type Subject,
  type ClassificationResult,
} from '../index';

function expectSubject(text: string, expected: Subject, minConfidence = 0.3): void {
  const result = classify(text);
  expect(result.subject).toBe(expected);
  expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
}

describe('classify — Math', () => {
  it('identifies basic arithmetic problem', () => {
    expectSubject('John has 12 apples. He gives 5 to Mary. How many apples does John have left?', 'math');
  });

  it('identifies fraction problem', () => {
    expectSubject('What is 3/4 of 20?', 'math');
  });

  it('identifies geometry problem', () => {
    expectSubject('Find the area of a rectangle with length 8 cm and width 5 cm.', 'math');
  });

  it('identifies ratio problem', () => {
    expectSubject('The ratio of boys to girls in a class is 3:2. If there are 15 boys, how many girls are there?', 'math');
  });

  it('identifies sum/difference/product/quotient wording', () => {
    expectSubject('Find the product of 7 and 9, then add the sum of 3 and 5.', 'math');
  });

  it('identifies P5 fractions problem', () => {
    expectSubject(
      'Mrs Tan had 6 m of ribbon. She cut it into pieces of 2/3 m each. How many pieces did she get?',
      'math',
    );
  });

  it('identifies percentage problem', () => {
    expectSubject('A shirt costs $40. There is a 25% discount. What is the sale price?', 'math');
  });

  it('identifies bar model reference', () => {
    expectSubject('Use a bar model to solve: Ali has twice as many stamps as Bob.', 'math');
  });

  it('identifies math with Chinese keywords', () => {
    expectSubject('一个三角形的面积是24平方厘米。底是8厘米。高是多少？', 'math');
  });

  it('identifies number-heavy comparison', () => {
    expectSubject('12345 + 67890 = ?', 'math');
  });
});

describe('classify — Science', () => {
  it('identifies photosynthesis question', () => {
    expectSubject(
      'Explain how photosynthesis takes place in a leaf. Use the words: chlorophyll, sunlight, carbon dioxide, oxygen, glucose.',
      'science',
    );
  });

  it('identifies matter/states question', () => {
    expectSubject('Name the three states of matter and give one example of each.', 'science');
  });

  it('identifies water cycle question', () => {
    expectSubject('Describe the process of evaporation and condensation in the water cycle.', 'science');
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

  it('identifies PEEL structure question', () => {
    expectSubject(
      'Using the PEEL structure, write a paragraph about the benefits of reading.',
      'english',
    );
  });
});

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

  it('identifies Chinese sentence construction', () => {
    expectSubject('用下列词语造句：因为……所以……', 'chinese_mt');
  });

  it('identifies Chinese character practice', () => {
    expectSubject('写出"家"字的笔画顺序和部首。', 'chinese_mt');
  });

  it('identifies ba/bei sentence transformation', () => {
    expectSubject('把下列句子改成"被"字句：妈妈洗了衣服。', 'chinese_mt');
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
  });

  it('prefers math over science when math signals stronger', () => {
    const result = classify(
      'A magnet is 12 cm long. Another magnet is 8 cm long. What is the total length of both magnets?',
    );
    expect(result.subject).toBe('math');
  });

  it('identifies science over math for pure concept question', () => {
    const result = classify('What is magnetism? Explain how magnets attract and repel.');
    expect(result.subject).toBe('science');
  });

  it('all-zero scores for empty input', () => {
    const result = classify('');
    for (const s of ['english', 'math', 'science', 'chinese_mt'] as Subject[]) {
      expect(result.scores[s]).toBe(0);
    }
  });

  it('non-zero scores for valid input', () => {
    const result = classify('What is 5 + 3?');
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
    for (const v of Object.values(norm)) {
      expect(v).toBe(0);
    }
  });
});

describe('classify — CJK script routing', () => {
  it('routes high-CJK text to chinese_mt when no override', () => {
    expectSubject('请阅读下面的文章，然后用你自己的话回答问题。', 'chinese_mt');
  });

  it('routes CJK math text to math (override)', () => {
    expectSubject('计算长方形的面积：长12厘米，宽8厘米。面积是多少平方厘米？', 'math');
  });

  it('routes CJK science text to science (override)', () => {
    expectSubject('什么是光合作用？植物如何进行光合作用来制造食物？', 'science');
  });
});

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

  it('P3 Chinese MT: reading comprehension', () => {
    expectSubject('阅读下面的短文，然后回答问题。小华是一个三年级的学生。他最喜欢上华文课。', 'chinese_mt');
  });
});

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
