/**
 * Tests for kid sessions SQLite storage.
 *
 * Uses the expo-sqlite mock from __mocks__/expo-sqlite.ts.
 * The moduleNameMapper in jest.config.js maps ^expo-sqlite$ to that mock.
 */
import { openDatabaseAsync } from 'expo-sqlite';
import { insertSession, getRecentSessions, getSessionCount, getPaginatedSessions } from '../sessions';

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

describe('getPaginatedSessions', () => {
  it('returns empty result when no sessions exist', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 0 });
    mockDb.getAllAsync.mockResolvedValue([]);

    const result = await getPaginatedSessions(1, 20);

    expect(result).toEqual({ sessions: [], total: 0, hasMore: false });
  });

  it('returns first page with mapped sessions', async () => {
    const mockRows = [
      { id: 1, subject: 'math', question_count: 5, created_at: '2026-05-07T10:00:00.000Z' },
      { id: 2, subject: 'english', question_count: 3, created_at: '2026-05-07T09:00:00.000Z' },
    ];
    mockDb.getFirstAsync.mockResolvedValue({ count: 2 });
    mockDb.getAllAsync.mockResolvedValue(mockRows);

    const result = await getPaginatedSessions(1, 20);

    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0]).toEqual({ id: 1, subject: 'math', questionCount: 5, createdAt: '2026-05-07T10:00:00.000Z' });
    expect(result.total).toBe(2);
    expect(result.hasMore).toBe(false);
  });

  it('sets hasMore when more pages exist', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 25 });
    mockDb.getAllAsync.mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        subject: 'math',
        question_count: 3,
        created_at: '2026-05-07T10:00:00.000Z',
      })),
    );

    const result = await getPaginatedSessions(1, 20);

    expect(result.sessions).toHaveLength(20);
    expect(result.total).toBe(25);
    expect(result.hasMore).toBe(true);
  });

  it('sets hasMore false on last page', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 25 });
    mockDb.getAllAsync.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 21,
        subject: 'science',
        question_count: 4,
        created_at: '2026-05-07T10:00:00.000Z',
      })),
    );

    const result = await getPaginatedSessions(2, 20);

    expect(result.sessions).toHaveLength(5);
    expect(result.total).toBe(25);
    expect(result.hasMore).toBe(false);
  });

  it('queries with correct offset for page 2', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 50 });
    mockDb.getAllAsync.mockResolvedValue([]);

    await getPaginatedSessions(2, 20);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT ? OFFSET ?'),
      20,
      20,
    );
  });

  it('handles page 3 offset correctly', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 100 });
    mockDb.getAllAsync.mockResolvedValue([]);

    await getPaginatedSessions(3, 20);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT ? OFFSET ?'),
      20,
      40,
    );
  });

  it('maps subject enum and camelCase field names', async () => {
    const mockRows = [
      { id: 1, subject: 'chinese', question_count: 10, created_at: '2026-05-01T00:00:00.000Z' },
    ];
    mockDb.getFirstAsync.mockResolvedValue({ count: 1 });
    mockDb.getAllAsync.mockResolvedValue(mockRows);

    const result = await getPaginatedSessions(1, 20);

    expect(result.sessions[0].subject).toBe('chinese');
    expect(result.sessions[0].questionCount).toBe(10);
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
