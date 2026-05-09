import { parseQuestions } from '../PhotoReviewScreen';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
}));

describe('parseQuestions', () => {
  it('returns null for undefined', () => { expect(parseQuestions(undefined)).toBeNull(); });
  it('parses valid JSON', () => {
    const r = parseQuestions(JSON.stringify([{ questionNumber: 1, subject: 'math', topic: 'A', questionText: 'q', scaffoldedHelp: { hint: 'h', guidedSteps: ['s'], workedSolution: 'a' } }]));
    expect(r).toHaveLength(1); expect(r![0].questionNumber).toBe(1);
  });
  it('returns null for invalid JSON', () => expect(parseQuestions('bad')).toBeNull());
  it('returns null for non-array', () => expect(parseQuestions('{}')).toBeNull());
  it('handles empty array', () => expect(parseQuestions('[]')).toEqual([]));
  it('handles string[] param', () => {
    const d = JSON.stringify([{ questionNumber: 1, subject: 'math', topic: 'T', questionText: 'q', scaffoldedHelp: { hint: 'h', guidedSteps: ['s'], workedSolution: 'a' } }]);
    expect(parseQuestions([d])).toHaveLength(1);
  });
});
