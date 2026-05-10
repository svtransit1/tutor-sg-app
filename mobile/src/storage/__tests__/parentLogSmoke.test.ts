import { openDatabaseAsync, mockDb } from '../../__mocks__/expo-sqlite'
import { ParentSessionRepository, __resetDb } from '../../storage/parentSessions'

beforeEach(() => {
  jest.clearAllMocks()
  __resetDb()
  ;(openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb)
  mockDb.execAsync.mockResolvedValue(undefined)
  mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })
  mockDb.getAllAsync.mockResolvedValue([])
  mockDb.getFirstAsync.mockResolvedValue(null)
})

describe('SMOKE-01: Write session → parent view → flag (full pipeline)', () => {
  test('writes a complete session with question attempts and AI summary', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })

    const sessionId = await ParentSessionRepository.startSession('kid-1', 'math', 'fractions')
    expect(typeof sessionId).toBe('string')
    expect(sessionId.length).toBe(36)
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO parent_sessions'),
      sessionId, 'kid-1', 'math', 'fractions',
    )

    await ParentSessionRepository.logQuestionAttempt(sessionId, 'q-1', true, 0, 45, false)
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO question_attempts'),
      sessionId, 'q-1', 1, 0, 45, 0,
    )
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE parent_sessions SET questions_attempted'),
      1, '0', sessionId,
    )

    await ParentSessionRepository.logQuestionAttempt(sessionId, 'q-2', false, 2, 90, true)
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO question_attempts'),
      sessionId, 'q-2', 0, 2, 90, 1,
    )

    await ParentSessionRepository.endSession(sessionId, 'Struggled with fraction addition. Good with equivalence.', false)
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE parent_sessions SET ended_at'),
      'Struggled with fraction addition. Good with equivalence.',
      0,
      sessionId,
    )
  })

  test('retrieves the session with correct data for parent view', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 'sess-abc', kid_profile_id: 'kid-1', subject: 'math', topic: 'fractions',
      started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
      questions_attempted: 5, questions_correct: 3,
      struggle_indicators: '[false,false,true,false,true]',
      ai_summary: 'Needs work on fraction addition', parent_flagged: 0,
      flag_reason: null, flag_timestamp: null,
    })

    const session = await ParentSessionRepository.getSession('sess-abc')
    expect(session).not.toBeNull()
    expect(session!.subject).toBe('math')
    expect(session!.topic).toBe('fractions')
    expect(session!.questionsAttempted).toBe(5)
    expect(session!.questionsCorrect).toBe(3)
    expect(session!.struggleIndicators).toEqual([false, false, true, false, true])
    expect(session!.aiSummary).toBe('Needs work on fraction addition')
    expect(session!.parentFlagged).toBe(false)
    expect(session!.flagReason).toBeNull()
  })

  test('lists all sessions for a kid (sorted by start time)', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 'sess-1', kid_profile_id: 'kid-1', subject: 'math', topic: 'fractions',
        started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
        questions_attempted: 5, questions_correct: 3, struggle_indicators: '[false,true]',
        ai_summary: 'Needs work on addition', parent_flagged: 0,
        flag_reason: null, flag_timestamp: null },
      { id: 'sess-2', kid_profile_id: 'kid-1', subject: 'english', topic: 'comprehension',
        started_at: '2026-05-10T09:00:00.000Z', ended_at: '2026-05-10T09:20:00.000Z',
        questions_attempted: 3, questions_correct: 2, struggle_indicators: '[false]',
        ai_summary: 'Inference still developing', parent_flagged: 0,
        flag_reason: null, flag_timestamp: null },
    ])

    const sessions = await ParentSessionRepository.getSessionsForKid('kid-1')
    expect(sessions).toHaveLength(2)
    expect(sessions[0].subject).toBe('math')
    expect(sessions[1].subject).toBe('english')
  })

  test('flags a session and persists the flag', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })

    await ParentSessionRepository.setParentFlagged('sess-abc', true, 'Kid seemed confused on Q3')

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'UPDATE parent_sessions SET parent_flagged = 1, flag_reason = ?, flag_timestamp = ? WHERE id = ?',
      'Kid seemed confused on Q3',
      expect.any(String),
      'sess-abc',
    )
  })

  test('toggles flag off and confirms', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })

    await ParentSessionRepository.setParentFlagged('sess-abc', false)

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'UPDATE parent_sessions SET parent_flagged = 0, flag_reason = NULL, flag_timestamp = NULL WHERE id = ?',
      'sess-abc',
    )
  })
})

describe('SMOKE-02: Struggle detection flows through to parent view', () => {
  test('captures struggle indicators across multiple questions', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })

    const sessionId = 'sess-struggle'

    await ParentSessionRepository.startSession('kid-1', 'science', 'water-cycle')
    await ParentSessionRepository.logQuestionAttempt(sessionId, 'q-1', true, 0, 30, false)
    await ParentSessionRepository.logQuestionAttempt(sessionId, 'q-2', false, 1, 60, false)
    await ParentSessionRepository.logQuestionAttempt(sessionId, 'q-3', false, 3, 120, true)

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE parent_sessions'),
      0,
      '1',
      sessionId,
    )
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE parent_sessions'),
      1,
      '0',
      sessionId,
    )
  })
})

describe('SMOKE-03: Multi-subject sessions are isolated per kid', () => {
  test('returns only sessions for the queried kid', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 })

    await ParentSessionRepository.startSession('kid-1', 'math', 'fractions')
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO parent_sessions'),
      expect.any(String), 'kid-1', 'math', 'fractions',
    )

    await ParentSessionRepository.startSession('kid-1', 'english', 'comprehension')
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO parent_sessions'),
      expect.any(String), 'kid-1', 'english', 'comprehension',
    )

    await ParentSessionRepository.startSession('kid-2', 'science', 'water-cycle')
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO parent_sessions'),
      expect.any(String), 'kid-2', 'science', 'water-cycle',
    )
  })

  test('returns only flagged sessions for the given kid', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 'sess-1', kid_profile_id: 'kid-1', subject: 'math', topic: 'fractions',
        started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
        questions_attempted: 5, questions_correct: 2, struggle_indicators: '[true,true]',
        ai_summary: 'Trouble with fractions', parent_flagged: 1,
        flag_reason: 'Kid confused', flag_timestamp: '2026-05-10T08:30:00.000Z' },
    ])

    const flaggedSessions = await ParentSessionRepository.getFlaggedSessions('kid-1')
    expect(flaggedSessions).toHaveLength(1)
    expect(flaggedSessions[0].parentFlagged).toBe(true)
    expect(flaggedSessions[0].flagReason).toBe('Kid confused')

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE kid_profile_id = ? AND parent_flagged = 1'),
      'kid-1',
    )
  })
})
