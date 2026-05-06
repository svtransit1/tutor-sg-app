import { FeedbackBlock, Subject } from '../types/homework';
import { v4 as uuidv4 } from 'uuid';

export interface LlmService {
  generateFeedback(
    subject: Subject,
    ocrText: string,
    onToken?: (token: string) => void,
  ): Promise<{ blocks: FeedbackBlock[]; rawResponse: string }>;
}

const MODEL_ROUTING: Record<Subject, string> = {
  math: 'gemma-e4b',
  english: 'gemma-e4b',
  science: 'gemma-e4b',
  chinese_mt: 'qwen-4b',
};

/**
 * Platform-agnostic LLM service.
 * For v1: mock implementation that generates structured feedback.
 * Replace with ExecuTorch (iOS) / LiteRT-LM (Android) native modules when ready.
 */
export class MockLlmService implements LlmService {
  async generateFeedback(
    subject: Subject,
    ocrText: string,
    onToken?: (token: string) => void,
  ): Promise<{ blocks: FeedbackBlock[]; rawResponse: string }> {
    const model = MODEL_ROUTING[subject];

    await simulateDelay(1500);

    const feedbackBlocks: FeedbackBlock[] = generateMockFeedback(subject, ocrText, onToken);
    const rawResponse = JSON.stringify(feedbackBlocks, null, 2);

    return { blocks: feedbackBlocks, rawResponse };
  }
}

function generateMockFeedback(
  subject: Subject,
  _ocrText: string,
  onToken?: (token: string) => void,
): FeedbackBlock[] {
  const isChinese = subject === 'chinese_mt';

  const blocks: FeedbackBlock[] = [
    {
      id: uuidv4(),
      type: 'hint',
      title: isChinese ? '提示' : 'Hint',
      content: isChinese
        ? '让我们一步一步来。先看看第一题：25 × 4。想想乘法的规律。'
        : "Let's work through this step by step. Look at the first question: 25 × 4. Think about what happens when you multiply by 4.",
    },
    {
      id: uuidv4(),
      type: 'step',
      title: isChinese ? '步骤 1' : 'Step 1',
      content: isChinese
        ? '25 × 4 = 100。你可以把25分成20+5，然后分别乘以4：20×4=80，5×4=20，80+20=100。'
        : '25 × 4 = 100. You can break 25 into 20 + 5, then multiply each by 4: 20×4=80, 5×4=20, 80+20=100.',
    },
    {
      id: uuidv4(),
      type: 'step',
      title: isChinese ? '步骤 2' : 'Step 2',
      content: isChinese
        ? '3/4 + 1/8：先找公分母。4和8的最小公倍数是8。3/4 = 6/8，所以 6/8 + 1/8 = 7/8。'
        : '3/4 + 1/8: Find a common denominator first. The LCM of 4 and 8 is 8. So 3/4 = 6/8, and 6/8 + 1/8 = 7/8.',
    },
    {
      id: uuidv4(),
      type: 'solution',
      title: isChinese ? '解答' : 'Solution',
      content: isChinese
        ? '三角形面积 = 1/2 × 底 × 高 = 1/2 × 6 × 8 = 24 平方厘米。'
        : 'Area of triangle = 1/2 × base × height = 1/2 × 6 × 8 = 24 cm².',
    },
  ];

  if (onToken) {
    for (const block of blocks) {
      const tokens = block.content.split(' ');
      for (const token of tokens) {
        onToken(token + ' ');
      }
    }
  }

  return blocks;
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
