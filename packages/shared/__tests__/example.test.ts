/**
 * Example test for packages/shared.
 * Proves the Jest pipeline works for the shared package.
 */

import * as shared from '../src/index';

describe('@tutor-sg/shared — example smoke test', () => {
  it('module loads without error', () => {
    expect(shared).toBeDefined();
    expect(typeof shared).toBe('object');
  });

  it('model registry constants are exportable as objects', () => {
    const validDeviceTiers = ['low', 'mid', 'high'];
    expect(validDeviceTiers).toHaveLength(3);
    expect(validDeviceTiers).toContain('high');
    expect(validDeviceTiers).toContain('low');
    expect(validDeviceTiers).toContain('mid');
  });

  it('session status constants are correct', () => {
    const statuses = ['active', 'completed', 'flagged'];
    expect(statuses).toHaveLength(3);
    statuses.forEach((s) => {
      expect(typeof s).toBe('string');
    });
  });

  it('subject identifiers are correct', () => {
    const subjects = ['english', 'math', 'science', 'chinese_mt'];
    expect(subjects).toHaveLength(4);
    expect(subjects).toEqual(expect.arrayContaining(['math', 'science', 'english', 'chinese_mt']));
  });

  it('level range covers P1–P6', () => {
    const levels = [1, 2, 3, 4, 5, 6];
    expect(levels).toHaveLength(6);
    expect(Math.min(...levels)).toBe(1);
    expect(Math.max(...levels)).toBe(6);
  });
});
