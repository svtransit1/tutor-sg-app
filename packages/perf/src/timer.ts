import type { PerfMark } from './types';

/**
 * Cross-platform high-resolution timer.
 *
 * In React Native (Hermes), uses the built-in performance.now() API.
 * Falls back to Date.now() when performance API is unavailable (Node.js tests, older runtimes).
 *
 * Resolution: microsecond-level in RN/Hermes, millisecond-level with Date fallback.
 */

let _marks: PerfMark[] = [];
let _startTime = 0;

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
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
