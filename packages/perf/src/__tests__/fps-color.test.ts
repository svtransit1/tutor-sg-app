import { describe, it, expect } from '@jest/globals'
import { fpsColor, FPS_GREEN_THRESHOLD, FPS_YELLOW_THRESHOLD } from '../fps-monitor'

describe('fpsColor', () => {
  it('returns green when fps is at or above green threshold', () => {
    expect(fpsColor(FPS_GREEN_THRESHOLD)).toBe('#4CAF50')
    expect(fpsColor(60)).toBe('#4CAF50')
    expect(fpsColor(120)).toBe('#4CAF50')
  })

  it('returns yellow when fps is between yellow and green thresholds', () => {
    expect(fpsColor(FPS_YELLOW_THRESHOLD)).toBe('#FF9800')
    expect(fpsColor(40)).toBe('#FF9800')
  })

  it('returns red when fps is below yellow threshold', () => {
    expect(fpsColor(0)).toBe('#F44336')
    expect(fpsColor(15)).toBe('#F44336')
    expect(fpsColor(29)).toBe('#F44336')
  })
})
