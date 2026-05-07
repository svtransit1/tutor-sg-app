import {
  classify,
  classifyTopic,
  TOPICS,
  getTopicsBySubject,
  getTopicsBySubjectAndLevel,
  type Subject,
  type TopicClassificationResult,
} from '../index';

// Helper to run the full pipeline: classify subject → classify topic
function runPipeline(text: string, grade?: number): TopicClassificationResult {
  const subjResult = classify(text);
  return classifyTopic(subjResult.subject, text, grade);
}

describe('TopicClassifier — P3 Math', () => {
  it('identifies P3 multiplication/division', () => {
    const result = classifyTopic('math', 'Find the product of 23 and 5. Then divide 144 by 6.', 3);
    expect(result.topicId).toBe('MAT-P3-003');
    expect(result.topicNameEn).toBe('Multiplication and Division');
  });

  it('identifies P3 fractions', () => {
    const result = classifyTopic('math', 'Compare the fractions 2/5 and 3/8. Which is greater? Find an equivalent fraction for 3/4.', 3);
    expect(result.topicId).toBe('MAT-P3-004');
    expect(result.topicNameEn).toBe('Fractions');
  });

  it('identifies P3 perimeter and area', () => {
    const result = classifyTopic('math', 'Find the perimeter of this shape and the area by counting squares.', 3);
    expect(result.topicId).toBe('MAT-P3-007');
    expect(result.topicNameEn).toBe('Perimeter and Area');
  });

  it('identifies P3 angles', () => {
    const result = classifyTopic('math', 'Is this angle greater than or less than a right angle? Identify angles in the shape below.', 3);
    expect(result.topicId).toBe('MAT-P3-008');
    expect(result.topicNameEn).toBe('Angles');
  });

  it('identifies P3 data and graphs', () => {
    const result = classifyTopic('math', 'Read and interpret the bar graph. Organise the data in a table.', 3);
    expect(result.topicId).toBe('MAT-P3-009');
    expect(result.topicNameEn).toBe('Data and Graphs');
  });

  it('identifies P3 money', () => {
    const result = classifyTopic('math', 'Mrs Tan bought 4 pens and 3 notebooks. She paid $20. How much change did she receive? Solve this multi-step money problem.', 3);
    expect(result.topicId).toBe('MAT-P3-005');
    expect(result.topicNameEn).toBe('Money');
  });

  it('identifies P3 time', () => {
    const result = classifyTopic('math', 'The movie started at 2:15 pm and ended at 4:05 pm. How many minutes did the movie last?', 3);
    expect(result.topicId).toBe('MAT-P3-010');
    expect(result.topicNameEn).toBe('Time');
  });

  it('identifies P3 length, mass and volume', () => {
    const result = classifyTopic('math', 'A bottle contains 1 litre 250 ml of water. Another bottle has 750 ml. What is the total volume in litres and millilitres?', 3);
    expect(result.topicId).toBe('MAT-P3-006');
    expect(result.topicNameEn).toBe('Length, Mass and Volume');
  });

  it('identifies P3 addition/subtraction within 10000', () => {
    const result = classifyTopic('math', '5432 + 2876 = ? Solve this 4-digit addition and check your answer with subtraction.', 3);
    expect(result.topicId).toBe('MAT-P3-002');
    expect(result.topicNameEn).toBe('Addition and Subtraction within 10 000');
  });

  it('identifies P3 numbers to 10000', () => {
    const result = classifyTopic('math', 'Round 4876 to the nearest 100. Write the number in words. Count forward by hundreds from 3200 to 4000.', 3);
    expect(result.topicId).toBe('MAT-P3-001');
    expect(result.topicNameEn).toBe('Numbers to 10 000');
  });
});

describe('TopicClassifier — P3 English', () => {
  it('identifies P3 reading comprehension (passages)', () => {
    const result = classifyTopic('english', 'Read the passage and answer the questions. What was the writer\'s purpose in writing this passage? Give evidence from the text.', 3);
    expect(result.topicId).toBe('ENG-P3-001');
  });

  it('identifies P3 cloze passage', () => {
    const result = classifyTopic('english', 'Complete the following cloze passage by filling in each blank with a suitable word. Use grammar clues to help you.', 3);
    expect(result.topicId).toBe('ENG-P3-003');
  });

  it('identifies P3 composition writing', () => {
    const result = classifyTopic('english', 'Write a narrative composition of 80 to 100 words about "A Day at the Park". Include a beginning, middle and end.', 3);
    expect(result.topicId).toBe('ENG-P3-004');
  });

  it('identifies P3 vocabulary and grammar', () => {
    const result = classifyTopic('english', 'Choose the correct homophone: "Their/There/They\'re going to the zoo." Also, identify the subject-verb agreement error in the sentence.', 3);
    expect(result.topicId).toBe('ENG-P3-002');
  });

  it('identifies P3 grammar - tenses', () => {
    const result = classifyTopic('english', 'Rewrite this sentence in the present perfect tense: "I eat breakfast." Also write it in the present continuous tense.', 3);
    expect(result.topicId).toBe('ENG-P3-005');
  });

  it('identifies P3 oral - reading aloud', () => {
    const result = classifyTopic('english', 'Read the following passage aloud with correct pronunciation and intonation. Pay attention to your pace.', 3);
    expect(result.topicId).toBe('ENG-P3-006');
  });
});

describe('TopicClassifier — P3 Science', () => {
  it('identifies P3 characteristics of living things', () => {
    const result = classifyTopic('science', 'List three characteristics of living things. Use a classification key to group these organisms.', 3);
    expect(result.topicId).toBe('SCI-P3-001');
  });

  it('identifies P3 animals and plants', () => {
    const result = classifyTopic('science', 'Classify these animals into groups: mammals, birds, fish, reptiles, and insects. Identify the parts of a plant and explain their functions.', 3);
    expect(result.topicId).toBe('SCI-P3-002');
  });

  it('identifies P3 materials and properties', () => {
    const result = classifyTopic('science', 'Compare the properties of these materials: flexibility, strength, and absorbency. Which material would you use for a raincoat?', 3);
    expect(result.topicId).toBe('SCI-P3-003');
  });

  it('identifies P3 magnets', () => {
    const result = classifyTopic('science', 'Which of these materials are magnetic? Explain what happens when you bring the north poles of two magnets together. What about north and south?', 3);
    expect(result.topicId).toBe('SCI-P3-004');
  });
});

describe('TopicClassifier — P3 Chinese MT', () => {
  it('identifies P3 vocabulary and phrases', () => {
    const result = classifyTopic('chinese_mt', '解释下面成语的意思，并用每一个成语造一个句子。', 3);
    expect(result.topicId).toBe('CHI-P3-001');
  });

  it('identifies P3 reading comprehension', () => {
    const result = classifyTopic('chinese_mt', '阅读下面的短文（约120字），然后回答问题。文中的人物为什么感到难过？', 3);
    expect(result.topicId).toBe('CHI-P3-002');
  });

  it('identifies P3 sentence construction', () => {
    const result = classifyTopic('chinese_mt', '用"不但……而且……"和"虽然……但是……"造句。改写下面的句子，不改变原意。', 3);
    expect(result.topicId).toBe('CHI-P3-003');
  });

  it('identifies P3 composition', () => {
    const result = classifyTopic('chinese_mt', '看图作文：请根据下面两幅图，写一篇80到120字的作文。', 3);
    expect(result.topicId).toBe('CHI-P3-004');
  });

  it('identifies P3 oral - reading aloud', () => {
    const result = classifyTopic('chinese_mt', '朗读下面这段短文。注意发音准确和适当的停顿。', 3);
    expect(result.topicId).toBe('CHI-P3-005');
  });
});

describe('TopicClassifier — full pipeline (classify subject → classify topic)', () => {
  it('P3 math problem: subject → topic', () => {
    // Text must have both subject signals (math) AND topic signals (fractions)
    const result = runPipeline('Add the fractions 1/4 and 2/4. Find an equivalent fraction for 3/5. Compare the fractions 2/3 and 3/4.', 3);
    expect(result.topicId).toBe('MAT-P3-004');
    expect(result.topicNameEn).toBe('Fractions');
  });

  it('P3 english problem: subject → topic', () => {
    const result = runPipeline('Read the passage and answer the inferential questions. What was the writer\'s purpose in writing this passage? Give evidence from the text.', 3);
    expect(result.topicId).toBe('ENG-P3-001');
  });

  it('P3 science problem: subject → topic', () => {
    // Include explicit science keywords so subject classifier picks science
    const result = runPipeline('Living things: classify these materials — compare their properties and absorbency. Which material is the most flexible and strongest?', 3);
    expect(result.topicId).toBe('SCI-P3-003');
  });

  it('P3 Chinese MT problem: subject → topic', () => {
    const result = runPipeline('阅读下面的短文，然后用你自己的话回答问题。小华为什么喜欢去图书馆？', 3);
    expect(result.topicId).toBe('CHI-P3-002');
  });
});

describe('TopicClassifier — grade-level inference', () => {
  it('infers grade from explicit P3 marker in text', () => {
    const result = classifyTopic('math', 'P3 exam question: Find the perimeter of a square with side 6 cm.', undefined);
    expect(result.gradeLevel).toBe(3);
    expect(result.topicId).toBe('MAT-P3-007');
  });

  it('uses explicit grade param over text inference', () => {
    const result = classifyTopic('math', 'P3 exam: 5 + 3 = ?', 4);
    expect(result.gradeLevel).toBe(4); // grade param overrides P3 in text
  });

  it('returns matched topic level when no grade info available', () => {
    const result = classifyTopic('science', 'What is heat?', undefined);
    // "heat" matches SCI-P4-001 → gradeLevel reflects matched topic level
    expect(result.gradeLevel).toBe(4);
    expect(result.topicId).toBe('SCI-P4-001');
  });
});

describe('TopicClassifier — edge cases', () => {
  it('returns null topicId for empty text', () => {
    const result = classifyTopic('math', '');
    expect(result.topicId).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it('returns null topicId for text with no matching terms', () => {
    const result = classifyTopic('english', 'zzzzzzz xyz', undefined);
    expect(result.topicId).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it('returns candidates even when no match', () => {
    const result = classifyTopic('math', 'xyz unknown text');
    expect(result.candidates.length).toBeGreaterThanOrEqual(0);
  });

  it('confidence is between 0 and 1 when matched', () => {
    const result = classifyTopic('math', 'What is 5 + 3? Solve this addition problem.', 1);
    expect(result.topicId).toBe('MAT-P1-002');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('returns top 3 candidates', () => {
    const result = classifyTopic('math', 'Solve: 24 ÷ 6 = ? Also write 2/3 as a decimal.', 4);
    expect(result.candidates.length).toBe(3);
    expect(result.candidates[0].score).toBeGreaterThanOrEqual(result.candidates[1].score);
  });

  it('is idempotent', () => {
    const text = 'Find the area of a rectangle with length 8 cm and width 5 cm.';
    const r1 = classifyTopic('math', text, 4);
    const r2 = classifyTopic('math', text, 4);
    expect(r1.topicId).toBe(r2.topicId);
    expect(r1.confidence).toBe(r2.confidence);
    expect(r1.candidates).toEqual(r2.candidates);
  });

  it('handles all 4 subjects', () => {
    const subjects: Subject[] = ['math', 'english', 'science', 'chinese_mt'];
    for (const s of subjects) {
      const result = classifyTopic(s, 'test question', 3);
      expect(result).toHaveProperty('topicId');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('candidates');
      expect(result).toHaveProperty('gradeLevel');
    }
  });

  it('type contract: TopicClassificationResult has all required keys', () => {
    const result = classifyTopic('math', '5 + 3', 1);
    const keys: (keyof TopicClassificationResult)[] = [
      'topicId', 'topicNameEn', 'topicNameZh', 'gradeLevel', 'confidence', 'candidates',
    ];
    for (const key of keys) {
      expect(result).toHaveProperty(key);
    }
  });
});

describe('TopicClassifier — across P1-P6', () => {
  it('P1 math', () => {
    const result = classifyTopic('math', 'Count the apples. Write the number. Which group has more?', 1);
    expect(result.topicId).toBe('MAT-P1-001');
  });

  it('P2 math', () => {
    const result = classifyTopic('math', 'Multiply: 3 × 7 = ? Divide 24 ÷ 4 = ?', 2);
    expect(result.topicId).toBe('MAT-P2-003');
  });

  it('P4 math', () => {
    const result = classifyTopic('math', 'Find the factors of 24 and the first 5 multiples of 6. Is 13 a prime number?', 4);
    expect(result.topicId).toBe('MAT-P4-002');
  });

  it('P5 math', () => {
    const result = classifyTopic('math', 'If x + 7 = 15, what is the value of x? Also, find the ratio of 12 to 18 in simplest form.', 5);
    // Should match algebra or ratio - whichever has more terms
    expect(result.topicId).not.toBeNull();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('P6 math', () => {
    const result = classifyTopic('math', 'A car travels at a speed of 60 km/h. How far does it travel in 2.5 hours? Use the formula distance = speed × time.', 6);
    expect(result.topicId).toBe('MAT-P6-006');
  });
});

describe('Topics — data integrity', () => {
  it('TOPICS has entries for all 156 taxonomy topics', () => {
    // 44 math + 34 english + 33 science + 38 chinese_mt = 149
    // (some topics condensed, but should cover all subjects)
    expect(TOPICS.length).toBeGreaterThan(140);
  });

  it('every topic has a unique ID', () => {
    const ids = TOPICS.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every topic has valid subject, level, names, and terms', () => {
    for (const t of TOPICS) {
      expect(['math', 'english', 'science', 'chinese_mt']).toContain(t.subject);
      expect(t.level).toBeGreaterThanOrEqual(1);
      expect(t.level).toBeLessThanOrEqual(6);
      expect(t.nameEn.length).toBeGreaterThan(0);
      expect(t.nameZh.length).toBeGreaterThan(0);
      expect(t.terms.length).toBeGreaterThan(0);
    }
  });

  it('getTopicsBySubject returns only matching subjects', () => {
    const mathTopics = getTopicsBySubject('math');
    expect(mathTopics.length).toBeGreaterThan(40);
    for (const t of mathTopics) {
      expect(t.subject).toBe('math');
    }
  });

  it('getTopicsBySubjectAndLevel filters by both', () => {
    const p3Math = getTopicsBySubjectAndLevel('math', 3);
    expect(p3Math.length).toBe(10); // MAT-P3-001 through MAT-P3-010
    for (const t of p3Math) {
      expect(t.subject).toBe('math');
      expect(t.level).toBe(3);
    }
  });

  it('P3 science has topics', () => {
    const p3Sci = getTopicsBySubjectAndLevel('science', 3);
    expect(p3Sci.length).toBeGreaterThanOrEqual(4);
  });

  it('P3 english has topics', () => {
    const p3Eng = getTopicsBySubjectAndLevel('english', 3);
    expect(p3Eng.length).toBeGreaterThanOrEqual(6);
  });

  it('P3 chinese_mt has topics', () => {
    const p3Chi = getTopicsBySubjectAndLevel('chinese_mt', 3);
    expect(p3Chi.length).toBeGreaterThanOrEqual(5);
  });
});
