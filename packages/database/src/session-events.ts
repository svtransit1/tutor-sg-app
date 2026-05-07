import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { SessionEvent, SessionEventType } from './types';

export function addSessionEvent(
  db: DatabaseExecutor,
  params: {
    sessionLogId: string;
    eventType: SessionEventType;
    payload?: Record<string, unknown>;
  },
): SessionEvent {
  const now = new Date().toISOString();
  const id = uuid();
  const payloadJson = JSON.stringify(params.payload ?? {});
  db.run(
    `INSERT INTO session_event (id, session_log_id, event_type, timestamp, payload)
     VALUES (?, ?, ?, ?, ?)`,
    [id, params.sessionLogId, params.eventType, now, payloadJson],
  );
  return getSessionEvent(db, id)!;
}

export function getSessionEvent(
  db: DatabaseExecutor,
  id: string,
): SessionEvent | null {
  const row = db.getFirst<{
    id: string;
    session_log_id: string;
    event_type: string;
    timestamp: string;
    payload: string;
  }>('SELECT * FROM session_event WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    sessionLogId: row.session_log_id,
    eventType: row.event_type as SessionEventType,
    timestamp: row.timestamp,
    payload: row.payload,
  };
}

export function listSessionEvents(
  db: DatabaseExecutor,
  sessionLogId: string,
  limit = 200,
  offset = 0,
): SessionEvent[] {
  const rows = db.getAll<{
    id: string;
    session_log_id: string;
    event_type: string;
    timestamp: string;
    payload: string;
  }>(
    'SELECT * FROM session_event WHERE session_log_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?',
    [sessionLogId, limit, offset],
  );

  return rows.map((row) => ({
    id: row.id,
    sessionLogId: row.session_log_id,
    eventType: row.event_type as SessionEventType,
    timestamp: row.timestamp,
    payload: row.payload,
  }));
}

export function countSessionEvents(
  db: DatabaseExecutor,
  sessionLogId: string,
): number {
  const row = db.getFirst<{ cnt: number }>(
    'SELECT COUNT(*) AS cnt FROM session_event WHERE session_log_id = ?',
    [sessionLogId],
  );
  return row?.cnt ?? 0;
}
