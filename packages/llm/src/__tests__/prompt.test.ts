import { buildHomeworkPrompt, buildPrompt, estimatePromptTokens } from '../prompt/constructor'
import { scrubPii } from '../prompt/scrub'
import type { OcrResult } from '@tutor-sg/shared'

const mockOcrResult: OcrResult = {
  pages: [
    {
      blocks: [
        { text: '1. 3 + 5 = ?', confidence: 0.95, boundingBox: { x: 10, y: 10, width: 100, height: 20 } },
        { text: '2. 12 - 7 = ?', confidence: 0.92, boundingBox: { x: 10, y: 40, width: 100, height: 20 } },
      ],
      dimensions: { width: 600, height: 800 },
    },
  ],
  language: 'en',
  fullText: '1. 3 + 5 = ?\n2. 12 - 7 = ?',
  processingTimeMs: 1200,
}

describe('buildHomeworkPrompt', () => {
  it('builds a math prompt with OCR text', () => {
    const prompt = buildHomeworkPrompt({ ocrResult: mockOcrResult, subject: 'math', level: 2 })

    expect(prompt).toContain('Primary 2')
    expect(prompt).toContain('Maths tutor')
    expect(prompt).toContain('3 + 5 = ?')
    expect(prompt).toContain('12 - 7 = ?')
    expect(prompt).toContain('"questionNumber"')
    expect(prompt).toContain('"plan"')
    expect(prompt).toContain('"steps"')
    expect(prompt).toContain('"final"')
    expect(prompt).toContain('--- OCR text from homework photo ---')
    expect(prompt).not.toContain('{level}')
  })

  it('builds a Chinese prompt in Simplified Chinese', () => {
    const chineseOcr: OcrResult = {
      ...mockOcrResult,
      language: 'zh',
      fullText: '1. 阅读下面的短文，回答问题。',
    }
    const prompt = buildHomeworkPrompt({ ocrResult: chineseOcr, subject: 'chinese', level: 3 })

    expect(prompt).toContain('小学3年级')
    expect(prompt).toContain('中文老师')
    expect(prompt).toContain('阅读下面的短文')
    expect(prompt).not.toContain('{level}')
  })

  it('handles empty OCR text gracefully', () => {
    const emptyOcr: OcrResult = {
      pages: [{ blocks: [], dimensions: { width: 0, height: 0 } }],
      language: 'en',
      fullText: '',
      processingTimeMs: 0,
    }
    const prompt = buildHomeworkPrompt({ ocrResult: emptyOcr, subject: 'math', level: 5 })
    expect(prompt).toContain('Primary 5')
  })

  it('uses fallback text when fullText is empty', () => {
    const noFullTextOcr: OcrResult = {
      pages: [
        {
          blocks: [
            { text: 'Fallback line', confidence: 0.8, boundingBox: { x: 0, y: 0, width: 50, height: 10 } },
          ],
          dimensions: { width: 100, height: 100 },
        },
      ],
      language: 'en',
      fullText: '',
      processingTimeMs: 100,
    }
    const prompt = buildHomeworkPrompt({ ocrResult: noFullTextOcr, subject: 'english', level: 4 })
    expect(prompt).toContain('Fallback line')
  })

  it('scrubs PII from OCR text', () => {
    const piiOcr: OcrResult = {
      ...mockOcrResult,
      fullText: 'My name is John Tan. Blk 123, Singapore 456789. Call 91234567.',
    }
    const prompt = buildHomeworkPrompt({ ocrResult: piiOcr, subject: 'math', level: 3 })
    expect(prompt).toContain('[name removed]')
    expect(prompt).toContain('[address removed]')
    expect(prompt).toContain('[phone removed]')
    expect(prompt).toContain('[postal removed]')
    expect(prompt).not.toContain('John Tan')
    expect(prompt).not.toContain('91234567')
  })
})

describe('buildPrompt (simpler signature)', () => {
  it('builds prompt from text input', () => {
    const prompt = buildPrompt({
      fullText: 'What is the capital of France?',
      subject: 'english',
      level: 5,
      detectedLanguage: 'en',
    })
    expect(prompt).toContain('Primary 5')
    expect(prompt).toContain('capital of France')
  })

  it('scrubs PII from text input', () => {
    const prompt = buildPrompt({
      fullText: 'My name is Sarah. Email sarah@test.com.',
      subject: 'science',
      level: 4,
      detectedLanguage: 'en',
    })
    expect(prompt).toContain('[name removed]')
    expect(prompt).toContain('[email removed]')
    expect(prompt).not.toContain('Sarah')
    expect(prompt).not.toContain('sarah@test.com')
  })
})

describe('estimatePromptTokens', () => {
  it('estimates tokens from character count', () => {
    const prompt = buildHomeworkPrompt({ ocrResult: mockOcrResult, subject: 'math', level: 3 })
    const tokens = estimatePromptTokens(prompt)
    expect(tokens).toBeGreaterThan(0)
    expect(typeof tokens).toBe('number')
  })
})

describe('scrubPii', () => {
  it('removes student name declarations', () => {
    expect(scrubPii('My name is John Tan')).toContain('[name removed]')
    expect(scrubPii('I am Mary')).toContain('[name removed]')
    expect(scrubPii("I'm Alex")).toContain('[name removed]')
    expect(scrubPii('Name: Peter')).toContain('[name removed]')
  })

  it('removes NRIC numbers', () => {
    expect(scrubPii('My NRIC is S1234567A')).toContain('[NRIC removed]')
    expect(scrubPii('T1234567Z')).toContain('[NRIC removed]')
  })

  it('removes phone numbers', () => {
    expect(scrubPii('Call 91234567')).toContain('[phone removed]')
    expect(scrubPii('+65 9123 4567')).toContain('[phone removed]')
  })

  it('removes email addresses', () => {
    expect(scrubPii('Email me@test.com')).toContain('[email removed]')
  })

  it('removes addresses', () => {
    expect(scrubPii('Blk 123 Ang Mo Kio Ave 4')).toContain('[address removed]')
    expect(scrubPii('Block 456')).toContain('[address removed]')
  })

  it('removes postal codes', () => {
    expect(scrubPii('Singapore 560123')).toContain('[postal removed]')
  })

  it('preserves math content', () => {
    expect(scrubPii('3 + 5 = 8')).toBe('3 + 5 = 8')
    expect(scrubPii('What is 12 divided by 4?')).toBe('What is 12 divided by 4?')
  })
})
