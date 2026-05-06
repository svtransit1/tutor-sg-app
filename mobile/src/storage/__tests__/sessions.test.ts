/**
 * Tests for kid sessions SQLite storage.
 *
 * Uses the expo-sqlite mock from __mocks__/expo-sqlite.ts.
 * The moduleNameMapper in jest.config.js maps ^expo-sqlite$ to that mock.
 */
import { openDatabaseAsync } from 'expo-sqlite';
import { insertSession, getRecentSessions, getSessionCount } from '../sessions';

// The mock from __mocks__/expo-sqlite.ts returns a shared mockDb object.
// We import openDatabaseAsync which is a jest.fn(), then get the resolved
// mock DB to configure return values for each test.

let mockDb: {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

beforeEach(async () => {
  jest.clearAllMocks();
  // The mock from __mocks__/expo-sqlite.ts creates a fresh DB on each call
  mockDb = await openDatabaseAsync();
});

describe('insertSession', () => {
  it('calls runAsync with correct SQL and params', async () => {
    mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });

    const id = await insertSession('math', 5);

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO kid_sessions (subject, question_count, created_at) VALUES (?, ?, ?)',
      'math',
      5,
      expect.any(String),
    );
  });

  it('inserts sessions for all subjects', async () => {
    for (const subject of ['math', 'english', 'science', 'chinese'] as const) {
      mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });
      await insertSession(subject, 3);
    }
    expect(mockDb.runAsync).toHaveBeenCalledTimes(4);
  });
});

describe('getRecentSessions', () => {
  it('returns empty array when no sessions exist', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);

    const sessions = await getRecentSessions(3);
    expect(sessions).toEqual([]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT id, subject, question_count, created_at FROM kid_sessions ORDER BY created_at DESC LIMIT ?',
      3,
    );
  });

  it('returns mapped session objects', async () => {
    const mockRows = [
      { id: 1, subject: 'math', question_count: 5, created_at: '2026-05-07T10:00:00.000Z' },
      { id: 2, subject: 'english', question_count: 3, created_at: '2026-05-07T09:00:00.000Z' },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockRows);

    const sessions = await getRecentSessions(2);
    expect(sessions).toEqual([
      { id: 1, subject: 'math', questionCount: 5, createdAt: '2026-05-07T10:00:00.000Z' },
      { id: 2, subject: 'english', questionCount: 3, createdAt: '2026-05-07T09:00:00.000Z' },
    ]);
  });

  it('respects custom limit', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    await getRecentSessions(5);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.any(String), 5);
  });
});

describe('getSessionCount', () => {
  it('returns 0 when no sessions', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 0 });
    const count = await getSessionCount();
    expect(count).toBe(0);
  });

  it('returns correct count', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 7 });
    const count = await getSessionCount();
    expect(count).toBe(7);
  });
});
