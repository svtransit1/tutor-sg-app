// @tutor-sg/database — SQLite + sqlite-vec wrapper for tutor-sg

export interface DatabaseAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
}

export const database: DatabaseAdapter = {
  async query(sql) {
    console.warn('[database] not yet implemented')
    return []
  },
  async run(sql) {
    console.warn('[database] not yet implemented')
  },
}

export default database
