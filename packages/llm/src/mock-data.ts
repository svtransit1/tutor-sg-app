/**
 * Mock data — realistic Singapore primary school homework scenarios
 * for development and testing of the camera → LLM bridge.
 *
 * Each entry maps keyword triggers (comma-separated) to a full InferenceResponse.
 * This lets the mock bridge respond believably during development.
 *
 * Topics aligned to MOE P1–P6 syllabus:
 * - P3 Math: multiplication, division, fractions (basic)
 * - P3 English: grammar, comprehension
 * - P4 Math: fractions, decimals, area/perimeter
 * - P5 Math: percentages, ratio, volume
 * - P6 Math: PSLE-style problem sums
 */

import type { InferenceResponse } from './types';

export const MOCK_RESPONSES: Record<string, InferenceResponse> = {
  // ── P3 Math: Multiplication & Division ──────────────────────────

  'multiply, multiplication, times, ×, 乘法': {
    sessionId: 'mock-multiply-1',
    createdAt: new Date().toISOString(),
    subject: 'math',
    confidence: 0.96,
    questions: [
      {
        questionIndex: 1,
        questionText: 'There are 4 rows of chairs. Each row has 6 chairs. How many chairs are there altogether?',
        detectedSubject: 'math',
        detectedTopic: 'Multiplication',
        hint: 'This is about grouping! Each row is a group. How many chairs in each group? How many groups are there? Try drawing 4 circles and putting 6 dots in each one.',
        steps: [
          {
            step: 1,
            description: 'Identify what we know: 4 rows, 6 chairs per row.',
          },
          {
            step: 2,
            description: 'We need to find the total. When we have equal groups, we multiply: number of groups × items in each group.',
          },
          {
            step: 3,
            description: 'Write it as: 4 × 6 = ?',
            working: '4 × 6 = 24',
          },
        ],
        fullSolution: 'There are 4 rows with 6 chairs in each row.\n4 × 6 = 24\nThere are 24 chairs altogether.',
        suggestedFollowUp: 'If there were 5 rows instead, how many chairs would there be?',
      },
    ],
  },

  // ── P4 Math: Fractions ──────────────────────────────────────────

  'fraction, fraction, 分数': {
    sessionId: 'mock-fraction-1',
    createdAt: new Date().toISOString(),
    subject: 'math',
    confidence: 0.94,
    questions: [
      {
        questionIndex: 1,
        questionText: 'What is 3/4 of 20?',
        detectedSubject: 'math',
        detectedTopic: 'Fractions of a set',
        hint: 'Think of 20 objects split into 4 equal groups. How many in each group? Then take 3 of those groups.',
        steps: [
          {
            step: 1,
            description: 'First, find 1/4 of 20. Divide 20 by 4.',
            working: '20 ÷ 4 = 5',
          },
          {
            step: 2,
            description: 'Now we want 3/4. Multiply 1/4 (which is 5) by 3.',
            working: '5 × 3 = 15',
          },
          {
            step: 3,
            description: 'So 3/4 of 20 is 15.',
            working: '3/4 × 20 = 15',
          },
        ],
        fullSolution: 'Step 1: Find 1/4 of 20 → 20 ÷ 4 = 5\nStep 2: Multiply by 3 → 5 × 3 = 15\nAnswer: 3/4 of 20 = 15',
        suggestedFollowUp: 'Can you find 2/5 of 30?',
      },
    ],
  },

  // ── P5 Math: Percentage ─────────────────────────────────────────

  'percent, %, percentage, 百分比': {
    sessionId: 'mock-percent-1',
    createdAt: new Date().toISOString(),
    subject: 'math',
    confidence: 0.97,
    questions: [
      {
        questionIndex: 1,
        questionText: 'A bag costs $80. It is now sold at 25% discount. What is the sale price?',
        detectedSubject: 'math',
        detectedTopic: 'Percentage discount',
        hint: 'Discount means the amount you save. Find 25% of $80 first. Then subtract from the original price.',
        steps: [
          {
            step: 1,
            description: 'Find the discount amount. 25% of $80 = ?',
            working: '25% = 25/100 = 1/4\n1/4 × $80 = $20',
          },
          {
            step: 2,
            description: 'Subtract the discount from the original price.',
            working: '$80 - $20 = $60',
          },
          {
            step: 3,
            description: 'The sale price is $60.',
            working: 'Answer: $60',
          },
        ],
        fullSolution: 'Discount = 25% of $80 = $20\nSale price = $80 - $20 = $60\nAnswer: The bag costs $60 on sale.',
        suggestedFollowUp: 'If there is an additional 10% off the sale price, how much would you pay?',
      },
    ],
  },

  // ── P6 Math: PSLE Problem Sum ───────────────────────────────────

  'ratio, psle, problem sum, 比例': {
    sessionId: 'mock-psle-ratio-1',
    createdAt: new Date().toISOString(),
    subject: 'math',
    confidence: 0.93,
    questions: [
      {
        questionIndex: 1,
        questionText: 'The ratio of boys to girls in a school is 3 : 5. There are 240 more girls than boys. How many students are there altogether?',
        detectedSubject: 'math',
        detectedTopic: 'Ratio and difference',
        hint: 'The difference in ratio is 5 - 3 = 2 parts. If 2 parts = 240 students, how many students is 1 part?',
        steps: [
          {
            step: 1,
            description: 'Find the difference in ratio parts.',
            working: 'Girls - Boys = 5 - 3 = 2 parts',
          },
          {
            step: 2,
            description: 'The difference of 2 parts equals 240 students. Find 1 part.',
            working: '1 part = 240 ÷ 2 = 120 students',
          },
          {
            step: 3,
            description: 'Total parts = 3 + 5 = 8 parts.',
          },
          {
            step: 4,
            description: 'Multiply to find total students.',
            working: '8 × 120 = 960 students',
          },
        ],
        fullSolution: 'Difference in ratio = 5 - 3 = 2 parts\n2 parts = 240 students\n1 part = 240 ÷ 2 = 120\nTotal parts = 3 + 5 = 8\nTotal students = 8 × 120 = 960\nAnswer: There are 960 students altogether.',
        suggestedFollowUp: 'How many boys and how many girls are there?',
      },
    ],
  },

  // ── P3 English: Grammar ─────────────────────────────────────────

  'grammar, verb, tense, 语法': {
    sessionId: 'mock-grammar-1',
    createdAt: new Date().toISOString(),
    subject: 'english',
    confidence: 0.91,
    questions: [
      {
        questionIndex: 1,
        questionText: 'Fill in the blank: Yesterday, Sarah _____ (go) to the library.',
        detectedSubject: 'english',
        detectedTopic: 'Past tense verbs',
        hint: 'The word "yesterday" tells us this happened in the past. What is the past tense of "go"?',
        steps: [
          {
            step: 1,
            description: 'Look for time clues. "Yesterday" means past tense.',
          },
          {
            step: 2,
            description: 'Irregular verbs don\'t follow the -ed rule. "Go" is irregular.',
          },
          {
            step: 3,
            description: 'The past tense of "go" is "went".',
            working: 'go → went',
          },
        ],
        fullSolution: '"Yesterday" tells us the action is in the past.\n"Go" is an irregular verb — its past tense is "went".\nAnswer: Yesterday, Sarah went to the library.',
        suggestedFollowUp: 'What about the past tense of "eat"? Can you use it in a sentence?',
      },
    ],
  },

  // ── P4 Science: Matter ──────────────────────────────────────────

  'science, matter, solid, liquid, gas, 科学': {
    sessionId: 'mock-science-1',
    createdAt: new Date().toISOString(),
    subject: 'science',
    confidence: 0.95,
    questions: [
      {
        questionIndex: 1,
        questionText: 'Name one way to change a liquid into a solid.',
        detectedSubject: 'science',
        detectedTopic: 'States of matter',
        hint: 'Think about what happens to water when you put it in the freezer. What causes liquid to become solid?',
        steps: [
          {
            step: 1,
            description: 'Recall the three states of matter: solid, liquid, gas.',
          },
          {
            step: 2,
            description: 'To go from liquid to solid, the temperature must drop enough.',
          },
          {
            step: 3,
            description: 'This process is called freezing. The temperature needs to reach the freezing point.',
            working: 'Liquid → (freezing) → Solid',
          },
        ],
        fullSolution: 'One way to change a liquid into a solid is by freezing it. When a liquid is cooled to its freezing point, it changes from a liquid state to a solid state.\nExample: Water freezes into ice at 0°C.',
        suggestedFollowUp: 'What is the process called when a solid turns into a liquid?',
      },
    ],
  },

  // ── Chinese MT (华文) ────────────────────────────────────────────

  '华文, 中文, 组词, 造句': {
    sessionId: 'mock-chinese-1',
    createdAt: new Date().toISOString(),
    subject: 'chinese_mt',
    confidence: 0.92,
    questions: [
      {
        questionIndex: 1,
        questionText: '用"快乐"造句。',
        detectedSubject: 'chinese_mt',
        detectedTopic: '造句',
        hint: '想一想，"快乐"是什么意思？什么时候你会感到快乐？可以用"我感到…"开头。',
        steps: [
          {
            step: 1,
            description: '先理解"快乐"的意思——就是开心、高兴。',
          },
          {
            step: 2,
            description: '想一个让你开心的场景，比如过生日、和朋友玩。',
          },
          {
            step: 3,
            description: '把"快乐"放进句子里。例如：我今天很快乐。',
            working: '例句：我和朋友一起玩耍，感到非常快乐。',
          },
        ],
        fullSolution: '"快乐"的意思是开心、高兴。\n例句1：我和家人一起吃饭，很快乐。\n例句2：考试得了好成绩，我感到很快乐。\n\n造句时，先想一个开心的场景，然后把"快乐"用在句子里。',
        suggestedFollowUp: '试试用"认真"造一个句子。',
      },
    ],
  },

  // ── Addition / Subtraction (P1-P2 level) ────────────────────────

  'add, plus, sum, +, total, 加法': {
    sessionId: 'mock-add-1',
    createdAt: new Date().toISOString(),
    subject: 'math',
    confidence: 0.98,
    questions: [
      {
        questionIndex: 1,
        questionText: 'Tom has 12 apples. His mother gives him 8 more apples. How many apples does Tom have now?',
        detectedSubject: 'math',
        detectedTopic: 'Addition within 20',
        hint: 'Tom starts with some apples and gets more. When we "add more" or "get more", we add the numbers together.',
        steps: [
          {
            step: 1,
            description: 'Tom starts with 12 apples.',
          },
          {
            step: 2,
            description: 'He gets 8 more apples. "More" means we add.',
            working: '12 + 8 = ?',
          },
          {
            step: 3,
            description: 'Count up from 12: 13, 14, 15, 16, 17, 18, 19, 20.',
            working: '12 + 8 = 20',
          },
        ],
        fullSolution: 'Tom had 12 apples.\nMother gives him 8 more.\n12 + 8 = 20\nTom now has 20 apples.',
        suggestedFollowUp: 'If Tom eats 3 apples, how many are left?',
      },
    ],
  },
};
