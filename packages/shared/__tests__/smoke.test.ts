import { describe, it, expect } from '@jest/globals'

// M2 integration import (AAAS-583) — verify pipeline types compile & export
import { OCR_THRESHOLDS, MODEL_ROUTING, DEFAULT_PIPELINE_CONFIG, FEATURE_GATES, assessOcrQuality, selectModel } from '../src/pipeline'

describe('shared smoke', () => {
  it('adds numbers correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('pipeline types export for M2 integration (AAAS-583)', () => {
    expect(OCR_THRESHOLDS.KEEP).toBe(0.6)
    expect(OCR_THRESHOLDS.RETAKE).toBe(0.3)
    expect(MODEL_ROUTING.math.mid).toBe('gemma-e2b')
    expect(MODEL_ROUTING.chinese_mt.high).toBe('qwen-4b')
    expect(DEFAULT_PIPELINE_CONFIG.maxImagesPerCapture).toBe(3)
    expect(FEATURE_GATES.length).toBe(5)

    const assessment = assessOcrQuality({
      blocks: [
        { id: '1', text: 'hello', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 10, height: 10 }, language: 'en', confidenceLevel: 'high' },
      ],
      rawText: 'hello',
      language: 'en',
      processingTimeMs: 100,
      platform: 'apple-vision',
      timestamp: new Date().toISOString(),
    })
    expect(assessment.needsRetake).toBe(false)

    expect(selectModel('math', 'high')).toBe('gemma-e4b')
    expect(selectModel('chinese_mt', 'high')).toBe('qwen-4b')
  })
})
