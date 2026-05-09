/**
 * Mock for @tutor-sg/perf package used in mobile tests.
 *
 * All timer functions are no-ops — tests don't need real timing.
 * Statistics and reporting utilities are not mocked (tests use them directly).
 */

export function startSession(): void {}
export function mark(_name: string, _metadata?: Record<string, unknown>): void {}
export function markAbsolute(
  _name: string,
  _timestampMs: number,
  _metadata?: Record<string, unknown>,
): void {}
export function getMarks(): never[] {
  return [];
}
export function getDuration(_from: string, _to: string): null {
  return null;
}
export function reset(): void {}
export function timestamp(): number {
  return Date.now();
}
export function now(): number {
  return Date.now();
}
