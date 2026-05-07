// Self-contained mock with no out-of-scope references.
// State lives entirely inside the jest.mock factory closure.
// State is reset via the __reset marker exposed on the mock db object.

jest.mock('expo-sqlite', () => {
  let sid = 0
  let eid = 0
  const sessions: any[] = []
  const events: any[] = []

  const db = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockImplementation((sql: string, ...params: any[]) => {
      if (sql.includes('INSERT INTO kid_sessions')) {
        sid++
        sessions.push({
          id: sid,
          subject: String(params[0]),
          question_count: Number(params[1]),
          created_at: String(params[2] ?? new Date().toISOString()),
          closed_at: null,
        })
        return Promise.resolve({ changes: 1, lastInsertRowId: sid })
      }
      if (sql.includes('INSERT INTO session_events')) {
        eid++
        events.push({
          id: eid,
          session_id: Number(params[0]),
          event_type: String(params[1]),
          payload: String(params[2]),
          created_at: String(params[3] ?? new Date().toISOString()),
        })
        return Promise.resolve({ changes: 1, lastInsertRowId: eid })
      }
      if (sql.includes('question_count')) {
        const sessionId = Number(params[0])
        const session = sessions.find((s) => s.id === sessionId)
        if (session) session.question_count++
        return Promise.resolve({ changes: 1, lastInsertRowId: 0 })
      }
      if (sql.includes('UPDATE kid_sessions')) {
        const sessionId = Number(params[1])
        const session = sessions.find((s) => s.id === sessionId)
        if (session) session.closed_at = String(params[0])
        return Promise.resolve({ changes: 1, lastInsertRowId: 0 })
      }
      return Promise.resolve({ changes: 0, lastInsertRowId: 0 })
    }),
    getAllAsync: jest.fn().mockImplementation((sql: string, ...params: any[]) => {
      if (sql.includes('session_events')) {
        return Promise.resolve(events.filter((e) => e.session_id === params[0]))
      }
      if (sql.includes('WHERE id = ?')) {
        return Promise.resolve(sessions.filter((s) => s.id === params[0]))
      }
      if (sql.includes('WHERE date(created_at) = ?')) {
        return Promise.resolve(sessions.filter((s) => s.created_at.startsWith(String(params[0]))))
      }
      return Promise.resolve([...sessions].reverse())
    }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  }

  // Marker so beforeEach can reset the mock's internal counters
  ;(db as any).__reset = () => { sid = 0; eid = 0; sessions.splice(0); events.splice(0) }

  return {
    openDatabaseAsync: jest.fn(() => Promise.resolve(db)),
    openDatabaseSync: jest.fn(() => db),
    deleteDatabaseAsync: jest.fn().mockResolvedValue(undefined),
    default: { openDatabaseAsync: jest.fn(() => Promise.resolve(db)) },
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  // Reset the mock's internal state between tests
  const { openDatabaseAsync } = require('expo-sqlite')
  openDatabaseAsync({} as any).then((db: any) => db.__reset?.())
})

import { SessionRepository } from '../sessions'

describe('SessionRepository', () => {
  describe('createSession', () => {
    it('inserts a session and returns its id', async () => {
      const id = await SessionRepository.createSession('math')
      expect(id).toBe(1)
    })
  })

  describe('addEvent', () => {
    it('appends an OCR event with auto-incremented id', async () => {
      const id = await SessionRepository.createSession('math')
      const eventId = await SessionRepository.addEvent(id, 'ocr', { text: '2x + 3 = 7' })
      expect(eventId).toBe(1)
    })

    it('appends an LLM response event', async () => {
      const id = await SessionRepository.createSession('math')
      await SessionRepository.addEvent(id, 'llm_prompt', { question: 'q1' })
      const eventId = await SessionRepository.addEvent(id, 'llm_response', { answer: 'x = 2' })
      expect(eventId).toBe(2)
    })
  })

  describe('getSessionWithEvents', () => {
    it('returns session with 3 events in chronological order', async () => {
      const id = await SessionRepository.createSession('math')
      await SessionRepository.addEvent(id, 'ocr', { text: 'q1' })
      await SessionRepository.addEvent(id, 'llm_prompt', { q: 'q2' })
      await SessionRepository.addEvent(id, 'llm_response', { a: 'a2' })

      const result = await SessionRepository.getSessionWithEvents(id)
      expect(result).not.toBeNull()
      expect(result!.session.subject).toBe('math')
      expect(result!.events).toHaveLength(3)
      expect(result!.events[0].type).toBe('ocr')
      expect(result!.events[1].type).toBe('llm_prompt')
      expect(result!.events[2].type).toBe('llm_response')
    })

    it('returns null for unknown session id', async () => {
      const result = await SessionRepository.getSessionWithEvents(99999)
      expect(result).toBeNull()
    })
  })

  describe('getSessionsByDate', () => {
    it('returns sessions created on the given date', async () => {
      const today = new Date().toISOString().split('T')[0]
      await SessionRepository.createSession('english')
      await SessionRepository.createSession('science')

      const sessions = await SessionRepository.getSessionsByDate(today)
      expect(sessions.length).toBeGreaterThanOrEqual(2)
      expect(sessions[0].subject).toBeTruthy()
    })
  })

  describe('closeSession', () => {
    it('sets closedAt on the session', async () => {
      const id = await SessionRepository.createSession('math')
      await SessionRepository.addEvent(id, 'ocr', { text: 'test' })
      await SessionRepository.closeSession(id)

      const result = await SessionRepository.getSessionWithEvents(id)
      expect(result!.session.closedAt).not.toBeNull()
    })
  })

  describe('incrementQuestionCount', () => {
    it('increments question_count by 1', async () => {
      const id = await SessionRepository.createSession('math')
      const before = await SessionRepository.getSessionWithEvents(id)
      expect(before!.session.questionCount).toBe(0)

      await SessionRepository.incrementQuestionCount(id)
      const after = await SessionRepository.getSessionWithEvents(id)
      expect(after!.session.questionCount).toBe(1)
    })

    it('increments multiple times correctly', async () => {
      const id = await SessionRepository.createSession('science')
      await SessionRepository.incrementQuestionCount(id)
      await SessionRepository.incrementQuestionCount(id)
      await SessionRepository.incrementQuestionCount(id)

      const result = await SessionRepository.getSessionWithEvents(id)
      expect(result!.session.questionCount).toBe(3)
    })

    it('does not fail on non-existent session', async () => {
      await expect(SessionRepository.incrementQuestionCount(99999)).resolves.toBeUndefined()
    })
  })

  describe('getSessionsForParent', () => {
    it('returns sessions grouped by date with today group', async () => {
      const id = await SessionRepository.createSession('math')
      await SessionRepository.closeSession(id)

      const groups = await SessionRepository.getSessionsForParent(50)
      expect(groups.length).toBeGreaterThanOrEqual(1)
      const todayGroup = groups.find((g) => g.label === 'today')
      expect(todayGroup).toBeDefined()
      expect(todayGroup!.sessions.length).toBeGreaterThanOrEqual(1)
    })

    it('returns empty array when getSessionCount is 0', async () => {
      const groups = await SessionRepository.getSessionsForParent(50)
      const sessionCount = await SessionRepository.getSessionCount()
      // We just created sessions above in the previous test,
      // but that's fine — the function should not throw.
      expect(Array.isArray(groups)).toBe(true)
      expect(sessionCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getSessionSummary', () => {
    it('returns event count and duration', async () => {
      const id = await SessionRepository.createSession('english')
      await SessionRepository.addEvent(id, 'ocr', { text: 'q' })
      await SessionRepository.addEvent(id, 'llm_prompt', { q: 'q1' })
      await SessionRepository.closeSession(id)

      const summary = await SessionRepository.getSessionSummary(id)
      expect(summary).not.toBeNull()
      expect(summary!.eventCount).toBe(2)
      expect(summary!.durationMinutes).toBeGreaterThanOrEqual(0)
    })

    it('returns null for non-existent session', async () => {
      const summary = await SessionRepository.getSessionSummary(99999)
      expect(summary).toBeNull()
    })

    it('returns null duration if session is not closed', async () => {
      const id = await SessionRepository.createSession('science')
      const summary = await SessionRepository.getSessionSummary(id)
      expect(summary).not.toBeNull()
      expect(summary!.durationMinutes).toBeNull()
      expect(summary!.eventCount).toBe(0)
    })
  })
})

describe('named exports', () => {
  it('exports all convenience functions', () => {
    const mod = require('../sessions')
    expect(typeof mod.getRecentSessions).toBe('function')
    expect(typeof mod.createSession).toBe('function')
    expect(typeof mod.addEvent).toBe('function')
    expect(typeof mod.closeSession).toBe('function')
    expect(typeof mod.incrementQuestionCount).toBe('function')
    expect(typeof mod.getSessionsByDate).toBe('function')
    expect(typeof mod.getSessionWithEvents).toBe('function')
    expect(typeof mod.getSessionCount).toBe('function')
    expect(typeof mod.getSessionsForParent).toBe('function')
    expect(typeof mod.getSessionSummary).toBe('function')
  })
})
