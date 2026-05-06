/**
 * SQLite session repository — production implementation.
 *
 * Wraps expo-sqlite for on-device persistence.
 * All session data stays on-device per ADD §4.2 privacy guarantee.
 *
 * Usage:
 * ```ts
 * import { openDatabaseAsync } from 'expo-sqlite';
 * import { SQLiteSessionRepository } from './database-sqlite';
 *
 * const db = await openDatabaseAsync('tutor-sg.db');
 * const repo = new SQLiteSessionRepository(db);
 * await repo.init();
 * ```
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type {
  HomeworkSession,
  SessionRow,
} from '@tutor-sg/shared';
import {
  SCHEMA_SQL,
  rowToSession,
  sessionToRow,
} from './database';
import type {
  SessionRepository,
  SessionListOptions,
  SessionUpdateFields,
} from './database';

export class SQLiteSessionRepository implements SessionRepository {
  private db: SQLiteDatabase;
  private _initialized = false;

  constructor(database: SQLiteDatabase) {
    this.db = database;
  }

  async init(): Promise<void> {
    if (this._initialized) return;
    await this.db.execAsync(SCHEMA_SQL);
    this._initialized = true;
  }

  async createSession(session: HomeworkSession): Promise<void> {
    const row = sessionToRow(session);
    await this.db.runAsync(
      `INSERT INTO sessions (
        id, kid_profile_id, subject, topic, level, status,
        started_at, ended_at, duration_seconds,
        photo_paths, questions, kid_interactions,
        ai_summary, parent_flagged, parent_note, parent_flagged_at,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )`,
      [
        row.id,
        row.kid_profile_id,
        row.subject,
        row.topic,
        row.level,
        row.status,
        row.started_at,
        row.ended_at,
        row.duration_seconds,
        row.photo_paths,
        row.questions,
        row.kid_interactions,
        row.ai_summary,
        row.parent_flagged,
        row.parent_note,
        row.parent_flagged_at,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  async getSession(id: string): Promise<HomeworkSession | null> {
    const row = await this.db.getFirstAsync<SessionRow>(
      'SELECT * FROM sessions WHERE id = ?',
      id,
    );
    if (!row) return null;
    return rowToSession(row);
  }

  async listSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<HomeworkSession[]> {
    const { where, params } = buildWhereClause(kidProfileId, options);
    const orderClause = 'ORDER BY started_at DESC';
    const pagination = buildPagination(options);

    const rows = await this.db.getAllAsync<SessionRow>(
      `SELECT * FROM sessions ${where} ${orderClause} ${pagination}`,
      ...params,
    );
    return rows.map(rowToSession);
  }

  async countSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<number> {
    const { where, params } = buildWhereClause(kidProfileId, options);
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sessions ${where}`,
      ...params,
    );
    return result?.count ?? 0;
  }

  async updateSession(
    id: string,
    updates: Partial<SessionUpdateFields>,
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: (string | number | null | boolean)[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      params.push(updates.status);
    }
    if (updates.endedAt !== undefined) {
      setClauses.push('ended_at = ?');
      params.push(updates.endedAt);
    }
    if (updates.durationSeconds !== undefined) {
      setClauses.push('duration_seconds = ?');
      params.push(updates.durationSeconds);
    }
    if (updates.questions !== undefined) {
      setClauses.push('questions = ?');
      params.push(JSON.stringify(updates.questions));
    }
    if (updates.kidInteractions !== undefined) {
      setClauses.push('kid_interactions = ?');
      params.push(JSON.stringify(updates.kidInteractions));
    }
    if (updates.aiSummary !== undefined) {
      setClauses.push('ai_summary = ?');
      params.push(updates.aiSummary);
    }
    if (updates.photoPaths !== undefined) {
      setClauses.push('photo_paths = ?');
      params.push(JSON.stringify(updates.photoPaths));
    }
    if (updates.updatedAt !== undefined) {
      setClauses.push('updated_at = ?');
      params.push(updates.updatedAt);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    await this.db.runAsync(
      `UPDATE sessions SET ${setClauses.join(', ')} WHERE id = ?`,
      ...params,
    );
  }

  async flagSession(id: string, note?: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE sessions SET
        parent_flagged = 1,
        parent_note = ?,
        parent_flagged_at = ?,
        status = 'flagged',
        updated_at = ?
      WHERE id = ?`,
      note ?? null, now, now, id,
    );
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM sessions WHERE id = ?', id);
  }

  async close(): Promise<void> {
    await this.db.closeAsync();
  }
}

// ── Query builder helpers ─────────────────────────────────────────

function buildWhereClause(
  kidProfileId: string,
  options?: SessionListOptions,
): { where: string; params: (string | number | null | boolean)[] } {
  const conditions: string[] = ['kid_profile_id = ?'];
  const params: (string | number | null | boolean)[] = [kidProfileId];

  if (options?.subject) {
    conditions.push('subject = ?');
    params.push(options.subject);
  }
  if (options?.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }
  if (options?.level) {
    conditions.push('level = ?');
    params.push(options.level);
  }
  if (options?.fromDate) {
    conditions.push('started_at >= ?');
    params.push(options.fromDate);
  }
  if (options?.toDate) {
    conditions.push('started_at <= ?');
    params.push(options.toDate);
  }

  return { where: `WHERE ${conditions.join(' AND ')}`, params };
}

function buildPagination(options?: SessionListOptions): string {
  const parts: string[] = [];
  if (options?.limit !== undefined) {
    parts.push(`LIMIT ${options.limit}`);
  }
  if (options?.offset !== undefined) {
    parts.push(`OFFSET ${options.offset}`);
  }
  return parts.join(' ');
}
