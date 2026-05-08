import { describe, it, expect } from '@jest/globals'
import {
  getPerfMetrics,
  FpsMonitor,
  fpsColor,
  useFpsMonitor,
  CameraFpsOverlay,
} from '../index'

describe('@tutor-sg/perf smoke', () => {
  it('adds numbers correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('exports getPerfMetrics', () => {
    expect(typeof getPerfMetrics).toBe('function')
  })

  it('exports FpsMonitor class', () => {
    expect(typeof FpsMonitor).toBe('function')
    const instance = new FpsMonitor()
    expect(typeof instance.start).toBe('function')
    expect(typeof instance.stop).toBe('function')
    expect(typeof instance.getStats).toBe('function')
  })

  it('exports fpsColor', () => {
    expect(typeof fpsColor).toBe('function')
    expect(fpsColor(60)).toBe('#4CAF50')
  })

  it('exports useFpsMonitor hook', () => {
    expect(typeof useFpsMonitor).toBe('function')
  })

  it('exports CameraFpsOverlay component', () => {
    expect(typeof CameraFpsOverlay).toBe('function')
  })
})
