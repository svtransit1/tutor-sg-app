/**
 * Unit tests for homework session persistence (AAAS-130).
 *
 * Tests use InMemorySessionRepository to verify CRUD logic
 * without a native SQLite dependency.
 *
 * Coverage:
 * - Schema DDL structure and constraints
 * - Serialisation round-trip (sessionToRow ↔ rowToSession)
 * - Create session with full question/interaction data
 * - Read session by ID
 * - List sessions with filters (subject, status, level, date range, pagination)
 * - Count sessions
 * - Update session fields
 * - Flag session for parent review
 * - Delete session
 * - Close/cleanup
 * - Subject and level domain validation
 */

import { InMemorySessionRepository } from '../database-inmemory';
import {
  rowToSession,
  sessionToRow,
  SCHEMA_SQL,
} from '../database';
import type {
  HomeworkSession,
  Question,
  Interaction,
  Subject,
} from '@tutor-sg/shared';

// ── Test helpers ──────────────────────────────────────────────────

function makeSession(
  overrides: Partial<HomeworkSession> = {},
): HomeworkSession {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? 'test-session-001',
    kidProfileId: overrides.kidProfileId ?? 'kid-001',
    subject: overrides.subject ?? 'math',
    topic: overrides.topic,
    level: overrides.level ?? 3,
    status: overrides.status ?? 'active',
    startedAt: overrides.startedAt ?? now,
    endedAt: overrides.endedAt,
    durationSeconds: overrides.durationSeconds,
    photoPaths: overrides.photoPaths ?? [],
    questions: overrides.questions ?? [],
    kidInteractions: overrides.kidInteractions ?? [],
    aiSummary: overrides.aiSummary,
    parentFlagged: overrides.parentFlagged ?? false,
    parentNote: overrides.parentNote,
    parentFlaggedAt: overrides.parentFlaggedAt,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

function makeQuestion(
  overrides: Partial<Question> = {},
): Question {
  return {
    id: overrides.id ?? 'q-001',
    index: overrides.index ?? 0,
    ocrText: overrides.ocrText ?? '5 + 3 = ?',
    ocrConfidence: overrides.ocrConfidence ?? 0.92,
    manualInput: overrides.manualInput,
    hintsGiven: overrides.hintsGiven ?? [],
    stepsRevealed: overrides.stepsRevealed ?? [],
    solutionRevealed: overrides.solutionRevealed ?? false,
    solution: overrides.solution,
    kidAnswer: overrides.kidAnswer,
    struggled: overrides.struggled ?? false,
    correct: overrides.correct,
  };
}

function makeInteraction(
  overrides: Partial<Interaction> = {},
): Interaction {
  return {
    id: overrides.id ?? 'i-001',
    type: overrides.type ?? 'text',
    content: overrides.content ?? 'I need help',
    timestamp: overrides.timestamp ?? new Date().toISOString(),
  };
}

async function createRepo(): Promise<InMemorySessionRepository> {
  const repo = new InMemorySessionRepository();
  await repo.init();
  return repo;
}

async function createAndGet(
  repo: InMemorySessionRepository,
  overrides: Partial<HomeworkSession> = {},
): Promise<HomeworkSession> {
  const session = makeSession(overrides);
  await repo.createSession(session);
  const retrieved = await repo.getSession(session.id);
  expect(retrieved).not.toBeNull();
  return retrieved!;
}

// ── Schema DDL ────────────────────────────────────────────────────

describe('SCHEMA_SQL', () => {
  it('contains CREATE TABLE IF NOT EXISTS sessions', () => {
    expect(SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS sessions');
  });

  it('contains all required columns', () => {
    const required = [
      'id TEXT PRIMARY KEY',
      'kid_profile_id TEXT NOT NULL',
      'subject TEXT NOT NULL',
      'level INTEGER NOT NULL',
      'status TEXT NOT NULL',
      'started_at TEXT NOT NULL',
      'photo_paths TEXT NOT NULL',
      'questions TEXT NOT NULL',
      'kid_interactions TEXT NOT NULL',
      'parent_flagged INTEGER NOT NULL',
      'created_at TEXT NOT NULL',
      'updated_at TEXT NOT NULL',
    ];
    for (const col of required) {
      expect(SCHEMA_SQL).toContain(col);
    }
  });

  it('has CHECK constraints for subject, level, status, parent_flagged', () => {
    expect(SCHEMA_SQL).toContain(
      "CHECK(subject IN ('english','math','science','chinese_mt'))",
    );
    expect(SCHEMA_SQL).toContain('CHECK(level BETWEEN 1 AND 6)');
    expect(SCHEMA_SQL).toContain(
      "CHECK(status IN ('active','completed','flagged'))",
    );
    expect(SCHEMA_SQL).toContain('CHECK(parent_flagged IN (0,1))');
  });

  it('creates all four indexes', () => {
    expect(SCHEMA_SQL).toContain('idx_sessions_kid_profile');
    expect(SCHEMA_SQL).toContain('idx_sessions_subject');
    expect(SCHEMA_SQL).toContain('idx_sessions_started_at');
    expect(SCHEMA_SQL).toContain('idx_sessions_status');
  });
});

// ── Serialisation round-trip ──────────────────────────────────────

describe('serialisation round-trip', () => {
  it('sessionToRow → rowToSession preserves all fields', () => {
    const session = makeSession({
      id: 'roundtrip-001',
      kidProfileId: 'kid-roundtrip',
      subject: 'science',
      level: 5,
      topic: 'Magnets',
      status: 'completed',
      startedAt: '2026-05-01T08:00:00.000Z',
      endedAt: '2026-05-01T08:30:00.000Z',
      durationSeconds: 1800,
      photoPaths: ['/cache/photos/img001.jpg'],
      questions: [
        makeQuestion({ id: 'q-rt-1' }),
        makeQuestion({ id: 'q-rt-2' }),
      ],
      kidInteractions: [makeInteraction({ id: 'i-rt-1' })],
      aiSummary:
        'Student struggled with fractions but improved with hints.',
      parentFlagged: true,
      parentNote: 'Too easy, need harder problems',
      parentFlaggedAt: '2026-05-02T10:00:00.000Z',
    });

    const row = sessionToRow(session);
    const restored = rowToSession(row);
    expect(restored).toEqual(session);
  });

  it('JSON arrays survive serialisation round-trip', () => {
    const session = makeSession({
      photoPaths: ['/a.jpg', '/b.jpg'],
      questions: [
        makeQuestion({ id: 'q1' }),
        makeQuestion({ id: 'q2' }),
      ],
      kidInteractions: [makeInteraction({ id: 'i1' })],
    });

    const row = sessionToRow(session);
    expect(JSON.parse(row.photo_paths)).toEqual(['/a.jpg', '/b.jpg']);
    expect(JSON.parse(row.questions)).toHaveLength(2);
    expect(JSON.parse(row.kid_interactions)).toHaveLength(1);
  });

  it('optional fields round-trip as undefined when null in DB', () => {
    const session = makeSession({
      topic: undefined,
      aiSummary: undefined,
    });
    const row = sessionToRow(session);
    const restored = rowToSession(row);
    expect(restored.topic).toBeUndefined();
    expect(restored.aiSummary).toBeUndefined();
  });

  it('parentFlagged boolean round-trips through 0/1 integer', () => {
    const flagged = makeSession({ parentFlagged: true });
    const unflagged = makeSession({ parentFlagged: false });

    expect(sessionToRow(flagged).parent_flagged).toBe(1);
    expect(sessionToRow(unflagged).parent_flagged).toBe(0);
    expect(rowToSession(sessionToRow(flagged)).parentFlagged).toBe(true);
    expect(rowToSession(sessionToRow(unflagged)).parentFlagged).toBe(
      false,
    );
  });
});

// ── InMemorySessionRepository ─────────────────────────────────────

describe('InMemorySessionRepository', () => {
  describe('init', () => {
    it('marks repository as initialised', async () => {
      const repo = new InMemorySessionRepository();
      expect(repo.initialized).toBe(false);
      await repo.init();
      expect(repo.initialized).toBe(true);
    });

    it('is idempotent', async () => {
      const repo = new InMemorySessionRepository();
      await repo.init();
      await repo.init();
      expect(repo.initialized).toBe(true);
    });
  });

  describe('createSession', () => {
    it('creates a session and makes it retrievable', async () => {
      const repo = await createRepo();
      const retrieved = await createAndGet(repo, { id: 'create-001' });

      expect(retrieved.id).toBe('create-001');
      expect(retrieved.subject).toBe('math');
      expect(retrieved.level).toBe(3);
      expect(retrieved.status).toBe('active');
    });

    it('stores full question data including hints, steps, and solution', async () => {
      const repo = await createRepo();
      const retrieved = await createAndGet(repo, {
        id: 'create-q',
        questions: [
          makeQuestion({
            id: 'q1',
            ocrText: 'What is 2+2?',
            hintsGiven: ['Think of pairs'],
            stepsRevealed: ['Step 1: Count', 'Step 2: Add'],
            solutionRevealed: true,
            solution: '4',
            kidAnswer: '4',
            struggled: false,
            correct: true,
          }),
        ],
      });

      expect(retrieved.questions).toHaveLength(1);
      expect(retrieved.questions[0].ocrText).toBe('What is 2+2?');
      expect(retrieved.questions[0].hintsGiven).toEqual([
        'Think of pairs',
      ]);
      expect(retrieved.questions[0].correct).toBe(true);
    });

    it('stores kid interactions with types', async () => {
      const repo = await createRepo();
      const retrieved = await createAndGet(repo, {
        id: 'create-i',
        kidInteractions: [
          makeInteraction({
            id: 'i1',
            type: 'hint_request',
            content: 'Give me a hint',
          }),
          makeInteraction({
            id: 'i2',
            type: 'answer',
            content: '4',
          }),
        ],
      });

      expect(retrieved.kidInteractions).toHaveLength(2);
      expect(retrieved.kidInteractions[0].type).toBe('hint_request');
    });

    it('stores AI summary', async () => {
      const repo = await createRepo();
      const retrieved = await createAndGet(repo, {
        id: 'create-summary',
        aiSummary:
          'Student showed good understanding of addition.',
      });

      expect(retrieved.aiSummary).toBe(
        'Student showed good understanding of addition.',
      );
    });
  });

  describe('getSession', () => {
    it('returns null for non-existent session', async () => {
      const repo = await createRepo();
      const result = await repo.getSession('non-existent');
      expect(result).toBeNull();
    });

    it('retrieves by exact ID', async () => {
      const repo = await createRepo();
      await repo.createSession(makeSession({ id: 'get-001' }));
      await repo.createSession(makeSession({ id: 'get-002' }));

      const s1 = await repo.getSession('get-001');
      const s2 = await repo.getSession('get-002');
      expect(s1?.id).toBe('get-001');
      expect(s2?.id).toBe('get-002');
    });
  });

  describe('listSessions', () => {
    async function seedThreeSessions(
      repo: InMemorySessionRepository,
    ) {
      await repo.createSession(
        makeSession({
          id: 's1',
          kidProfileId: 'kid-list',
          subject: 'math',
          level: 3,
          status: 'completed',
          startedAt: '2026-05-01T10:00:00.000Z',
        }),
      );
      await repo.createSession(
        makeSession({
          id: 's2',
          kidProfileId: 'kid-list',
          subject: 'english',
          level: 4,
          status: 'active',
          startedAt: '2026-05-02T10:00:00.000Z',
        }),
      );
      await repo.createSession(
        makeSession({
          id: 's3',
          kidProfileId: 'kid-list',
          subject: 'science',
          level: 5,
          status: 'completed',
          startedAt: '2026-05-03T10:00:00.000Z',
        }),
      );
    }

    it('returns all sessions for a kid profile, newest first', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      const sessions = await repo.listSessions('kid-list');
      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe('s3');
      expect(sessions[1].id).toBe('s2');
      expect(sessions[2].id).toBe('s1');
    });

    it('filters by subject', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      const sessions = await repo.listSessions('kid-list', {
        subject: 'math',
      });
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
    });

    it('filters by status', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      const sessions = await repo.listSessions('kid-list', {
        status: 'active',
      });
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s2');
    });

    it('filters by level', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      const sessions = await repo.listSessions('kid-list', {
        level: 4,
      });
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s2');
    });

    it('filters by date range', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      const sessions = await repo.listSessions('kid-list', {
        fromDate: '2026-05-01T00:00:00.000Z',
        toDate: '2026-05-02T23:59:59.000Z',
      });
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toEqual(['s2', 's1']);
    });

    it('filters by multiple criteria', async () => {
      const repo = await createRepo();
      await seedThreeSessions(repo);

      await repo.createSession(
        makeSession({
          id: 's4',
          kidProfileId: 'kid-list',
          subject: 'math',
          level: 3,
          status: 'completed',
          startedAt: '2026-05-04T10:00:00.000Z',
        }),
      );

      const sessions = await repo.listSessions('kid-list', {
        subject: 'math',
        status: 'completed',
      });
      expect(sessions).toHaveLength(2);
    });

    it('returns empty array for kid profile with no sessions', async () => {
      const repo = await createRepo();
      const sessions = await repo.listSessions('no-sessions');
      expect(sessions).toEqual([]);
    });

    it('handles pagination with offset and limit', async () => {
      const repo = await createRepo();

      for (let i = 1; i <= 6; i++) {
        await repo.createSession(
          makeSession({
            id: `page-${String(i).padStart(2, '0')}`,
            kidProfileId: 'kid-page',
            startedAt: `2026-05-0${i}T10:00:00.000Z`,
          }),
        );
      }

      const page1 = await repo.listSessions('kid-page', {
        limit: 2,
        offset: 0,
      });
      expect(page1).toHaveLength(2);
      expect(page1[0].id).toBe('page-06');
      expect(page1[1].id).toBe('page-05');

      const page2 = await repo.listSessions('kid-page', {
        limit: 2,
        offset: 2,
      });
      expect(page2).toHaveLength(2);
      expect(page2[0].id).toBe('page-04');
      expect(page2[1].id).toBe('page-03');

      const page3 = await repo.listSessions('kid-page', {
        limit: 2,
        offset: 4,
      });
      expect(page3).toHaveLength(2);
      expect(page3[0].id).toBe('page-02');
      expect(page3[1].id).toBe('page-01');
    });
  });

  describe('countSessions', () => {
    it('returns total count for kid profile', async () => {
      const repo = await createRepo();
      await repo.createSession(
        makeSession({ id: 'c1', kidProfileId: 'kid-count' }),
      );
      await repo.createSession(
        makeSession({ id: 'c2', kidProfileId: 'kid-count' }),
      );
      await repo.createSession(
        makeSession({ id: 'c3', kidProfileId: 'kid-count' }),
      );

      expect(await repo.countSessions('kid-count')).toBe(3);
    });

    it('returns 0 for kid with no sessions', async () => {
      const repo = await createRepo();
      expect(await repo.countSessions('empty')).toBe(0);
    });

    it('respects filters', async () => {
      const repo = await createRepo();
      await repo.createSession(
        makeSession({
          id: 'c1',
          kidProfileId: 'kid-filt',
          subject: 'math',
          status: 'completed',
        }),
      );
      await repo.createSession(
        makeSession({
          id: 'c2',
          kidProfileId: 'kid-filt',
          subject: 'english',
          status: 'active',
        }),
      );

      expect(
        await repo.countSessions('kid-filt', { subject: 'math' }),
      ).toBe(1);
      expect(
        await repo.countSessions('kid-filt', { status: 'active' }),
      ).toBe(1);
    });
  });

  describe('updateSession', () => {
    it('updates status and timing', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'upd-001' });

      const now = new Date().toISOString();
      await repo.updateSession('upd-001', {
        status: 'completed',
        endedAt: now,
        durationSeconds: 1200,
        updatedAt: now,
      });

      const retrieved = await repo.getSession('upd-001');
      expect(retrieved?.status).toBe('completed');
      expect(retrieved?.endedAt).toBe(now);
      expect(retrieved?.durationSeconds).toBe(1200);
    });

    it('updates questions array', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'upd-q' });

      const newQuestions = [
        makeQuestion({
          id: 'q-new',
          ocrText: 'Updated question',
        }),
      ];
      const now = new Date().toISOString();
      await repo.updateSession('upd-q', {
        questions: newQuestions,
        updatedAt: now,
      });

      const retrieved = await repo.getSession('upd-q');
      expect(retrieved?.questions).toHaveLength(1);
      expect(retrieved?.questions[0].ocrText).toBe('Updated question');
    });

    it('updates AI summary', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'upd-summary' });

      const now = new Date().toISOString();
      await repo.updateSession('upd-summary', {
        aiSummary: 'Updated AI summary',
        updatedAt: now,
      });

      const retrieved = await repo.getSession('upd-summary');
      expect(retrieved?.aiSummary).toBe('Updated AI summary');
    });

    it('updates photo paths', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'upd-photos' });

      const now = new Date().toISOString();
      await repo.updateSession('upd-photos', {
        photoPaths: ['/new/photo.jpg'],
        updatedAt: now,
      });

      const retrieved = await repo.getSession('upd-photos');
      expect(retrieved?.photoPaths).toEqual(['/new/photo.jpg']);
    });
  });

  describe('flagSession', () => {
    it('marks session as flagged with status, timestamp, and note', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'flag-001' });

      await repo.flagSession(
        'flag-001',
        'Student found this too easy',
      );

      const retrieved = await repo.getSession('flag-001');
      expect(retrieved?.parentFlagged).toBe(true);
      expect(retrieved?.parentNote).toBe(
        'Student found this too easy',
      );
      expect(retrieved?.parentFlaggedAt).toBeDefined();
      expect(retrieved?.status).toBe('flagged');
      expect(retrieved?.updatedAt).toBeDefined();
    });

    it('flags without note', async () => {
      const repo = await createRepo();
      await createAndGet(repo, { id: 'flag-note' });

      await repo.flagSession('flag-note');

      const retrieved = await repo.getSession('flag-note');
      expect(retrieved?.parentFlagged).toBe(true);
      expect(retrieved?.parentNote).toBeUndefined();
    });
  });

  describe('deleteSession', () => {
    it('removes session from repository', async () => {
      const repo = await createRepo();
      await repo.createSession(makeSession({ id: 'del-001' }));
      expect(await repo.getSession('del-001')).not.toBeNull();

      await repo.deleteSession('del-001');
      expect(await repo.getSession('del-001')).toBeNull();
    });

    it('is idempotent on non-existent session', async () => {
      const repo = await createRepo();
      await expect(
        repo.deleteSession('non-existent'),
      ).resolves.not.toThrow();
    });
  });

  describe('close', () => {
    it('clears all data and resets initialised flag', async () => {
      const repo = await createRepo();
      await repo.createSession(makeSession({ id: 'close-001' }));

      await repo.close();
      expect(repo.initialized).toBe(false);
      expect(repo.size).toBe(0);
    });
  });
});

// ── Subject and level domain constraints ──────────────────────────

describe('subject and level domains', () => {
  it('supports all four subjects', () => {
    const subjects: Subject[] = [
      'english',
      'math',
      'science',
      'chinese_mt',
    ];
    for (const s of subjects) {
      const session = makeSession({ subject: s });
      expect(session.subject).toBe(s);
    }
  });

  it('supports all six primary levels', () => {
    for (let level = 1; level <= 6; level++) {
      const session = makeSession({
        level: level as 1 | 2 | 3 | 4 | 5 | 6,
      });
      expect(session.level).toBe(level);
    }
  });
});
