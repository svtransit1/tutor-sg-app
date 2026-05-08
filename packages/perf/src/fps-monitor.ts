export interface FpsStats {
  current: number
  min: number
  max: number
  avg: number
  frameCount: number
}

const DEFAULT_WINDOW_SIZE = 60

/** Tracks FPS using requestAnimationFrame. Platform-agnostic. */
export class FpsMonitor {
  private samples: number[] = []
  private rafId: number | null = null
  private running = false
  private lastTimestamp = 0
  private currentStats: FpsStats = {
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    frameCount: 0,
  }
  private windowSize: number

  constructor(windowSize = DEFAULT_WINDOW_SIZE) {
    this.windowSize = windowSize
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.lastTimestamp = this.now()
    this.tick()
  }

  stop(): void {
    this.running = false
    if (this.rafId !== null) {
      this.cancelRaf(this.rafId)
      this.rafId = null
    }
  }

  getStats(): FpsStats {
    return { ...this.currentStats }
  }

  reset(): void {
    this.samples = []
    this.currentStats = {
      current: 0,
      min: 0,
      max: 0,
      avg: 0,
      frameCount: 0,
    }
  }

  get isRunning(): boolean {
    return this.running
  }

  private tick = (): void => {
    if (!this.running) return
    const now = this.now()
    const delta = now - this.lastTimestamp
    this.lastTimestamp = now

    if (delta > 0) {
      const fps = 1000 / delta
      this.samples.push(fps)
      if (this.samples.length > this.windowSize) {
        this.samples.shift()
      }
      this.recalculateStats()
    }

    this.rafId = this.requestRaf(this.tick)
  }

  private recalculateStats(): void {
    if (this.samples.length === 0) return
    let sum = 0
    let min = Number.POSITIVE_INFINITY
    let max = 0
    for (const s of this.samples) {
      sum += s
      if (s < min) min = s
      if (s > max) max = s
    }
    this.currentStats = {
      current: Math.round(this.samples[this.samples.length - 1]),
      min: Math.round(min),
      max: Math.round(max),
      avg: Math.round(sum / this.samples.length),
      frameCount: this.samples.length,
    }
  }

  private now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now()
    }
    return Date.now()
  }

  private requestRaf(cb: () => void): number {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(cb)
    }
    return setTimeout(cb, 16) as unknown as number
  }

  private cancelRaf(id: number): void {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(id)
    } else {
      clearTimeout(id)
    }
  }
}

export const FPS_GREEN_THRESHOLD = 50
export const FPS_YELLOW_THRESHOLD = 30

export function fpsColor(fps: number): string {
  if (fps >= FPS_GREEN_THRESHOLD) return '#4CAF50'
  if (fps >= FPS_YELLOW_THRESHOLD) return '#FF9800'
  return '#F44336'
}
