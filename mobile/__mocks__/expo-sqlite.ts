interface MockRow {
  [key: string]: unknown
}

const sessions: MockRow[] = []
const events: MockRow[] = []
let sessionIdCounter = 0
let eventIdCounter = 0

const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn((sql: string, ...params: unknown[]) => {
    if (sql.includes('INSERT INTO kid_sessions')) {
      const id = ++sessionIdCounter
      sessions.push({
        id,
        subject: params[0],
        question_count: params[1],
        created_at: params[2] ?? new Date().toISOString(),
        closed_at: null,
      })
      return Promise.resolve({ lastInsertRowId: id })
    }
    if (sql.includes('INSERT INTO session_events')) {
      const id = ++eventIdCounter
      events.push({
        id,
        session_id: params[0],
        event_type: params[1],
        payload: params[2],
        created_at: params[3] ?? new Date().toISOString(),
      })
      return Promise.resolve({ lastInsertRowId: id })
    }
    if (sql.includes('UPDATE kid_sessions')) {
      const sessionId = params[1]
      const session = sessions.find((s) => s.id === sessionId)
      if (session) session.closed_at = params[0]
      return Promise.resolve({ rowsAffected: 1 })
    }
    return Promise.resolve({ lastInsertRowId: 0 })
  }),
  getAllAsync: jest.fn((sql: string, ...params: unknown[]) => {
    if (sql.includes('session_events')) {
      const sessionId = params[0]
      return Promise.resolve(events.filter((e) => e.session_id === sessionId))
    }
    if (sql.includes('kid_sessions')) {
      if (sql.includes('WHERE id = ?')) {
        const id = params[0]
        return Promise.resolve(sessions.filter((s) => s.id === id))
      }
      if (sql.includes('WHERE date(created_at) = ?')) {
        const date = params[0]
        return Promise.resolve(
          sessions.filter((s) => s.created_at.startsWith(date)),
        )
      }
      const limit = params[0]
      return Promise.resolve([...sessions].slice(-limit).reverse())
    }
    return Promise.resolve([])
  }),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
}

export const openDatabaseAsync = jest.fn(() => Promise.resolve(mockDb))
export const openDatabaseSync = () => mockDb
