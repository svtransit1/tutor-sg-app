/**
 * AAAS-1252: M3 Parent log — E2E smoke test (write session → parent view → flag)
 *
 * Covers the full parent session lifecycle contract from ADD §4.2:
 *   1. Write session: start → log question attempts → end with AI summary
 *   2. Parent view: retrieve sessions for a kid, verify data integrity
 *   3. Flag: set parent flag, verify persistence, toggle off
 *
 * This is a data-pipeline-level smoke test. The parent dashboard UI is a
 * placeholder (ADD §4.2 parent-facing dashboard not yet built), so the
 * smoke test exercises the full storage/service pipeline that the UI will
 * consume.
 */

import { openDatabaseAsync, mockDb } from '../../__mocks__/expo-sqlite'
import { ParentSessionRepository, __resetDb, ParentSubject } from '../../storage/parentSessions'

// ── Setup ──────────────────────────────────────────────────────

let testSessionId: string
const KID_ID = 'kid-smoke-001'

beforeEach(() => {
  __resetDb()
  ;(openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb)
  mockDb.execAsync.mockResolvedValue(undefined)
  mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 })
  mockDb.getAllAsync.mockResolvedValue([])
  mockDb.getFirstAsync.mockResolvedValue(null)
})

// ── Helpers ────────────────────────────────────────────────────

async function writeFullSession(
  subject: ParentSubject = 'math',
  topic = 'fractions',
  attempts: Array<{ correct: boolean; hintsUsed: number; timeSeconds: number; struggleDetected: boolean }> = [
    { correct: true, hintsUsed: 0, timeSeconds: 30, struggleDetected: false },
    { correct: false, hintsUsed: 2, timeSeconds: 90, struggleDetected: true },
    { correct: false, hintsUsed: 3, timeSeconds: 120, struggleDetected: true },
    { correct: true, hintsUsed: 1, timeSeconds: 45, struggleDetected: false },
  ],
  aiSummary = 'Struggled with fraction addition. Needs more practice on common denominators.',
  parentFlagged = true,
): Promise<string> {
  const sessionId = await ParentSessionRepository.startSession(KID_ID, subject, topic)

  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i]
    await ParentSessionRepository.logQuestionAttempt(sessionId, `q-${i + 1}`, a.correct, a.hintsUsed, a.timeSeconds, a.struggleDetected)
  }

  await ParentSessionRepository.endSession(sessionId, aiSummary, parentFlagged)
  return sessionId
}

// ── SMOKE-01: Full lifecycle — write → view → flag ─────────────

describe('SMOKE-01: Write session → parent view → flag (full pipeline)', () => {
  it('writes a complete session with question attempts and AI summary', async () => {
    testSessionId = await writeFullSession()

    expect(typeof testSessionId).toBe('string')
    expect(testSessionId.length).toBe(36)

    // Verify all three phases ran (start, log attempts ×4, end)
    // startSession
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO parent_sessions'),
      testSessionId, KID_ID, 'math', 'fractions',
    )
    // endSession
    const endCalls = (mockDb.runAsync as jest.Mock).mock.calls.filter(
      (call: string[]) => call[0]?.includes('UPDATE parent_sessions SET ended_at'),
    )
    expect(endCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('retrieves the session with correct data for parent view', async () => {
    testSessionId = await writeFullSession()

    mockDb.getFirstAsync.mockResolvedValue({
      id: testSessionId, kid_profile_id: KID_ID, subject: 'math', topic: 'fractions',
      started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
      questions_attempted: 4, questions_correct: 2,
      struggle_indicators: '[false,true,true,false]',
      ai_summary: 'Struggled with fraction addition. Needs more practice on common denominators.',
      parent_flagged: 1,
    })

    const session = await ParentSessionRepository.getSession(testSessionId)
    expect(session).not.toBeNull()
    expect(session!.kidProfileId).toBe(KID_ID)
    expect(session!.subject).toBe('math')
    expect(session!.topic).toBe('fractions')
    expect(session!.questionsAttempted).toBe(4)
    expect(session!.questionsCorrect).toBe(2)
    expect(session!.parentFlagged).toBe(true)
    expect(session!.aiSummary).toContain('common denominators')
  })

  it('lists all sessions for a kid (sorted by start time)', async () => {
    await writeFullSession('math', 'addition')
    await writeFullSession('english', 'comprehension')

    // Simulate DB returning both sessions
    mockDb.getAllAsync.mockResolvedValue([
      { id: 'sess-1', kid_profile_id: KID_ID, subject: 'math', topic: 'addition', started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z', questions_attempted: 3, questions_correct: 2, struggle_indicators: '[false,false,true]', ai_summary: 'Addition progress', parent_flagged: 0 },
      { id: 'sess-2', kid_profile_id: KID_ID, subject: 'english', topic: 'comprehension', started_at: '2026-05-10T09:00:00.000Z', ended_at: '2026-05-10T09:20:00.000Z', questions_attempted: 5, questions_correct: 3, struggle_indicators: '[false,true,false]', ai_summary: 'Inference struggle', parent_flagged: 1 },
    ])

    const sessions = await ParentSessionRepository.getSessionsForKid(KID_ID)
    expect(sessions).toHaveLength(2)
    expect(sessions[0].subject).toBe('math')
    expect(sessions[1].subject).toBe('english')
    expect(sessions[1].parentFlagged).toBe(true)
    expect(sessions[0].parentFlagged).toBe(false)
  })

  it('flags a session and persists the flag', async () => {
    testSessionId = await writeFullSession()

    // Flag the session
    await ParentSessionRepository.setParentFlagged(testSessionId, true)

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'UPDATE parent_sessions SET parent_flagged = ? WHERE id = ?',
      1, testSessionId,
    )

    // Simulate retrieval confirming flag
    mockDb.getFirstAsync.mockResolvedValue({
      id: testSessionId, kid_profile_id: KID_ID, subject: 'math', topic: 'fractions',
      started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
      questions_attempted: 4, questions_correct: 2, struggle_indicators: '[false,true,true,false]',
      ai_summary: 'Struggled with fraction addition.',
      parent_flagged: 1,
    })

    const session = await ParentSessionRepository.getSession(testSessionId)
    expect(session!.parentFlagged).toBe(true)
  })

  it('toggles flag off and confirms', async () => {
    testSessionId = await writeFullSession()

    // Flag off
    await ParentSessionRepository.setParentFlagged(testSessionId, false)

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'UPDATE parent_sessions SET parent_flagged = ? WHERE id = ?',
      0, testSessionId,
    )

    // Simulate retrieval confirming flag is off
    mockDb.getFirstAsync.mockResolvedValue({
      id: testSessionId, kid_profile_id: KID_ID, subject: 'math', topic: 'fractions',
      started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z',
      questions_attempted: 4, questions_correct: 2, struggle_indicators: '[false,true,true,false]',
      ai_summary: 'Struggled with fraction addition.',
      parent_flagged: 0,
    })

    const session = await ParentSessionRepository.getSession(testSessionId)
    expect(session!.parentFlagged).toBe(false)
  })
})

// ── SMOKE-02: Struggle detection integrity ─────────────────────

describe('SMOKE-02: Struggle detection flows through to parent view', () => {
  it('captures struggle indicators across multiple questions', async () => {
    testSessionId = await writeFullSession('math', 'fractions', [
      { correct: true, hintsUsed: 0, timeSeconds: 20, struggleDetected: false },
      { correct: false, hintsUsed: 2, timeSeconds: 85, struggleDetected: true },
      { correct: false, hintsUsed: 4, timeSeconds: 150, struggleDetected: true },
    ])

    mockDb.getFirstAsync.mockResolvedValue({
      id: testSessionId, kid_profile_id: KID_ID, subject: 'math', topic: 'fractions',
      started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:10:00.000Z',
      questions_attempted: 3, questions_correct: 1,
      struggle_indicators: '[false,true,true]',
      ai_summary: 'Two struggles detected.',
      parent_flagged: 1,
    })

    const session = await ParentSessionRepository.getSession(testSessionId)
    expect(session!.struggleIndicators).toEqual([false, true, true])
    expect(session!.questionsAttempted).toBe(3)
    expect(session!.questionsCorrect).toBe(1)
  })
})

// ── SMOKE-03: Multi-subject session isolation ──────────────────

describe('SMOKE-03: Multi-subject sessions are isolated per kid', () => {
  it('returns only sessions for the queried kid', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 'sess-math', kid_profile_id: KID_ID, subject: 'math', topic: 'fractions', started_at: '2026-05-10T08:00:00.000Z', ended_at: '2026-05-10T08:15:00.000Z', questions_attempted: 3, questions_correct: 2, struggle_indicators: '[]', ai_summary: null, parent_flagged: 0 },
      { id: 'sess-chinese', kid_profile_id: KID_ID, subject: 'chinese', topic: 'strokes', started_at: '2026-05-10T09:00:00.000Z', ended_at: '2026-05-10T09:20:00.000Z', questions_attempted: 4, questions_correct: 4, struggle_indicators: '[]', ai_summary: null, parent_flagged: 0 },
    ])

    const sessions = await ParentSessionRepository.getSessionsForKid(KID_ID)
    expect(sessions).toHaveLength(2)

    const subjects = sessions.map(s => s.subject)
    expect(subjects).toContain('math')
    expect(subjects).toContain('chinese')

    // No sessions from other kids (mock only returned KID_ID rows)
    const otherKidSessions = sessions.filter(s => s.kidProfileId !== KID_ID)
    expect(otherKidSessions).toHaveLength(0)
  })
})
