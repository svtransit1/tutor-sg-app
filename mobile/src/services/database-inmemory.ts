/**
 * In-memory session repository — for tests and dev where SQLite native module is unavailable.
 *
 * Mirrors the SQLiteSessionRepository API but stores data in a Map.
 * Useful for unit tests that verify CRUD logic without a native database.
 */

import type {
  HomeworkSession,
  SessionRow,
} from '@tutor-sg/shared';
import {
  rowToSession,
  sessionToRow,
} from './database';
import type {
  SessionRepository,
  SessionListOptions,
  SessionUpdateFields,
} from './database';

export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, SessionRow> = new Map();
  private _initialized = false;

  async init(): Promise<void> {
    this._initialized = true;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  async createSession(session: HomeworkSession): Promise<void> {
    const row = sessionToRow(session);
    this.sessions.set(row.id, { ...row });
  }

  async getSession(id: string): Promise<HomeworkSession | null> {
    const row = this.sessions.get(id);
    if (!row) return null;
    return rowToSession(row);
  }

  async listSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<HomeworkSession[]> {
    let rows = Array.from(this.sessions.values())
      .filter((r) => r.kid_profile_id === kidProfileId);

    if (options?.subject) {
      rows = rows.filter((r) => r.subject === options.subject);
    }
    if (options?.status) {
      rows = rows.filter((r) => r.status === options.status);
    }
    if (options?.level) {
      rows = rows.filter((r) => r.level === options.level);
    }
    if (options?.fromDate) {
      rows = rows.filter((r) => r.started_at >= options.fromDate!);
    }
    if (options?.toDate) {
      rows = rows.filter((r) => r.started_at <= options.toDate!);
    }

    // Newest first
    rows.sort((a, b) => b.started_at.localeCompare(a.started_at));

    // Pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? rows.length;
    rows = rows.slice(offset, offset + limit);

    return rows.map(rowToSession);
  }

  async countSessions(
    kidProfileId: string,
    options?: SessionListOptions,
  ): Promise<number> {
    const sessions = await this.listSessions(kidProfileId, options);
    return sessions.length;
  }

  async updateSession(
    id: string,
    updates: Partial<SessionUpdateFields>,
  ): Promise<void> {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error(`Session not found: ${id}`);
    }

    if (updates.status !== undefined) existing.status = updates.status;
    if (updates.endedAt !== undefined) existing.ended_at = updates.endedAt;
    if (updates.durationSeconds !== undefined) existing.duration_seconds = updates.durationSeconds;
    if (updates.questions !== undefined) existing.questions = JSON.stringify(updates.questions);
    if (updates.kidInteractions !== undefined) existing.kid_interactions = JSON.stringify(updates.kidInteractions);
    if (updates.aiSummary !== undefined) existing.ai_summary = updates.aiSummary;
    if (updates.photoPaths !== undefined) existing.photo_paths = JSON.stringify(updates.photoPaths);
    if (updates.updatedAt !== undefined) existing.updated_at = updates.updatedAt;

    this.sessions.set(id, existing);
  }

  async flagSession(id: string, note?: string): Promise<void> {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error(`Session not found: ${id}`);
    }

    const now = new Date().toISOString();
    existing.parent_flagged = 1;
    existing.parent_note = note ?? null;
    existing.parent_flagged_at = now;
    existing.status = 'flagged';
    existing.updated_at = now;

    this.sessions.set(id, existing);
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async close(): Promise<void> {
    this.sessions.clear();
    this._initialized = false;
  }

  /** Test helper: get raw count of stored sessions. */
  get size(): number {
    return this.sessions.size;
  }
}
