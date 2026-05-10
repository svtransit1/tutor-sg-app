import type { ColdStartResult } from './types';

let loadTimestampMs: number | null = null;
let firstFrameTimestampMs: number | null = null;
let interactiveTimestampMs: number | null = null;

export function markColdStartLoad(): void {
  if (loadTimestampMs === null) {
    loadTimestampMs = Date.now();
  }
}

export function markColdStartFirstFrame(): void {
  if (firstFrameTimestampMs === null) {
    firstFrameTimestampMs = Date.now();
  }
}

export function markColdStartInteractive(): void {
  if (interactiveTimestampMs === null) {
    interactiveTimestampMs = Date.now();
  }
}

export function getColdStartResult(): ColdStartResult | null {
  if (!loadTimestampMs) return null;
  return {
    loadTimeMs: 0,
    firstFrameMs: firstFrameTimestampMs
      ? firstFrameTimestampMs - loadTimestampMs
      : 0,
    interactiveMs: interactiveTimestampMs
      ? interactiveTimestampMs - loadTimestampMs
      : 0,
  };
}

export function resetColdStart(): void {
  loadTimestampMs = null;
  firstFrameTimestampMs = null;
  interactiveTimestampMs = null;
}
