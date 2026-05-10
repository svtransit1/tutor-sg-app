import { FlagImprovementService } from '../flagImprovementService'
import { ParentSessionRepository } from '../../storage/parentSessions'

jest.mock('../../storage/parentSessions', () => ({
  ParentSessionRepository: {
    getFlaggedSessions: jest.fn(),
    upsertFlagImprovement: jest.fn(),
    getAllFlagImprovements: jest.fn(),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('analyzeFlaggedSessions', () => {
  it('returns empty array when no flagged sessions', async () => {
    (ParentSessionRepository.getFlaggedSessions as jest.Mock).mockResolvedValue([])
    const result = await FlagImprovementService.analyzeFlaggedSessions('k1')
    expect(result).toEqual([])
  })

  it('groups flagged sessions by topic and returns sorted improvements', async () => {
    (ParentSessionRepository.getFlaggedSessions as jest.Mock).mockResolvedValue([
      { id: 's1', kidProfileId: 'k1', subject: 'math', topic: 'algebra', flagReason: 'too hard', parentFlagged: true, questionsAttempted: 3, questionsCorrect: 1, struggleIndicators: [true], aiSummary: null },
      { id: 's2', kidProfileId: 'k1', subject: 'math', topic: 'algebra', flagReason: 'confusing', parentFlagged: true, questionsAttempted: 5, questionsCorrect: 2, struggleIndicators: [true], aiSummary: null },
    ])
    const result = await FlagImprovementService.analyzeFlaggedSessions('k1')
    expect(result).toHaveLength(1)
    expect(result[0].topicId).toBe('algebra')
    expect(result[0].flagCount).toBe(2)
    expect(result[0].suggestions).toContain('adjust_difficulty_down')
    expect(result[0].suggestions).toContain('clarify_question_wording')
  })

  it('uses fallback topic key when topic is empty', async () => {
    (ParentSessionRepository.getFlaggedSessions as jest.Mock).mockResolvedValue([
      { id: 's1', kidProfileId: 'k1', subject: 'science', topic: '', flagReason: 'unclear', parentFlagged: true, questionsAttempted: 2, questionsCorrect: 1, struggleIndicators: [], aiSummary: null },
    ])
    const result = await FlagImprovementService.analyzeFlaggedSessions('k1')
    expect(result[0].topicId).toBe('science_general')
  })
})

describe('getImprovementsBySubject', () => {
  it('filters improvements by subject', async () => {
    (ParentSessionRepository.getAllFlagImprovements as jest.Mock).mockResolvedValue([
      { topic_id: 'M1', subject: 'math', level: 3, flag_count: 2, avg_difficulty: null, common_reasons: '[]', suggestions: '[]', last_analyzed: null },
      { topic_id: 'E1', subject: 'english', level: 4, flag_count: 1, avg_difficulty: null, common_reasons: '[]', suggestions: '[]', last_analyzed: null },
    ])
    const result = await FlagImprovementService.getImprovementsBySubject('math')
    expect(result).toHaveLength(1)
    expect(result[0].topicId).toBe('M1')
  })
})

describe('getDashboardSummary', () => {
  it('returns summary with total flag count', async () => {
    (ParentSessionRepository.getAllFlagImprovements as jest.Mock).mockResolvedValue([
      { topic_id: 'M1', subject: 'math', level: 3, flag_count: 3, avg_difficulty: null, common_reasons: '[]', suggestions: '[]', last_analyzed: '2026-01-01T00:00:00.000Z' },
      { topic_id: 'M2', subject: 'math', level: 5, flag_count: 1, avg_difficulty: null, common_reasons: '[]', suggestions: '[]', last_analyzed: '2026-01-02T00:00:00.000Z' },
    ])
    const summary = await FlagImprovementService.getDashboardSummary('k1')
    expect(summary.totalFlagged).toBe(4)
    expect(summary.flaggedSubjects).toHaveLength(1)
    expect(summary.flaggedSubjects[0].count).toBe(4)
    expect(summary.topFlaggedTopics).toHaveLength(2)
    expect(summary.lastAnalysisDate).toBe('2026-01-02T00:00:00.000Z')
  })

  it('returns zero summary when no improvements exist', async () => {
    (ParentSessionRepository.getAllFlagImprovements as jest.Mock).mockResolvedValue([])
    const summary = await FlagImprovementService.getDashboardSummary('k1')
    expect(summary.totalFlagged).toBe(0)
    expect(summary.flaggedSubjects).toEqual([])
    expect(summary.topFlaggedTopics).toEqual([])
    expect(summary.lastAnalysisDate).toBeNull()
  })
})
