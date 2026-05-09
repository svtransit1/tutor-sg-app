import { openDatabaseAsync } from 'expo-sqlite';
import { insertSession, getRecentSessions, getSessionCount, getPaginatedSessions } from '../sessions';
import { resetDb } from '../database';

let mockDb: {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

beforeEach(async () => {
  resetDb();
  jest.clearAllMocks();
  mockDb = await openDatabaseAsync();
});

describe('insertSession', () => {
  it('calls runAsync with correct SQL and params', async () => {
    mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });

    const id = await insertSession('math', 5, 120);

    expect(id).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO kid_sessions'),
      'math',
      5,
      120,
      expect.any(String),
      null,
      null,
      null,
    );
  });

  it('inserts sessions for all subjects', async () => {
    for (const subject of ['math', 'english', 'science', 'chinese'] as const) {
      mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });
      await insertSession(subject, 3, 0);
    }
    expect(mockDb.runAsync).toHaveBeenCalledTimes(4);
  });

  it('defaults timeSpent to 0', async () => {
    mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });

    await insertSession('math', 5);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.any(String),
      'math',
      5,
      0,
      expect.any(String),
      null,
      null,
      null,
    );
  });

  it('accepts optional topic params', async () => {
    mockDb.runAsync.mockResolvedValueOnce({ changes: 1, lastInsertRowId: 1 });

    await insertSession('math', 5, 120, {
      topic: 'M-P3-N-01',
      topicEn: 'Numbers to 1000',
      topicZh: '1000以内的数字',
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.any(String),
      'math',
      5,
      120,
      expect.any(String),
      'M-P3-N-01',
      'Numbers to 1000',
      '1000以内的数字',
    );
  });
});

describe('getRecentSessions', () => {
  it('returns empty array when no sessions exist', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);

    const sessions = await getRecentSessions(3);
    expect(sessions).toEqual([]);
  });

  it('returns mapped session objects', async () => {
    const mockRows = [
      { id: 1, kid_profile_id: 1, subject: 'math', topic: null, topic_en: null, topic_zh: null, question_count: 5, time_spent: 120, status: 'completed', struggle_indicators: null, summary_en: null, summary_zh: null, ai_help_summary_en: null, ai_help_summary_zh: null, parent_flagged: 0, parent_flag_note: null, created_at: '2026-05-07T10:00:00.000Z', updated_at: '2026-05-07T10:00:00.000Z' },
      { id: 2, kid_profile_id: 1, subject: 'english', topic: null, topic_en: null, topic_zh: null, question_count: 3, time_spent: 90, status: 'completed', struggle_indicators: null, summary_en: null, summary_zh: null, ai_help_summary_en: null, ai_help_summary_zh: null, parent_flagged: 0, parent_flag_note: null, created_at: '2026-05-07T09:00:00.000Z', updated_at: '2026-05-07T09:00:00.000Z' },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockRows);

    const sessions = await getRecentSessions(2);
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toMatchObject({ id: 1, subject: 'math', questionCount: 5 });
    expect(sessions[1]).toMatchObject({ id: 2, subject: 'english', questionCount: 3 });
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
