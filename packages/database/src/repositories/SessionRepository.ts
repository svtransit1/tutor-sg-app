import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { DeviceTier, SessionEvent, SessionEventType, SessionLog, Subject } from '../types'
interface SR { id: string; kid_profile_id: string; subject: string | null; topic: string | null; device_tier: string; started_at: string; ended_at: string | null }
interface ER { id: string; session_log_id: string; event_type: string; timestamp: string; payload: string }
const ts = (r: SR): SessionLog => ({ id: r.id, kidProfileId: r.kid_profile_id, subject: r.subject as Subject|null, topic: r.topic, deviceTier: r.device_tier as DeviceTier, startedAt: r.started_at, endedAt: r.ended_at })
const te = (r: ER): SessionEvent => ({ id: r.id, sessionLogId: r.session_log_id, eventType: r.event_type as SessionEventType, timestamp: r.timestamp, payload: r.payload })
export class SessionRepository {
  constructor(private db: SQLiteDatabase) {}
  async create(kidId: string, dt: DeviceTier, subj?: Subject, topic?: string): Promise<SessionLog> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO session_log(id,kid_profile_id,subject,topic,device_tier,started_at)VALUES(?,?,?,?,?,?)', id, kidId, subj??null, topic??null, dt, n); return this.getById(id) as Promise<SessionLog> }
  async getById(id: string): Promise<SessionLog|null> { const r = await this.db.getAllAsync<SR>('SELECT * FROM session_log WHERE id = ?', id); return r.length ? ts(r[0]!) : null }
  async close(id: string): Promise<void> { await this.db.runAsync('UPDATE session_log SET ended_at = ? WHERE id = ?', new Date().toISOString(), id) }
  async getByKidProfile(kidId: string, lim=20, off=0): Promise<SessionLog[]> { const r = await this.db.getAllAsync<SR>('SELECT * FROM session_log WHERE kid_profile_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?', kidId, lim, off); return r.map(ts) }
  async getRecent(kidId: string, lim=3): Promise<SessionLog[]> { return this.getByKidProfile(kidId, lim, 0) }
  async getByDate(kidId: string, d: string): Promise<SessionLog[]> { const r = await this.db.getAllAsync<SR>("SELECT * FROM session_log WHERE kid_profile_id = ? AND date(started_at)=? ORDER BY started_at DESC", kidId, d); return r.map(ts) }
  async addEvent(sid: string, et: SessionEventType, payload: unknown): Promise<SessionEvent> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO session_event(id,session_log_id,event_type,timestamp,payload)VALUES(?,?,?,?,?)', id, sid, et, n, JSON.stringify(payload)); const r = await this.db.getAllAsync<ER>('SELECT * FROM session_event WHERE id = ?', id); return te(r[0]!) }
  async getEvents(sid: string): Promise<SessionEvent[]> { const r = await this.db.getAllAsync<ER>('SELECT * FROM session_event WHERE session_log_id = ? ORDER BY timestamp ASC', sid); return r.map(te) }
  async getSessionCount(kidId: string): Promise<number> { const r = await this.db.getFirstAsync<{count:number}>('SELECT COUNT(*) as count FROM session_log WHERE kid_profile_id = ?', kidId); return r?.count ?? 0 }
}
