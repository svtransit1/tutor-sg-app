/**
 * Tests for the LLM response parser.
 */
import { parseInferenceResponse } from '../response-parser';

describe('parseInferenceResponse', () => {
  it('parses valid JSON with one question', () => {
    const raw = JSON.stringify({
      questions: [
        {
          questionIndex: 1,
          questionText: 'What is 3/4 of 20?',
          detectedSubject: 'math',
          detectedTopic: 'Fractions',
          hint: 'Think of 20 split into 4 equal groups.',
          steps: [
            { step: 1, description: 'Find 1/4 of 20: 20 ÷ 4 = 5' },
            { step: 2, description: 'Multiply by 3: 5 × 3 = 15' },
          ],
          fullSolution: 'Answer: 15',
        },
      ],
      subject: 'math',
      confidence: 0.95,
    });

    const result = parseInferenceResponse(raw, 1);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].questionIndex).toBe(1);
    expect(result.questions[0].hint).toContain('20');
    expect(result.questions[0].steps).toHaveLength(2);
    expect(result.subject).toBe('math');
    expect(result.confidence).toBe(0.95);
    expect(result.error).toBeUndefined();
  });

  it('handles markdown code fences', () => {
    const raw = 'Here is the response:\n```json\n{\n  "questions": [{\n    "questionIndex": 1,\n    "questionText": "Test question",\n    "hint": "Test hint",\n    "steps": [],\n    "fullSolution": "Answer"\n  }],\n  "subject": "english",\n  "confidence": 0.8\n}\n```';

    const result = parseInferenceResponse(raw, 1);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].questionText).toBe('Test question');
    expect(result.subject).toBe('english');
  });

  it('normalises chinese_mt subject from "chinese"', () => {
    const raw = JSON.stringify({
      questions: [{
        questionIndex: 1,
        questionText: '造句',
        hint: 'Hint',
        steps: [{ step: 1, description: 'Step 1' }],
        fullSolution: 'Solution',
      }],
      subject: 'chinese',
      confidence: 0.9,
    });

    const result = parseInferenceResponse(raw, 1);
    expect(result.subject).toBe('chinese_mt');
  });

  it('returns error when no questions detected', () => {
    const raw = JSON.stringify({ subject: 'math', confidence: 0 });

    const result = parseInferenceResponse(raw, 1);
    expect(result.questions).toHaveLength(0);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('no_questions_detected');
  });

  it('clamps confidence to 0–1 range', () => {
    const raw = JSON.stringify({
      questions: [{
        questionIndex: 1,
        questionText: 'Q',
        hint: 'H',
        steps: [{ step: 1, description: 'S' }],
        fullSolution: 'A',
      }],
      subject: 'math',
      confidence: 1.5,
    });

    const result = parseInferenceResponse(raw, 1);
    expect(result.confidence).toBe(1);
  });

  it('handles empty questions array gracefully', () => {
    const raw = JSON.stringify({
      questions: [],
      subject: 'math',
      confidence: 0.9,
    });

    const result = parseInferenceResponse(raw, 0);
    expect(result.error?.code).toBe('no_questions_detected');
  });
});
