import { openDatabaseAsync } from 'expo-sqlite';
import {
  getParentSessionById,
  getSessionsForParent,
  getDailySummaries,
  getFlaggedSessions,
  flagSession,
  unflagSession,
  updateSessionSummary,
  insertSessionEvent,
  getSessionEvents,
} from '../parent-log';
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

describe('getParentSessionById', () => {
  it('returns null when session not found', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const result = await getParentSessionById(999);
    expect(result).toBeNull();
  });

  it('returns mapped session when found', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, kid_profile_id: 1, subject: 'math', topic: 'M-P3-N-01',
      topic_en: 'Numbers', topic_zh: '数字',
      question_count: 5, time_spent: 120, status: 'completed',
      struggle_indicators: '[{"type":"struggle_detected","question":2}]',
      summary_en: 'Good session', summary_zh: '不错的课程',
      ai_help_summary_en: null, ai_help_summary_zh: null,
      parent_flagged: 0, parent_flag_note: null,
      created_at: '2026-05-07T10:00:00.000Z', updated_at: '2026-05-07T10:00:00.000Z',
    });

    const result = await getParentSessionById(1);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
    expect(result!.subject).toBe('math');
    expect(result!.summaryEn).toBe('Good session');
    expect(result!.parentFlagged).toBe(false);
  });

  it('returns flagged session with note', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 2, kid_profile_id: 1, subject: 'english', topic: null,
      topic_en: null, topic_zh: null,
      question_count: 3, time_spent: 90, status: 'completed',
      struggle_indicators: null,
      summary_en: null, summary_zh: null,
      ai_help_summary_en: null, ai_help_summary_zh: null,
      parent_flagged: 1, parent_flag_note: 'Kid was confused here',
      created_at: '2026-05-07T09:00:00.000Z', updated_at: '2026-05-07T09:00:00.000Z',
    });

    const result = await getParentSessionById(2);
    expect(result!.parentFlagged).toBe(true);
    expect(result!.parentFlagNote).toBe('Kid was confused here');
  });
});

describe('getSessionsForParent', () => {
  it('returns filtered sessions within date range', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const result = await getSessionsForParent(1, 7);
    expect(result).toEqual([]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE kid_profile_id = ? AND created_at >= ?'),
      1,
      expect.any(String),
    );
  });
});

describe('getDailySummaries', () => {
  it('returns daily groupings', async () => {
    mockDb.getAllAsync
      .mockResolvedValueOnce([
        { date: '2026-05-07', session_count: 2, total_time_spent: 210, total_questions: 8 },
      ])
      .mockResolvedValueOnce([
        { subject: 'math' },
        { subject: 'english' },
      ]);

    const result = await getDailySummaries(1, 7);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-05-07');
    expect(result[0].sessionCount).toBe(2);
    expect(result[0].subjects).toEqual(['math', 'english']);
  });
});

describe('flagSession', () => {
  it('updates session with flag and note', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
    await flagSession(1, 'Kid struggled here');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE kid_sessions'),
      'Kid struggled here',
      expect.any(String),
      1,
    );
  });
});

describe('unflagSession', () => {
  it('clears flag and note', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
    await unflagSession(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET parent_flagged = 0, parent_flag_note = NULL'),
      expect.any(String),
      1,
    );
  });
});

describe('getFlaggedSessions', () => {
  it('queries for flagged sessions', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const result = await getFlaggedSessions(1);
    expect(result).toEqual([]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('parent_flagged = 1'),
      1,
    );
  });
});

describe('updateSessionSummary', () => {
  it('updates summary fields', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
    await updateSessionSummary(1, {
      summaryEn: 'Great progress',
      summaryZh: '进步很大',
    });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET summary_en = ?, summary_zh = ?, updated_at = ?'),
      'Great progress',
      '进步很大',
      expect.any(String),
      1,
    );
  });

  it('skips update when no fields provided', async () => {
    await updateSessionSummary(1, {});
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('session events', () => {
  it('insertSessionEvent creates event', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 42 });
    const id = await insertSessionEvent(1, 'hint_shown', { questionIndex: 2 });
    expect(id).toBe(42);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO session_events'),
      1,
      'hint_shown',
      expect.any(String),
      expect.any(String),
    );
  });

  it('getSessionEvents returns events ordered ascending', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 1, session_id: 1, event_type: 'question_attempted', payload: null, created_at: '2026-05-07T10:00:00.000Z' },
      { id: 2, session_id: 1, event_type: 'hint_shown', payload: '{"questionIndex":1}', created_at: '2026-05-07T10:01:00.000Z' },
    ]);
    const events = await getSessionEvents(1);
    expect(events).toHaveLength(2);
    expect(events[0].event_type).toBe('question_attempted');
  });
});
