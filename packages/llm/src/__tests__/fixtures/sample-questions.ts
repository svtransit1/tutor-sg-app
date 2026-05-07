import type { PromptSubject, GradeLevel, PromptLanguage } from '../../types';

export interface SampleQuestion {
  subject: PromptSubject;
  grade: GradeLevel;
  language: PromptLanguage;
  problemText: string;
  topic?: string;
  description: string;
}

const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // ── Math (P3) ──
  {
    subject: 'math',
    grade: 'P3',
    language: 'en',
    problemText: 'John has 48 marbles. He gives 15 marbles to his friend. How many marbles does John have left?',
    topic: 'subtraction',
    description: 'P3 Math — simple subtraction word problem',
  },
  {
    subject: 'math',
    grade: 'P3',
    language: 'en',
    problemText: 'A pineapple costs $3. Mary buys 4 pineapples. How much does she pay altogether?',
    topic: 'multiplication',
    description: 'P3 Math — multiplication word problem',
  },
  {
    subject: 'math',
    grade: 'P3',
    language: 'zh-Hans',
    problemText: '小明有24支铅笔，小红有18支铅笔。他们一共有多少支铅笔？',
    topic: 'addition',
    description: 'P3 Math — addition word problem in Chinese',
  },

  // ── English (P3) ──
  {
    subject: 'english',
    grade: 'P3',
    language: 'en',
    problemText: 'Read the sentence: "The boy runned to school." Is this sentence correct? If not, fix it.',
    topic: 'grammar',
    description: 'P3 English — past tense grammar correction',
  },
  {
    subject: 'english',
    grade: 'P3',
    language: 'en',
    problemText: 'Complete the sentence: "The cat ___ on the mat." Choose the correct word: sit / sits / sitting.',
    topic: 'grammar',
    description: 'P3 English — subject-verb agreement',
  },
  {
    subject: 'english',
    grade: 'P3',
    language: 'zh-Hans',
    problemText: 'Read the passage:\n\n"Sarah went to the park. She saw a big dog. The dog was friendly. Sarah played with the dog."\n\nQuestion: Where did Sarah go?',
    topic: 'reading comprehension',
    description: 'P3 English — reading comprehension in Chinese context',
  },

  // ── Science (P3) ──
  {
    subject: 'science',
    grade: 'P3',
    language: 'en',
    problemText: 'A plant was placed in a dark cupboard for one week. After one week, the leaves turned yellow. Explain why this happened.',
    topic: 'plants',
    description: 'P3 Science — plants and photosynthesis reasoning',
  },
  {
    subject: 'science',
    grade: 'P3',
    language: 'en',
    problemText: 'Which of these materials is waterproof? (A) Paper (B) Cotton (C) Plastic (D) Sponge',
    topic: 'materials',
    description: 'P3 Science — materials MCQ',
  },
  {
    subject: 'science',
    grade: 'P3',
    language: 'zh-Hans',
    problemText: '当冰块被放在太阳下时，冰块会变成水。这个过程叫做什么？',
    topic: 'states of matter',
    description: 'P3 Science — melting in Chinese',
  },

  // ── Chinese MT (P3) ──
  {
    subject: 'chinese_mt',
    grade: 'P3',
    language: 'zh-Hans',
    problemText: '请用"因为……所以……"造一个句子。',
    topic: 'sentence structure',
    description: 'P3 Chinese MT — sentence pattern practice',
  },
  {
    subject: 'chinese_mt',
    grade: 'P3',
    language: 'zh-Hans',
    problemText: '写出"跑"字的笔顺。',
    topic: 'character writing',
    description: 'P3 Chinese MT — stroke order for 跑',
  },
  {
    subject: 'chinese_mt',
    grade: 'P3',
    language: 'en',
    problemText: 'Read the passage:\n\n"今天天气很好。小明和爸爸去公园跑步。他们在公园里看到了很多花。"\n\nQuestion: 小明和谁去了公园？',
    topic: 'reading comprehension',
    description: 'P3 Chinese MT — reading comprehension with pinyin context',
  },
];

export default SAMPLE_QUESTIONS;
