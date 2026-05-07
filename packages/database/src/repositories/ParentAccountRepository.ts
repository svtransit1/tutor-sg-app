import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { AuthProvider, ParentAccount } from '../types'
interface R { id: string; email: string; auth_provider: string; auth_provider_id: string; created_at: string; updated_at: string }
const t = (r: R): ParentAccount => ({ id: r.id, email: r.email, authProvider: r.auth_provider as AuthProvider, authProviderId: r.auth_provider_id, createdAt: r.created_at, updatedAt: r.updated_at })
export class ParentAccountRepository {
  constructor(private db: SQLiteDatabase) {}
  async create(email: string, ap: AuthProvider, api: string): Promise<ParentAccount> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO parent_account(id,email,auth_provider,auth_provider_id,created_at,updated_at)VALUES(?,?,?,?,?,?)', id, email, ap, api, n, n); return this.getById(id) as Promise<ParentAccount> }
  async getById(id: string): Promise<ParentAccount | null> { const r = await this.db.getAllAsync<R>('SELECT * FROM parent_account WHERE id = ?', id); return r.length ? t(r[0]!) : null }
  async getByEmail(e: string): Promise<ParentAccount | null> { const r = await this.db.getAllAsync<R>('SELECT * FROM parent_account WHERE email = ?', e); return r.length ? t(r[0]!) : null }
  async updateEmail(id: string, e: string): Promise<void> { const n = new Date().toISOString(); await this.db.runAsync('UPDATE parent_account SET email = ?, updated_at = ? WHERE id = ?', e, n, id) }
  async delete(id: string): Promise<void> { await this.db.runAsync('DELETE FROM parent_account WHERE id = ?', id) }
}
