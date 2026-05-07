import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { GradeLevel, KidProfile, Subject } from '../types'
interface R { id: string; parent_account_id: string; name: string; grade: string; subjects: string; created_at: string; updated_at: string }
const t = (r: R): KidProfile => ({ id: r.id, parentAccountId: r.parent_account_id, name: r.name, grade: r.grade as GradeLevel, subjects: JSON.parse(r.subjects) as Subject[], createdAt: r.created_at, updatedAt: r.updated_at })
export class KidProfileRepository {
  constructor(private db: SQLiteDatabase) {}
  async create(pid: string, name: string, g: GradeLevel, s: Subject[]): Promise<KidProfile> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO kid_profile(id,parent_account_id,name,grade,subjects,created_at,updated_at)VALUES(?,?,?,?,?,?,?)', id, pid, name, g, JSON.stringify(s), n, n); return this.getById(id) as Promise<KidProfile> }
  async getById(id: string): Promise<KidProfile | null> { const r = await this.db.getAllAsync<R>('SELECT * FROM kid_profile WHERE id = ?', id); return r.length ? t(r[0]!) : null }
  async getAllForParent(pid: string): Promise<KidProfile[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM kid_profile WHERE parent_account_id = ? ORDER BY created_at ASC', pid); return r.map(t) }
  async updateGrade(id: string, g: GradeLevel): Promise<void> { const n = new Date().toISOString(); await this.db.runAsync('UPDATE kid_profile SET grade = ?, updated_at = ? WHERE id = ?', g, n, id) }
  async updateSubjects(id: string, s: Subject[]): Promise<void> { const n = new Date().toISOString(); await this.db.runAsync('UPDATE kid_profile SET subjects = ?, updated_at = ? WHERE id = ?', JSON.stringify(s), n, id) }
  async delete(id: string): Promise<void> { await this.db.runAsync('DELETE FROM kid_profile WHERE id = ?', id) }
}
