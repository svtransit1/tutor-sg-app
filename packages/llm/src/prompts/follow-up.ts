import type { FollowUpContext, PromptOutput } from '../types';
import { buildToneSection } from './tone';
import { buildSubjectSection } from './subject-adapters';

function buildSystemPrompt(context: FollowUpContext): string {
  const { subject, grade, language } = context;
  const sections: string[] = [];

  sections.push(buildToneSection(language));
  sections.push('');

  if (language === 'en') {
    sections.push(`## Your Task
The student is working on a homework problem and has asked a follow-up question. Your job:
1. Answer the follow-up question directly and concisely (2-4 sentences).
2. Stay on topic — don't introduce new concepts or solve different problems.
3. If the student seems confused, gently redirect to the hint or guided steps.
4. Never give the full answer unless the student explicitly asks "what is the answer" or "I give up".
5. Keep your response appropriate for a P${grade} student.`);
    sections.push('');
    sections.push(`## Original Problem
The student was working on this problem:
<original_question>
{original_question}
</original_question>`);
    sections.push('');
    sections.push(`## Previous Help Given
<previous_hints>
{previous_hints}
</previous_hints>`);
    sections.push('');
    sections.push(buildSubjectSection(subject, language));
    sections.push('');
    sections.push(`## Important
- Respond in 2-4 sentences maximum.
- Be encouraging but stay focused on the question.
- If the follow-up is off-topic, gently bring them back to the homework.
- Use the same language as the student.`);
  } else {
    sections.push(`## 你的任务
学生正在做作业，问了一个后续问题。你的工作是：
1. 直接简洁地回答后续问题（2-4句话）。
2. 保持主题——不要引入新概念或解决其他问题。
3. 如果学生看起来困惑了，温柔地引导回提示或引导步骤。
4. 除非学生明确问"答案是什么"或"我放弃了"，否则绝不要给出完整答案。
5. 保持回答适合小${grade}学生的水平。`);
    sections.push('');
    sections.push(`## 原问题
学生正在做这道题：
<original_question>
{original_question}
</original_question>`);
    sections.push('');
    sections.push(`## 之前的帮助
<previous_hints>
{previous_hints}
</previous_hints>`);
    sections.push('');
    sections.push(buildSubjectSection(subject, language));
    sections.push('');
    sections.push(`## 重要
- 最多回答2-4句话。
- 要鼓励但保持专注于问题。
- 如果后续问题偏离主题，温柔地把他们带回作业。
- 使用与学生相同的语言。`);
  }

  return sections.join('\n');
}

export function buildFollowUpPrompt(context: FollowUpContext): PromptOutput {
  const previousHints = context.previousHints
    ?? (context.language === 'en' ? 'No hints given yet.' : '还没有给出提示。');

  const userPrompt = context.language === 'en'
    ? `**Student's follow-up question:**\n${context.followUpQuestion}`
    : `**学生的后续问题：**\n${context.followUpQuestion}`;

  return {
    system: buildSystemPrompt(context)
      .replace('{original_question}', context.originalQuestion)
      .replace('{previous_hints}', previousHints),
    user: userPrompt,
  };
}

export function buildFollowUpSystemPrompt(context: FollowUpContext): string {
  return buildFollowUpPrompt(context).system;
}

export function buildFollowUpUserPrompt(context: FollowUpContext): string {
  return buildFollowUpPrompt(context).user;
}
