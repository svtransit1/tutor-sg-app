import { openDatabaseAsync, mockDb } from '../../__mocks__/expo-sqlite'
import { ParentSessionRepository, __resetDb } from '../../storage/parentSessions'

beforeEach(() => {
  __resetDb()
  ;(openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb)
  mockDb.execAsync.mockResolvedValue(undefined)
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  mockDb.getAllAsync.mockResolvedValue([])
  mockDb.getFirstAsync.mockResolvedValue(null)
})

test('startSession creates a UUID session row', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  const id = await ParentSessionRepository.startSession('kid-1', 'math', 'algebra')
  expect(typeof id).toBe('string')
  expect(id.length).toBe(36)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO parent_sessions'), id, 'kid-1', 'math', 'algebra')
})

test('startSession uses default topic when omitted', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.startSession('kid-1', 'english')
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO parent_sessions'), expect.any(String), 'kid-1', 'english', '')
})

test('logQuestionAttempt inserts question row', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.logQuestionAttempt('session-uuid', 'q-1', true, 0, 45, false)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO question_attempts'), 'session-uuid', 'q-1', 1, 0, 45, 0)
})

test('logQuestionAttempt increments correct count when correct=true', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.logQuestionAttempt('session-uuid', 'q-1', true, 0, 30, false)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE parent_sessions'), 1, '0', 'session-uuid')
})

test('logQuestionAttempt appends struggle indicator when struggleDetected=true', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.logQuestionAttempt('session-uuid', 'q-1', false, 2, 90, true)
  expect(mockDb.runAsync).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE parent_sessions'), 0, '1', 'session-uuid')
})

test('endSession sets ended_at, ai_summary and parent_flagged', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.endSession('session-uuid', 'struggled with fractions', true)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE parent_sessions'), 'struggled with fractions', 1, 'session-uuid')
})

test('endSession sets parent_flagged=0 when flagged=false', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  await ParentSessionRepository.endSession('session-uuid', 'easy', false)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE parent_sessions'), 'easy', 0, 'session-uuid')
})

test('getSession returns null when no session found', async () => {
  mockDb.getFirstAsync.mockResolvedValue(null)
  const result = await ParentSessionRepository.getSession('not-found')
  expect(result).toBeNull()
})

test('getSession returns mapped session row', async () => {
  mockDb.getFirstAsync.mockResolvedValue({ id: 'sess-1', kid_profile_id: 'kid-1', subject: 'math', topic: 'algebra', started_at: '2026-01-01T00:00:00.000Z', ended_at: null, questions_attempted: 3, questions_correct: 2, struggle_indicators: '[false, false, true]', ai_summary: null, parent_flagged: 0, flag_reason: null, flag_timestamp: null })
  const result = await ParentSessionRepository.getSession('sess-1')
  expect(result).toEqual({ id: 'sess-1', kidProfileId: 'kid-1', subject: 'math', topic: 'algebra', startedAt: '2026-01-01T00:00:00.000Z', endedAt: null, questionsAttempted: 3, questionsCorrect: 2, struggleIndicators: [false, false, true], aiSummary: null, parentFlagged: false, flagReason: null, flagTimestamp: null })
})

test('getSessionsForKid returns empty array when no sessions', async () => {
  mockDb.getAllAsync.mockResolvedValue([])
  const result = await ParentSessionRepository.getSessionsForKid('kid-1')
  expect(result).toEqual([])
})

test('getSessionsForKid returns mapped sessions ordered by started_at', async () => {
  mockDb.getAllAsync.mockResolvedValue([{ id: 'sess-1', kid_profile_id: 'kid-1', subject: 'math', topic: 'algebra', started_at: '2026-01-01T00:00:00.000Z', ended_at: null, questions_attempted: 1, questions_correct: 1, struggle_indicators: '[]', ai_summary: null, parent_flagged: 0 }, { id: 'sess-2', kid_profile_id: 'kid-1', subject: 'english', topic: 'comprehension', started_at: '2026-01-02T00:00:00.000Z', ended_at: '2026-01-02T01:00:00.000Z', questions_attempted: 5, questions_correct: 3, struggle_indicators: '[false, true]', ai_summary: 'needs help with inference', parent_flagged: 1 }])
  const result = await ParentSessionRepository.getSessionsForKid('kid-1')
  expect(result).toHaveLength(2)
  expect(result[0].subject).toBe('math')
  expect(result[1].subject).toBe('english')
  expect(result[1].parentFlagged).toBe(true)
})

test('setParentFlagged updates parent_flagged to 1', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  mockDb.runAsync.mockClear()
  await ParentSessionRepository.setParentFlagged('sess-1', true)
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('SET parent_flagged = 1'), null, expect.any(String), 'sess-1')
})

test('setParentFlagged updates parent_flagged to 0', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  await ParentSessionRepository.setParentFlagged('sess-1', false)
  expect(mockDb.runAsync).toHaveBeenCalledWith('UPDATE parent_sessions SET parent_flagged = 0, flag_reason = NULL, flag_timestamp = NULL WHERE id = ?', 'sess-1')
})

test('setParentFlagged with reason', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  mockDb.runAsync.mockClear()
  await ParentSessionRepository.setParentFlagged('sess-1', true, 'too confusing')
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('SET parent_flagged = 1'), 'too confusing', expect.any(String), 'sess-1')
})

test('getFlaggedSessions returns flagged sessions', async () => {
  mockDb.getAllAsync.mockResolvedValue([{ id: 's2', kid_profile_id: 'kid-1', subject: 'english', topic: 'comprehension', started_at: '2026-01-02T00:00:00.000Z', ended_at: null, questions_attempted: 5, questions_correct: 3, struggle_indicators: '[]', ai_summary: null, parent_flagged: 1, flag_reason: 'unclear', flag_timestamp: '2026-01-03T00:00:00.000Z' }])
  const r = await ParentSessionRepository.getFlaggedSessions('kid-1')
  expect(r).toHaveLength(1)
  expect(r[0].flagReason).toBe('unclear')
  expect(r[0].parentFlagged).toBe(true)
})

test('getFlaggedSessions returns empty when none flagged', async () => {
  mockDb.getAllAsync.mockResolvedValue([])
  const r = await ParentSessionRepository.getFlaggedSessions('kid-1')
  expect(r).toEqual([])
})

test('getQuestionAttemptsForSession works', async () => {
  mockDb.getAllAsync.mockResolvedValue([{ id: 1, session_id: 's1', question_id: 'q1', correct: 1, hints_used: 0, time_seconds: 30, struggle_detected: 0, logged_at: '2026-01-01T00:00:00.000Z' }])
  const r = await ParentSessionRepository.getQuestionAttemptsForSession('s1')
  expect(r[0].correct).toBe(true)
  expect(r[0].hintsUsed).toBe(0)
})

test('upsertFlagImprovement works', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  await ParentSessionRepository.upsertFlagImprovement({ topic_id: 'T1', subject: 'math', level: 3, flag_count: 2, avg_difficulty: 'hard', common_reasons: '["hard"]', suggestions: '["adjust"]', last_analyzed: '2026-01-01T00:00:00.000Z' })
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT OR REPLACE INTO flag_improvement_analysis'), 'T1', 'math', 3, 2, 'hard', '["hard"]', '["adjust"]', '2026-01-01T00:00:00.000Z')
})

test('getFlagImprovementForTopic returns row', async () => {
  mockDb.getFirstAsync.mockResolvedValue({ topic_id: 'T1', subject: 'math', level: 3, flag_count: 2, avg_difficulty: 'hard', common_reasons: '[]', suggestions: '[]', last_analyzed: null })
  const r = await ParentSessionRepository.getFlagImprovementForTopic('T1')
  expect(r!.flag_count).toBe(2)
})

test('getFlagImprovementForTopic returns null when not found', async () => {
  mockDb.getFirstAsync.mockResolvedValue(null)
  expect(await ParentSessionRepository.getFlagImprovementForTopic('nonexistent')).toBeNull()
})

test('getAllFlagImprovements returns all rows', async () => {
  mockDb.getAllAsync.mockResolvedValue([{ topic_id: 'T1', subject: 'math', level: 3, flag_count: 3, avg_difficulty: null, common_reasons: '[]', suggestions: '[]', last_analyzed: null }])
  expect((await ParentSessionRepository.getAllFlagImprovements())).toHaveLength(1)
})

test('getSession includes flag fields when present', async () => {
  mockDb.getFirstAsync.mockResolvedValue({ id: 'sess-1', kid_profile_id: 'kid-1', subject: 'math', topic: 'algebra', started_at: '2026-01-01T00:00:00.000Z', ended_at: null, questions_attempted: 3, questions_correct: 2, struggle_indicators: '[false, false, true]', ai_summary: null, parent_flagged: 1, flag_reason: 'too hard', flag_timestamp: '2026-01-02T00:00:00.000Z' })
  const r = await ParentSessionRepository.getSession('sess-1')
  expect(r!.parentFlagged).toBe(true)
  expect(r!.flagReason).toBe('too hard')
  expect(r!.flagTimestamp).toBe('2026-01-02T00:00:00.000Z')
})
