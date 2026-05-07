import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { UsageCounter } from '../types'
interface R { id: string; kid_profile_id: string; date: string; photo_count: number; question_count: number }
const t = (r: R): UsageCounter => ({ id: r.id, kidProfileId: r.kid_profile_id, date: r.date, photoCount: r.photo_count, questionCount: r.question_count })
export class UsageCounterRepository {
  constructor(private db: SQLiteDatabase) {}
  async getOrCreate(kidId: string, d: string): Promise<UsageCounter> { const e = await this.get(kidId, d); if (e) return e; const id = uuid(); await this.db.runAsync('INSERT INTO usage_counter(id,kid_profile_id,date,photo_count,question_count)VALUES(?,?,?,0,0)', id, kidId, d); return this.get(kidId, d) as Promise<UsageCounter> }
  async get(kidId: string, d: string): Promise<UsageCounter|null> { const r = await this.db.getAllAsync<R>('SELECT * FROM usage_counter WHERE kid_profile_id = ? AND date = ?', kidId, d); return r.length ? t(r[0]!) : null }
  async incrementPhoto(kidId: string, d: string): Promise<void> { await this.getOrCreate(kidId, d); await this.db.runAsync('UPDATE usage_counter SET photo_count = photo_count + 1 WHERE kid_profile_id = ? AND date = ?', kidId, d) }
  async incrementQuestion(kidId: string, d: string): Promise<void> { await this.getOrCreate(kidId, d); await this.db.runAsync('UPDATE usage_counter SET question_count = question_count + 1 WHERE kid_profile_id = ? AND date = ?', kidId, d) }
  async getUsage(kidId: string, d: string): Promise<{photoCount:number;questionCount:number}> { const c = await this.get(kidId, d); return {photoCount:c?.photoCount??0,questionCount:c?.questionCount??0} }
}
