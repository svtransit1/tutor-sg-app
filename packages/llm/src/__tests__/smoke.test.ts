import {
  MODEL_ROUTING,
  CAPABILITY_BUDGETS,
  resolveModel,
  type Subject,
  type ModelId,
  type InferenceTier,
  type CapabilityBudget,
} from '../index';

describe('@tutor-sg/llm — smoke test', () => {
  it('MODEL_ROUTING covers all 4 subjects', () => {
    expect(MODEL_ROUTING.english).toBeDefined();
    expect(MODEL_ROUTING.math).toBeDefined();
    expect(MODEL_ROUTING.science).toBeDefined();
    expect(MODEL_ROUTING.chinese_mt).toBeDefined();
  });

  it('resolveModel returns correct values', () => {
    expect(resolveModel('english', 'high')).toBe('gemma-e4b');
    expect(resolveModel('english', 'mid')).toBe('gemma-e2b');
    expect(resolveModel('chinese_mt', 'high')).toBe('qwen-4b');
    expect(resolveModel('chinese_mt', 'mid')).toBe('qwen-2b');
  });

  it('CAPABILITY_BUDGETS has 3 entries', () => {
    expect(CAPABILITY_BUDGETS.length).toBe(3);
  });

  it('ModelId type covers all expected values', () => {
    const ids: ModelId[] = ['gemma-e4b', 'gemma-e2b', 'qwen-4b', 'qwen-2b'];
    expect(ids.length).toBe(4);
  });
});
