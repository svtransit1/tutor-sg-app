import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { SessionLog, DeviceTier, Subject } from './types';

export function createSession(
  db: DatabaseExecutor,
  params: {
    kidProfileId: string;
    subject?: Subject;
    topic?: string;
    deviceTier?: DeviceTier;
  },
): SessionLog {
  const now = new Date().toISOString();
  const id = uuid();
  const tier = params.deviceTier ?? 'high';
  db.run(
    `INSERT INTO session_log (id, kid_profile_id, subject, topic, device_tier, started_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, params.kidProfileId, params.subject ?? null, params.topic ?? null, tier, now],
  );
  return getSession(db, id)!;
}

export function getSession(
  db: DatabaseExecutor,
  id: string,
): SessionLog | null {
  const row = db.getFirst<{
    id: string;
    kid_profile_id: string;
    subject: string | null;
    topic: string | null;
    device_tier: string;
    started_at: string;
    ended_at: string | null;
  }>('SELECT * FROM session_log WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    kidProfileId: row.kid_profile_id,
    subject: row.subject as Subject | null,
    topic: row.topic,
    deviceTier: row.device_tier as DeviceTier,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export function endSession(
  db: DatabaseExecutor,
  id: string,
): SessionLog | null {
  const now = new Date().toISOString();
  db.run('UPDATE session_log SET ended_at = ? WHERE id = ?', [now, id]);
  return getSession(db, id);
}

export function listSessionsByKidProfile(
  db: DatabaseExecutor,
  kidProfileId: string,
  limit = 50,
  offset = 0,
): SessionLog[] {
  const rows = db.getAll<{
    id: string;
    kid_profile_id: string;
    subject: string | null;
    topic: string | null;
    device_tier: string;
    started_at: string;
    ended_at: string | null;
  }>(
    'SELECT * FROM session_log WHERE kid_profile_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?',
    [kidProfileId, limit, offset],
  );

  return rows.map((row) => ({
    id: row.id,
    kidProfileId: row.kid_profile_id,
    subject: row.subject as Subject | null,
    topic: row.topic,
    deviceTier: row.device_tier as DeviceTier,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }));
}
