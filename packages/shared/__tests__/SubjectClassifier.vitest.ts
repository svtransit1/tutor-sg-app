import { classify, type Subject, type SubjectClassification } from '../src/classifier/SubjectClassifier';

function expectSubject(text: string, expected: Subject, minConfidence = 0.3): void {
  const result = classify(text);
  expect(result.subject).toBe(expected);
  expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
}

function expectUnknown(text: string): void {
  const result = classify(text);
  expect(result.subject).toBe('unknown');
  expect(result.confidence).toBeLessThan(0.5);
}

describe('classify — Math', () => {
  it('identifies a basic word problem with "left" keyword', () => {
    expectSubject(
      'John has 12 apples. He gives 5 to Mary. How many apples does John have left?',
      'math',
      0.5,
    );
  });

  it('identifies area and perimeter problem', () => {
    expectSubject(
      'Find the area and perimeter of a rectangle with length 8 cm and width 5 cm.',
      'math',
      0.5,
    );
  });

  it('identifies fraction problem', () => {
    expectSubject('What fraction of the circle is shaded? Write your answer in simplest form.', 'math', 0.5);
  });

  it('identifies ratio problem', () => {
    expectSubject('The ratio of boys to girls in a class is 3:2. What is the total number of children?', 'math', 0.5);
  });

  it('identifies geometry problem with angle keywords', () => {
    expectSubject('Find the value of angle x in this triangle. Show your working.', 'math', 0.5);
  });

  it('identifies percentage discount problem', () => {
    expectSubject('A bag costs $40. There is a 25% discount. How much do you pay?', 'math', 0.4);
  });

  it('identifies Chinese math with geometry terms', () => {
    expectSubject('计算长方形的面积。长是12厘米，宽是8厘米。面积是多少？', 'math', 0.4);
  });

  it('identifies number-heavy equation', () => {
    expectSubject('12345 + 67890 = 80235', 'math', 0.5);
  });

  it('identifies speed distance time problem', () => {
    expectSubject('A car travels at a speed of 80 km per hour for 3 hours. What is the distance travelled?', 'math', 0.4);
  });

  it('identifies bar model heuristic problem', () => {
    expectSubject('Use a bar model to solve: Ali has twice as many stamps as Bob. How many stamps do they have altogether?', 'math', 0.4);
  });

  it('identifies mass and capacity problem', () => {
    expectSubject('Convert 3 kilograms to grams. How many grams are there in 3 kg of rice?', 'math', 0.4);
  });

  it('identifies average problem', () => {
    expectSubject('Find the average of these numbers: 12, 15, 18, 21. What is the mean?', 'math', 0.5);
  });
});

describe('classify — Science', () => {
  it('identifies photosynthesis question', () => {
    expectSubject(
      'Explain how photosynthesis takes place in a plant. What does the plant need for photosynthesis?',
      'science',
      0.5,
    );
  });

  it('identifies states of matter question', () => {
    expectSubject('What are the three states of matter? Give one example of a solid, a liquid, and a gas.', 'science', 0.5);
  });

  it('identifies water cycle question', () => {
    expectSubject('Describe the process of evaporation and condensation in the water cycle.', 'science', 0.5);
  });

  it('identifies food chain question', () => {
    expectSubject('Draw a food chain with a producer, a consumer, and a predator from the grassland habitat.', 'science', 0.5);
  });

  it('identifies magnet and electricity question', () => {
    expectSubject('Which materials does a magnet attract? Explain how a circuit works with a battery and a bulb.', 'science', 0.5);
  });

  it('identifies plant biology question', () => {
    expectSubject('Describe the life cycle of a flowering plant from seed to fruit. What is pollination?', 'science', 0.5);
  });

  it('identifies human body question', () => {
    expectSubject('Name the organs in the human digestive system. What is the function of the stomach?', 'science', 0.5);
  });

  it('identifies force and gravity question', () => {
    expectSubject('What is gravity? Explain how friction affects the movement of an object on different surfaces.', 'science', 0.5);
  });

  it('identifies habitat question', () => {
    expectSubject('Describe how animals adapt to survive in their habitat. Give one example of adaptation.', 'science', 0.5);
  });

  it('identifies light and shadow question', () => {
    expectSubject('Record your observations of how the shadow changes when the light source moves. What conclusion can you draw from this experiment?', 'science', 0.4);
  });

  it('identifies Chinese science question', () => {
    expectSubject('什么是光合作用？植物如何通过光合作用制造食物？', 'science', 0.5);
  });

  it('identifies Chinese science with ecosystem terms', () => {
    expectSubject('画出草地上的一个食物链，包括生产者、消费者和捕食者。', 'science', 0.5);
  });
});

describe('classify — English', () => {
  it('identifies comprehension question', () => {
    expectSubject(
      'Read the passage carefully and answer the following questions based on the passage.',
      'english',
      0.5,
    );
  });

  it('identifies grammar question', () => {
    expectSubject('Choose the correct verb tense to complete the sentence. Write your answer in the blank.', 'english', 0.5);
  });

  it('identifies vocabulary question', () => {
    expectSubject('Find the synonym for the word "enormous" in the passage.', 'english', 0.5);
  });

  it('identifies synthesis and transformation', () => {
    expectSubject('Join the following sentences using a suitable connector. Rewrite the sentences as one.', 'english', 0.5);
  });

  it('identifies cloze passage question', () => {
    expectSubject('Fill in each blank with a suitable word. Complete the cloze passage below.', 'english', 0.5);
  });

  it('identifies composition question', () => {
    expectSubject('Write a composition of at least 120 words. Include an introduction, body paragraphs, and a conclusion.', 'english', 0.5);
  });

  it('identifies punctuation question', () => {
    expectSubject('Add the correct punctuation to each sentence. Use capital letters, full stops, and commas.', 'english', 0.5);
  });

  it('identifies direct speech question', () => {
    expectSubject('Rewrite the following sentences in direct speech. Remember to use quotation marks.', 'english', 0.4);
  });

  it('identifies spelling and word meaning question', () => {
    expectSubject('What is the meaning of the underlined word? Choose the correct definition from the box.', 'english', 0.5);
  });

  it('identifies situational writing question', () => {
    expectSubject('Write a formal letter to the principal. Include the date, salutation, body, and closing.', 'english', 0.5);
  });
});

describe('classify — Chinese MT', () => {
  it('identifies Chinese comprehension', () => {
    expectSubject('阅读下面的短文，然后回答后面的问题。根据短文内容选择正确的答案。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese composition', () => {
    expectSubject('命题作文：我的梦想。请写一篇不少于200字的作文，注意段落结构。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese vocabulary and synonyms', () => {
    expectSubject('写出下列词语的近义词和反义词：高兴、美丽、勇敢、聪明。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese sentence construction', () => {
    expectSubject('用"因为……所以……"和"虽然……但是……"各造一个句子。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese character writing practice', () => {
    expectSubject('写出"家"字的笔画顺序和部首。这个字有多少画？', 'chinese_mt', 0.4);
  });

  it('identifies ba/bei sentence transformation', () => {
    expectSubject('把下列句子改写成"被"字句。妈妈洗了衣服。', 'chinese_mt', 0.5);
  });

  it('identifies pure Chinese MT passage', () => {
    expectSubject('小明是一个勤奋的学生。他每天都很早起床，先读华文课文，然后才吃早餐。他认为学习华文很重要。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese pinyin exercise', () => {
    expectSubject('给下面的汉字注音：学校、图书馆、操场。注意声调。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese idiom and proverb exercise', () => {
    expectSubject('解释下列成语的意思，并用每个成语写一个句子。', 'chinese_mt', 0.5);
  });

  it('identifies Chinese with general school terms', () => {
    expectSubject('今天的华文功课是完成课文后面的练习题。读课文，然后回答理解题。', 'chinese_mt', 0.5);
  });
});

describe('classify — edge cases', () => {
  it('returns unknown with 0 confidence for empty string', () => {
    const result = classify('');
    expect(result.subject).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('returns unknown with 0 confidence for whitespace-only', () => {
    const result = classify('   \n  \t  ');
    expect(result.subject).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('returns unknown for generic text with no clear subject signals', () => {
    const result = classify('What is the answer to this question?');
    expect(result.subject).toBe('unknown');
  });

  it('prefers math over science when math signals are stronger', () => {
    const result = classify('A pole is 12 cm long. Another pole is 8 cm long. What is the total length of both poles?');
    expect(result.subject).toBe('math');
  });

  it('identifies science over math for pure concept question without numbers', () => {
    const result = classify('What is magnetism? Explain how magnets attract and repel objects.');
    expect(result.subject).toBe('science');
  });

  it('all-zero scores for empty input', () => {
    const result = classify('');
    for (const s of ['math', 'english', 'chinese_mt', 'science'] as Subject[]) {
      expect(result.scores[s]).toBe(0);
    }
  });

  it('non-zero scores for valid input', () => {
    const result = classify('Find the area of a rectangle');
    expect(result.scores.math).toBeGreaterThan(0);
  });

  it('confidence is between 0 and 1 for non-empty input', () => {
    const texts = [
      'What is the area of a rectangle with length 5 cm?',
      'Explain how plants make food through photosynthesis.',
      'Read the passage and answer the questions that follow.',
      '阅读下面的短文，然后回答问题。',
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

  it('math symbol bonus helps classify operator-heavy text', () => {
    const result = classify('123 + 456 = 579');
    expect(result.subject).toBe('math');
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it('english defaults for no-signal generic words', () => {
    const result = classify('Hello. How are you? I am fine.');
    expect(result.subject).toBe('unknown');
  });
});

describe('classify — detectedLanguage', () => {
  it('detects en for English text', () => {
    const result = classify('Find the area of a rectangle.');
    expect(result.detectedLanguage).toBe('en');
  });

  it('detects zh-Hans for Chinese text', () => {
    const result = classify('阅读下面的短文，然后回答问题。');
    expect(result.detectedLanguage).toBe('zh-Hans');
  });

  it('detects mixed for text with both scripts', () => {
    const result = classify('光合作用需要什么条件？Explain the conditions for photosynthesis.');
    expect(result.detectedLanguage).toBe('mixed');
  });

  it('returns correct language for math in Chinese', () => {
    const result = classify('计算长方形的面积。长是12厘米，宽是8厘米。');
    expect(result.detectedLanguage).toBe('zh-Hans');
  });

  it('returns correct language for English science text', () => {
    const result = classify('What is the function of the human heart?');
    expect(result.detectedLanguage).toBe('en');
  });
});

describe('classify — type contracts', () => {
  it('SubjectClassification has all required keys', () => {
    const result = classify('5 + 3 = ?');
    const keys: (keyof SubjectClassification)[] = ['subject', 'confidence', 'detectedLanguage', 'scores'];
    for (const key of keys) {
      expect(result).toHaveProperty(key);
    }
    for (const s of ['math', 'english', 'chinese_mt', 'science'] as Subject[]) {
      expect(typeof result.scores[s]).toBe('number');
    }
  });

  it('subject is "unknown" or one of the four subjects', () => {
    const result = classify('Find the perimeter.');
    expect(['unknown', 'math', 'english', 'chinese_mt', 'science']).toContain(result.subject);
  });

  it('detectedLanguage is one of the valid values', () => {
    const result = classify('Find the area.');
    expect(['en', 'zh-Hans', 'mixed']).toContain(result.detectedLanguage);
  });

  it('confidence is a number between 0 and 1', () => {
    const result = classify('What is photosynthesis?');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe('classify — realistic Singapore school examples', () => {
  it('P4 Math: money word problem', () => {
    expectSubject(
      'Mrs Lim bought 3 packets of sugar for $2 each. She gave the cashier $10. How much change did she receive?',
      'math',
      0.4,
    );
  });

  it('P6 Math: speed distance time problem', () => {
    expectSubject(
      'A car travelled from Town A to Town B at an average speed of 80 km per hour. The distance is 240 km. How long did the journey take?',
      'math',
      0.3,
    );
  });

  it('P3 Science: living and non-living things', () => {
    expectSubject(
      'List the characteristics of living things: movement, growth, and reproduction. Give an example of a non-living thing.',
      'science',
      0.3,
    );
  });

  it('P5 Science: human circulatory system', () => {
    expectSubject(
      'Describe how blood flows through the human circulatory system. What is the function of the heart?',
      'science',
      0.5,
    );
  });

  it('P2 English: grammar exercise', () => {
    expectSubject(
      'Fill in each blank with the correct verb tense. Tom ___ (go) to school every day.',
      'english',
      0.4,
    );
  });

  it('P3 Chinese MT: reading comprehension', () => {
    expectSubject(
      '阅读下面的短文，然后回答问题。小华是一个三年级的学生。他最喜欢上华文课。',
      'chinese_mt',
      0.5,
    );
  });

  it('P5 Science: plant reproduction', () => {
    expectSubject(
      'Describe how a flowering plant reproduces. Explain the process of pollination and seed dispersal.',
      'science',
      0.5,
    );
  });

  it('P1 Math: simple addition and subtraction', () => {
    expectSubject('What is 5 plus 3? How many altogether?', 'math', 0.5);
  });
});

describe('classify — subject disambiguation', () => {
  it('prefers english over unknown for grammar terms', () => {
    const result = classify('Choose the correct noun and verb to complete the sentence.');
    expect(result.subject).toBe('english');
  });

  it('prefers chinese_mt over english for high-CJK text', () => {
    const result = classify('请阅读课文，然后回答以下关于课文内容的问题。');
    expect(result.subject).toBe('chinese_mt');
  });

  it('prefers math over english for digit-heavy text', () => {
    const result = classify('How many marbles does each boy have if 45 marbles are shared equally among 5 boys?');
    expect(result.subject).toBe('math');
  });

  it('prefers science over english for science vocabulary', () => {
    const result = classify('What is the life cycle of a butterfly? Describe each stage.');
    expect(result.subject).toBe('science');
  });
});
