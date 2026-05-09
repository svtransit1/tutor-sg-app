import { openDatabaseAsync } from 'expo-sqlite';
import {
  getOrCreateProgress,
  recordAnswer,
  recomputeMastery,
  getProgressBySubject,
  getProgressByTopic,
} from '../kid-progress';
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

describe('getOrCreateProgress', () => {
  it('returns existing progress row', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, kid_profile_id: 1, subject: 'math', topic: 'M-P3-N-01',
      topic_en: 'Numbers', topic_zh: '数字',
      questions_attempted: 10, questions_correct: 8, total_time_spent: 300,
      last_practiced_at: '2026-05-07T10:00:00.000Z',
      mastery_level: 'proficient',
      created_at: '2026-05-01T00:00:00.000Z',
      updated_at: '2026-05-07T10:00:00.000Z',
    });

    const result = await getOrCreateProgress(1, 'math', 'M-P3-N-01');
    expect(result.subject).toBe('math');
    expect(result.masteryLevel).toBe('proficient');
    expect(result.questionsAttempted).toBe(10);
  });

  it('creates new progress row when not found', async () => {
    mockDb.getFirstAsync
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 2, kid_profile_id: 1, subject: 'english', topic: 'E-P3-G-01',
        topic_en: 'Grammar', topic_zh: '语法',
        questions_attempted: 0, questions_correct: 0, total_time_spent: 0,
        last_practiced_at: null,
        mastery_level: 'not_started',
        created_at: '2026-05-07T10:00:00.000Z',
        updated_at: '2026-05-07T10:00:00.000Z',
      });

    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 2 });

    const result = await getOrCreateProgress(1, 'english', 'E-P3-G-01', 'Grammar', '语法');
    expect(result.subject).toBe('english');
    expect(result.masteryLevel).toBe('not_started');
  });
});

describe('recordAnswer', () => {
  it('increments correct count for correct answer', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
    await recordAnswer(1, 'math', 'M-P3-N-01', true, 30);
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('questions_correct = questions_correct + 1');
  });

  it('only increments attempted count for wrong answer', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });
    await recordAnswer(1, 'math', 'M-P3-N-01', false, 45);
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).not.toContain('questions_correct');
    expect(sql).toContain('questions_attempted = questions_attempted + 1');
  });
});

describe('recomputeMastery', () => {
  it('sets mastered when accuracy >= 0.9 and 10+ attempts', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, questions_attempted: 10, questions_correct: 9,
      kid_profile_id: 1, subject: 'math', topic: 'M-P3-N-01',
      topic_en: null, topic_zh: null, total_time_spent: 500,
      last_practiced_at: null, mastery_level: 'developing',
      created_at: '', updated_at: '',
    });
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

    await recomputeMastery(1, 'math', 'M-P3-N-01');
    const params = mockDb.runAsync.mock.calls[0];
    expect(params[1]).toBe('mastered');
    expect(params[3]).toBe(1);
    expect(params[4]).toBe('math');
    expect(params[5]).toBe('M-P3-N-01');
  });

  it('sets beginner when attempts < 5', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, questions_attempted: 2, questions_correct: 2,
      kid_profile_id: 1, subject: 'math', topic: 'M-P3-N-01',
      topic_en: null, topic_zh: null, total_time_spent: 100,
      last_practiced_at: null, mastery_level: 'not_started',
      created_at: '', updated_at: '',
    });
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 0 });

    await recomputeMastery(1, 'math', 'M-P3-N-01');
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('SET mastery_level = ?');
    expect(mockDb.runAsync.mock.calls[0][1]).toBe('beginner');
  });

  it('does nothing when no progress exists', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.runAsync.mockClear();
    await recomputeMastery(1, 'math', 'M-P3-N-01');
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('getProgressBySubject', () => {
  it('returns aggregated progress per subject', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { subject: 'math', total_topics: 3, topics_started: 2, topics_mastered: 1, total_attempted: 30, total_correct: 25 },
      { subject: 'english', total_topics: 2, topics_started: 1, topics_mastered: 0, total_attempted: 10, total_correct: 7 },
    ]);

    const result = await getProgressBySubject(1);
    expect(result).toHaveLength(2);
    expect(result[0].subject).toBe('math');
    expect(result[0].totalTopics).toBe(3);
    expect(result[0].overallAccuracy).toBeCloseTo(0.83, 1);
  });

  it('returns zero accuracy when no questions', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { subject: 'science', total_topics: 1, topics_started: 1, topics_mastered: 0, total_attempted: 0, total_correct: 0 },
    ]);

    const result = await getProgressBySubject(1);
    expect(result[0].overallAccuracy).toBe(0);
  });
});

describe('getProgressByTopic', () => {
  it('returns progress rows ordered by mastery', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { id: 1, kid_profile_id: 1, subject: 'math', topic: 'M-P3-A-01', topic_en: 'Addition', topic_zh: '加法', questions_attempted: 15, questions_correct: 14, total_time_spent: 600, last_practiced_at: '2026-05-07T10:00:00.000Z', mastery_level: 'mastered', created_at: '', updated_at: '' },
      { id: 2, kid_profile_id: 1, subject: 'math', topic: 'M-P3-S-01', topic_en: 'Subtraction', topic_zh: '减法', questions_attempted: 5, questions_correct: 3, total_time_spent: 200, last_practiced_at: '2026-05-06T10:00:00.000Z', mastery_level: 'developing', created_at: '', updated_at: '' },
    ]);

    const result = await getProgressByTopic(1, 'math');
    expect(result).toHaveLength(2);
    expect(result[0].masteryLevel).toBe('mastered');
    expect(result[1].masteryLevel).toBe('developing');
  });
});
