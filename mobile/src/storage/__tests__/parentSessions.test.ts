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
  expect(mockDb.runAsync).toHaveBeenCalledWith(expect.stringContaining('SET parent_flagged = 1'), expect.any(String), expect.any(String), 'sess-1')
})

test('setParentFlagged updates parent_flagged to 0', async () => {
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  await ParentSessionRepository.setParentFlagged('sess-1', false)
  expect(mockDb.runAsync).toHaveBeenCalledWith('UPDATE parent_sessions SET parent_flagged = ? WHERE id = ?', 0, 'sess-1')
})
