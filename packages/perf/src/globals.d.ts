declare function requestAnimationFrame(
  callback: FrameRequestCallback,
): number
declare function cancelAnimationFrame(handle: number): void

interface Performance {
  now(): number
}
declare const performance: Performance

declare const __DEV__: boolean
