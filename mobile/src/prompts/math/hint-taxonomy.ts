/**
 * Hint-level taxonomy — 4 escalation tiers with prompt templates.
 * Each level includes: system instruction, response template, and escalation trigger.
 * Bilingual EN + zh-Hans.
 */

export const HINT_LEVEL_TEMPLATES = {
  level1_nudge: {
    en: {
      systemInstruction:
        'Give a Level 1 hint (nudge). Do NOT solve any part of the problem. Instead, redirect the student\'s attention to something they already know. Ask a simple leading question that points them toward the right approach. Keep it to 1–2 sentences maximum.',
      responseTemplate:
        'Think about {concept}. What do you remember about {related_idea}?\n\nCan you try using that here?',
      escalationTrigger:
        'Escalate to Level 2 only if the student says they don\'t understand the nudge or gives an answer unrelated to the question.',
    },
    'zh-Hans': {
      systemInstruction:
        '给出第1级提示（引导）。不要解答题目的任何部分。相反，将学生的注意力引向他们已经知道的知识。问一个简单的引导性问题，指向正确的方法。最多1–2句话。',
      responseTemplate:
        '想一想{concept}。你记得关于{related_idea}的什么内容？\n\n你能试着用在这里吗？',
      escalationTrigger:
        '只有当学生说听不懂引导，或给出了与题目无关的答案时，才升级到第2级。',
    },
  },

  level2_partial: {
    en: {
      systemInstruction:
        'Give a Level 2 hint (partial step). Show the student the first concrete step they should take, or point out a key relationship in the problem. Do NOT complete the solution. Leave at least 2 more steps for them to do. Ask them to continue from there.',
      responseTemplate:
        'Here\'s how to start:\n\nStep 1: {first_step}\n\nNow it\'s your turn! What comes next?',
      escalationTrigger:
        'Escalate to Level 3 only if the student\'s next attempt is wrong or they explicitly ask for another hint.',
    },
    'zh-Hans': {
      systemInstruction:
        '给出第2级提示（部分步骤）。向学生展示他们应该采取的第一个具体步骤，或指出题目中的关键关系。不要完成解答——至少留2个步骤让他们自己做。请他们继续完成。',
      responseTemplate:
        '可以这样开始：\n\n第1步：{first_step}\n\n接下来轮到你了！你觉得下一步是什么？',
      escalationTrigger:
        '只有当学生的下一次尝试错误，或他们明确要求更多提示时，才升级到第3级。',
    },
  },

  level3_guided: {
    en: {
      systemInstruction:
        'Give a Level 3 hint (guided solution). Walk through the full solution structure, but leave key numbers or calculations as blanks for the student to fill in. Use "___" for blanks. Frame it as a collaborative walkthrough. The student should still be doing some work.',
      responseTemplate:
        'Let\'s work through this together:\n\nStep 1: {step_1_completed}\nStep 2: {step_2_with_blanks}\nStep 3: {step_3_with_blanks}\n\nCan you fill in the blanks? Try calculating {target_calculation}.',
      escalationTrigger:
        'Escalate to Level 4 (full solution) ONLY if the student explicitly says "I give up", "show me the answer", or "explain everything". Otherwise, keep trying at Level 3.',
    },
    'zh-Hans': {
      systemInstruction:
        '给出第3级提示（引导式解答）。展示完整的解答结构，但将关键数字或计算留空让学生填写。用"___"表示空白。以合作引导的方式呈现。学生仍然需要做一些工作。',
      responseTemplate:
        '我们一起来做：\n\n第1步：{step_1_completed}\n第2步：{step_2_with_blanks}\n第3步：{step_3_with_blanks}\n\n你能填上空白吗？试着算出{target_calculation}。',
      escalationTrigger:
        '只有在学生明确说"我放弃了""告诉我答案"或"全部解释给我听"时，才升级到第4级（完整解答）。否则保持在第3级。',
    },
  },

  level4_full: {
    en: {
      systemInstruction:
        'The student has explicitly asked for the full solution. Provide a complete worked solution with all steps clearly labeled. After showing the solution, add a brief encouraging note and ask if they understand which step was hardest.',
      responseTemplate:
        'Here\'s the full solution:\n\nStep 1: {step_1}\nStep 2: {step_2}\nStep 3: {step_3}\nStep 4: {step_4}\nAnswer: {final_answer}\n\nWhich step was the hardest for you? Let me know if you want to practice a similar question!',
      escalationTrigger:
        'No further escalation needed — this is the terminal level. After showing the full solution, offer to give a similar practice question.',
    },
    'zh-Hans': {
      systemInstruction:
        '学生已明确要求完整解答。提供完整的逐步解答，每一步都清晰标注。解答完毕后，加上一句鼓励的话，并问学生觉得哪一步最难。',
      responseTemplate:
        '完整的解答如下：\n\n第1步：{step_1}\n第2步：{step_2}\n第3步：{step_3}\n第4步：{step_4}\n答案：{final_answer}\n\n你觉得哪一步最难？如果想练习类似的题目就告诉我！',
      escalationTrigger:
        '无需进一步升级——这是最后一级。展示完整解答后，主动提供一道类似的练习题。',
    },
  },
} as const;

export type HintLevelKey = keyof typeof HINT_LEVEL_TEMPLATES;
export type HintLang = 'en' | 'zh-Hans';

export function getHintTemplate(level: HintLevelKey, lang: HintLang) {
  return HINT_LEVEL_TEMPLATES[level][lang];
}
