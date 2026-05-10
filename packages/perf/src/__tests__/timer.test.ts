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
  buildSession,
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

  it('buildSession creates a valid PerfSession', () => {
    startSession();
    mark('js_module_load', { chipset: 'A15' });
    mark('first_interactive_frame');
    const session = buildSession('cs-1', 'cold-start', 'ios', 'high');
    expect(session.id).toBe('cs-1');
    expect(session.scenario).toBe('cold-start');
    expect(session.platform).toBe('ios');
    expect(session.deviceTier).toBe('high');
    expect(session.marks).toHaveLength(2);
    expect(session.marks[0].name).toBe('js_module_load');
    expect(session.marks[0].metadata).toEqual({ chipset: 'A15' });
    expect(session.startedAt).toBeTruthy();
  });

  it('buildSession snapshots current marks without side-effects', () => {
    startSession();
    mark('a');
    const s1 = buildSession('s1', 'photo-to-first-token');
    mark('b');
    const s2 = buildSession('s2', 'photo-to-first-token');
    expect(s1.marks).toHaveLength(1);
    expect(s2.marks).toHaveLength(2);
  });
});
