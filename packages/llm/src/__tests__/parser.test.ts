import { parseHomeworkResponse, extractJson, trimToTokenBudget } from '../parse/parser'

const context = { subject: 'math' as const, level: 3, prompt: 'test prompt' }

const validResponse = JSON.stringify({
  questions: [
    {
      questionNumber: 1,
      topic: 'Addition',
      plan: 'Add the two numbers together',
      steps: ['Start with 3', 'Add 5', 'The result is 8'],
      final: '8',
    },
    {
      questionNumber: 2,
      topic: 'Subtraction',
      plan: 'Subtract the smaller number from the larger',
      steps: ['Start with 12', 'Subtract 7', 'The result is 5'],
      final: '5',
    },
  ],
})

describe('parseHomeworkResponse', () => {
  it('parses a valid JSON response successfully', () => {
    const result = parseHomeworkResponse(validResponse, context)
    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.questions).toHaveLength(2)
    expect(result.data!.questions[0].topic).toBe('Addition')
    expect(result.data!.questions[0].steps).toHaveLength(3)
    expect(result.data!.questions[0].final).toBe('8')
    expect(result.data!.subject).toBe('math')
    expect(result.data!.level).toBe(3)
  })

  it('handles JSON inside markdown code fences', () => {
    const withFences = '```json\n' + validResponse + '\n```'
    const result = parseHomeworkResponse(withFences, context)
    expect(result.success).toBe(true)
    expect(result.data!.questions).toHaveLength(2)
  })

  it('handles JSON inside plain code fences', () => {
    const withPlainFences = '```\n' + validResponse + '\n```'
    const result = parseHomeworkResponse(withPlainFences, context)
    expect(result.success).toBe(true)
    expect(result.data!.questions).toHaveLength(2)
  })

  it('handles preamble text before JSON', () => {
    const withPreamble = 'Here is the analysis:\n\n' + validResponse
    const result = parseHomeworkResponse(withPreamble, context)
    expect(result.success).toBe(true)
  })

  it('handles trailing text after JSON', () => {
    const withTrailing = validResponse + '\n\nI hope this helps!'
    const result = parseHomeworkResponse(withTrailing, context)
    expect(result.success).toBe(true)
  })

  it('returns error for empty response', () => {
    const result = parseHomeworkResponse('', context)
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).toContain('No JSON')
  })

  it('returns error for non-JSON response', () => {
    const result = parseHomeworkResponse('The answer is 8.', context)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid JSON', () => {
    const result = parseHomeworkResponse('{invalid}', context)
    expect(result.success).toBe(false)
  })

  it('returns error for valid JSON with wrong structure', () => {
    const wrongStructure = JSON.stringify({ answer: 42 })
    const result = parseHomeworkResponse(wrongStructure, context)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/missing/i)
  })

  it('handles empty questions array', () => {
    const empty = JSON.stringify({ questions: [] })
    const result = parseHomeworkResponse(empty, context)
    expect(result.success).toBe(true)
    expect(result.data!.questions).toHaveLength(0)
  })

  it('fills in missing questionNumber', () => {
    const missingNum = JSON.stringify({
      questions: [{ topic: 'Test', plan: 'Plan', steps: ['Step 1'], final: 'Ans' }],
    })
    const result = parseHomeworkResponse(missingNum, context)
    expect(result.success).toBe(true)
    expect(result.data!.questions[0].questionNumber).toBe(1)
  })
})

describe('extractJson', () => {
  it('extracts plain JSON object', () => {
    const result = extractJson(validResponse)
    expect(result).not.toBeNull()
    expect(JSON.parse(result!)).toHaveProperty('questions')
  })

  it('extracts JSON from code fences', () => {
    const fenced = 'Some text\n```json\n' + validResponse + '\n```\nMore text'
    const result = extractJson(fenced)
    expect(result).not.toBeNull()
  })

  it('returns null for text without JSON', () => {
    expect(extractJson('Just plain text')).toBeNull()
  })
})

describe('trimToTokenBudget', () => {
  const longPrompt = '--- OCR text from homework photo ---\n' + 'A'.repeat(2000) + '\n--- end of OCR text ---'

  it('returns prompt unchanged when under budget', () => {
    const result = trimToTokenBudget(longPrompt, 10000)
    expect(result).toBe(longPrompt)
  })

  it('truncates OCR section when over budget', () => {
    const result = trimToTokenBudget(longPrompt, 10)
    expect(result.length).toBeLessThan(longPrompt.length)
    expect(result).toContain('[OCR text truncated')
    expect(result).toContain('--- OCR text from homework photo ---')
    expect(result).toContain('--- end of OCR text ---')
  })

  it('handles prompt without OCR markers', () => {
    const simple = 'Just a simple prompt without OCR sections'
    const result = trimToTokenBudget(simple, 1)
    expect(result.length).toBeLessThanOrEqual(simple.length)
  })
})
