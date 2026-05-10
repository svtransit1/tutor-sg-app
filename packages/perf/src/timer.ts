import type { PerfMark, PerfSession } from './types';

/**
 * Cross-platform high-resolution timer.
 *
 * In React Native (Hermes), uses the built-in performance.now() API
 * (microsecond resolution). In Node.js, uses process.hrtime.bigint()
 * (nanosecond resolution). Falls back to Date.now() (millisecond resolution)
 * when neither API is available.
 */

let _marks: PerfMark[] = [];
let _startTime = 0;

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  if (typeof process !== 'undefined' && process.hrtime?.bigint) {
    const NS_PER_MS = 1_000_000n;
    return Number(process.hrtime.bigint() / NS_PER_MS);
  }
  return Date.now();
}

export function startSession(): void {
  _marks = [];
  _startTime = now();
}

export function mark(name: string, metadata?: Record<string, unknown>): void {
  _marks.push({
    name,
    timestampMs: now() - _startTime,
    ...(metadata ? { metadata } : {}),
  });
}

export function markAbsolute(
  name: string,
  timestampMs: number,
  metadata?: Record<string, unknown>,
): void {
  _marks.push({
    name,
    timestampMs,
    ...(metadata ? { metadata } : {}),
  });
}

export function getMarks(): ReadonlyArray<PerfMark> {
  return _marks;
}

export function getDuration(fromMark: string, toMark: string): number | null {
  const from = _marks.find((m) => m.name === fromMark);
  const to = _marks.find((m) => m.name === toMark);
  if (!from || !to) return null;
  return to.timestampMs - from.timestampMs;
}

export function reset(): void {
  _marks = [];
  _startTime = 0;
}

export function timestamp(): number {
  return now();
}

export { now };

/**
 * Build a PerfSession from the current timer state.
 *
 * Call after collecting marks to produce a serialisable session record
 * suitable for the bench CLI or cross-run comparison.
 */
export function buildSession(
  id: string,
  scenario: 'cold-start' | 'photo-to-first-token',
  platform: 'ios' | 'android' | 'unknown' = 'unknown',
  deviceTier: 'high' | 'mid' | 'low' | 'unknown' = 'unknown',
): PerfSession {
  return {
    id,
    scenario,
    platform,
    deviceTier,
    marks: [..._marks],
    startedAt: new Date().toISOString(),
  };
}
