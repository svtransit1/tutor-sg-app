import { describe, it, expect, beforeEach } from 'vitest';
import {
  startSession,
  mark,
  markAbsolute,
  getMarks,
  getDuration,
  reset,
  timestamp,
  now,
} from '../timer';

describe('timer', () => {
  beforeEach(() => {
    reset();
  });

  it('startSession initialises mark list', () => {
    startSession();
    const marks = getMarks();
    expect(marks).toHaveLength(0);
  });

  it('mark records a named timing mark', () => {
    startSession();
    mark('test_event');
    const marks = getMarks();
    expect(marks).toHaveLength(1);
    expect(marks[0].name).toBe('test_event');
    expect(marks[0].timestampMs).toBeGreaterThanOrEqual(0);
  });

  it('mark carries optional metadata', () => {
    startSession();
    mark('with_meta', { size: 42 });
    const marks = getMarks();
    expect(marks[0].metadata).toEqual({ size: 42 });
  });

  it('getDuration computes time between two marks', async () => {
    startSession();
    mark('start');
    await new Promise((r) => setTimeout(r, 10));
    mark('end');
    const d = getDuration('start', 'end');
    expect(d).toBeGreaterThanOrEqual(5);
  });

  it('getDuration returns null when marks are missing', () => {
    startSession();
    mark('only_one');
    expect(getDuration('a', 'b')).toBeNull();
  });

  it('markAbsolute records a given timestamp', () => {
    startSession();
    markAbsolute('absolute', 5000);
    const marks = getMarks();
    expect(marks[0].timestampMs).toBe(5000);
  });

  it('reset clears marks', () => {
    startSession();
    mark('x');
    reset();
    startSession();
    expect(getMarks()).toHaveLength(0);
  });

  it('timestamp / now are non-zero', () => {
    const t = timestamp();
    expect(t).toBeGreaterThan(0);
    expect(now()).toBeGreaterThan(0);
  });
});
