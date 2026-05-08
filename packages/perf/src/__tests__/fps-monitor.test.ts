import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { FpsMonitor } from '../fps-monitor'

/** Mock timing helpers for deterministic FPS testing */
function createMockTimers() {
  let now = 0
  const rafCallbacks: Array<() => void> = []
  let rafIdCounter = 0

  function advanceFrames(count: number, deltaPerFrame = 16.67) {
    for (let i = 0; i < count; i++) {
      now += deltaPerFrame
      const cbs = [...rafCallbacks]
      rafCallbacks.length = 0
      cbs.forEach((cb) => cb())
    }
  }

  function stepOneFrame(delta = 16.67) {
    advanceFrames(1, delta)
  }

  return {
    now: () => now,
    requestAnimationFrame: (cb: () => void) => {
      const id = ++rafIdCounter
      rafCallbacks.push(cb)
      return id
    },
    cancelAnimationFrame: () => {
      rafCallbacks.length = 0
    },
    advanceFrames,
    stepOneFrame,
    cleanup: () => {
      rafCallbacks.length = 0
    },
  }
}

describe('FpsMonitor', () => {
  let mock: ReturnType<typeof createMockTimers>

  beforeEach(() => {
    mock = createMockTimers()
    // Inject mocks
    Object.defineProperty(globalThis, 'performance', {
      value: { now: mock.now },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      value: mock.requestAnimationFrame,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      value: mock.cancelAnimationFrame,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    mock.cleanup()
    delete (globalThis as Record<string, unknown>).performance
    delete (globalThis as Record<string, unknown>).requestAnimationFrame
    delete (globalThis as Record<string, unknown>).cancelAnimationFrame
  })

  it('returns zero stats before starting', () => {
    const monitor = new FpsMonitor()
    const stats = monitor.getStats()
    expect(stats.current).toBe(0)
    expect(stats.avg).toBe(0)
    expect(stats.frameCount).toBe(0)
  })

  it('tracks FPS after frames elapse', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    // At 16.67ms per frame → ~60 FPS
    mock.advanceFrames(10, 16.67)
    const stats = monitor.getStats()
    expect(stats.frameCount).toBe(10)
    expect(stats.current).toBeCloseTo(60, -1) // Within ~10 FPS
    monitor.stop()
  })

  it('approximates 60 FPS with 16.67ms deltas', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.advanceFrames(30, 16.67)
    const stats = monitor.getStats()
    expect(stats.avg).toBeCloseTo(60, -1)
    expect(stats.min).toBeCloseTo(60, -1)
    expect(stats.max).toBeCloseTo(60, -1)
    monitor.stop()
  })

  it('approximates 30 FPS with 33.33ms deltas', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.advanceFrames(30, 33.33)
    const stats = monitor.getStats()
    expect(stats.avg).toBeCloseTo(30, -1)
    monitor.stop()
  })

  it('tracks min and max across varying frame rates', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    // Simulate 10 fast frames, 10 slow frames
    mock.advanceFrames(10, 10) // ~100 FPS
    mock.advanceFrames(10, 50) // ~20 FPS
    const stats = monitor.getStats()
    expect(stats.min).toBeLessThanOrEqual(25)
    expect(stats.max).toBeGreaterThanOrEqual(80)
    monitor.stop()
  })

  it('stops tracking after stop()', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.advanceFrames(5, 16.67)
    monitor.stop()
    const countBeforeStop = monitor.getStats().frameCount
    mock.advanceFrames(10, 16.67)
    expect(monitor.getStats().frameCount).toBe(countBeforeStop)
  })

  it('reports isRunning correctly', () => {
    const monitor = new FpsMonitor()
    expect(monitor.isRunning).toBe(false)
    monitor.start()
    expect(monitor.isRunning).toBe(true)
    monitor.stop()
    expect(monitor.isRunning).toBe(false)
  })

  it('resets stats to zero', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.advanceFrames(10, 16.67)
    monitor.stop()
    expect(monitor.getStats().frameCount).toBeGreaterThan(0)
    monitor.reset()
    expect(monitor.getStats().current).toBe(0)
    expect(monitor.getStats().frameCount).toBe(0)
  })

  it('does nothing when start called while already running', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.advanceFrames(5, 16.67)
    monitor.start() // Should be a no-op
    mock.advanceFrames(5, 16.67)
    expect(monitor.getStats().frameCount).toBe(10)
    monitor.stop()
  })

  it('respects custom window size', () => {
    const monitor = new FpsMonitor(3)
    monitor.start()
    mock.advanceFrames(5, 16.67)
    const stats = monitor.getStats()
    // Window size is 3, so only last 3 frames are kept
    expect(stats.frameCount).toBeLessThanOrEqual(3)
    monitor.stop()
  })

  it('handles single frame correctly', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    mock.stepOneFrame(16.67)
    const stats = monitor.getStats()
    expect(stats.current).toBeCloseTo(60, -1)
    expect(stats.avg).toBeCloseTo(60, -1)
    monitor.stop()
  })

  it('handles zero delta gracefully', () => {
    const monitor = new FpsMonitor()
    monitor.start()
    // Zero delta produces NaN fps, should be skipped
    mock.stepOneFrame(0)
    const stats = monitor.getStats()
    expect(stats.frameCount).toBe(0)
    monitor.stop()
  })
})
