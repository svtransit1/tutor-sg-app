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
})
