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
      if (sql.includes('UPDATE kid_sessions SET question_count')) {
        const session = sessions.find((s) => s.id === Number(params[0]))
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
  const { openDatabaseAsync } = require('expo-sqlite')
  openDatabaseAsync({} as any).then((db: any) => db.__reset?.())
})

import { renderHook, act } from '@testing-library/react-native'
import { useHomeworkSession } from '../useHomeworkSession'

describe('useHomeworkSession', () => {
  it('starts with no active session', () => {
    const { result } = renderHook(() => useHomeworkSession())
    expect(result.current.sessionId).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.currentSession).toBeNull()
  })

  it('startSession creates a new session and returns the id', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    let id: number
    await act(async () => {
      id = await result.current.startSession('math')
    })

    expect(result.current.sessionId).toBe(id!)
    expect(result.current.currentSession).not.toBeNull()
    expect(result.current.currentSession!.subject).toBe('math')
    expect(result.current.isLoading).toBe(false)
  })

  it('addEvent appends an event to the active session', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await act(async () => {
      await result.current.startSession('english')
    })

    let eventId: number
    await act(async () => {
      eventId = await result.current.addEvent('ocr', { text: 'test question' })
    })

    expect(eventId!).toBeGreaterThanOrEqual(1)
    expect(result.current.isLoading).toBe(false)
  })

  it('incrementQuestionCount increments the count', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await act(async () => {
      await result.current.startSession('science')
    })

    await act(async () => {
      await result.current.incrementQuestionCount()
    })

    expect(result.current.currentSession!.questionCount).toBe(1)

    await act(async () => {
      await result.current.incrementQuestionCount()
      await result.current.incrementQuestionCount()
    })

    expect(result.current.currentSession!.questionCount).toBe(3)
  })

  it('closeSession closes the session', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await act(async () => {
      await result.current.startSession('chinese')
      await result.current.addEvent('ocr', { text: 'q1' })
      await result.current.closeSession()
    })

    expect(result.current.currentSession!.closedAt).not.toBeNull()
    expect(result.current.sessionId).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('reset clears all session state', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await act(async () => {
      await result.current.startSession('math')
    })

    expect(result.current.sessionId).not.toBeNull()

    act(() => {
      result.current.reset()
    })

    expect(result.current.sessionId).toBeNull()
    expect(result.current.currentSession).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('addEvent throws when no active session', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await expect(
      act(async () => {
        await result.current.addEvent('ocr', {})
      }),
    ).rejects.toThrow('No active session')
  })

  it('closeSession throws when no active session', async () => {
    const { result } = renderHook(() => useHomeworkSession())

    await expect(
      act(async () => {
        await result.current.closeSession()
      }),
    ).rejects.toThrow('No active session')
  })
})
