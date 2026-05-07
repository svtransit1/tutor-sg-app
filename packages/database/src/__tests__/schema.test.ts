import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, getCurrentVersion, resetDatabase } from '../migrations'
import { CURRENT_SCHEMA_VERSION } from '../schema'
let db: SQLiteDatabase
beforeEach(async () => { await resetDatabase(); db = await openDatabaseAsync(':memory:') })
afterEach(async () => { await db.closeAsync() })
async function t(name: string): Promise<boolean> { const r = await db.getFirstAsync<{c:number}>("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name=?", name); return (r?.c ?? 0) > 0 }
async function ix(name: string): Promise<boolean> { const r = await db.getFirstAsync<{c:number}>("SELECT COUNT(*) as c FROM sqlite_master WHERE type='index' AND name=?", name); return (r?.c ?? 0) > 0 }
describe('schema', () => {
  it('creates all 8 tables', async () => { await runMigrations(db,1); expect(await t('parent_account')).toBe(true); expect(await t('kid_profile')).toBe(true); expect(await t('session_log')).toBe(true); expect(await t('session_event')).toBe(true); expect(await t('question_attempt')).toBe(true); expect(await t('syllabus_topic_tree')).toBe(true); expect(await t('model_metadata')).toBe(true); expect(await t('usage_counter')).toBe(true) })
  it('creates 7 indexes', async () => { await runMigrations(db,1); for (const i of ['idx_session_log_kid','idx_session_log_started','idx_session_event_log','idx_question_attempt_log','idx_syllabus_subject_level','idx_syllabus_parent','idx_usage_kid_date']) expect(await ix(i)).toBe(true) })
  it('records version', async () => { await runMigrations(db,1); expect(await getCurrentVersion(db)).toBe(1) })
  it('idempotent', async () => { await runMigrations(db,1); await runMigrations(db,1); expect(await getCurrentVersion(db)).toBe(1) })
  it('CURRENT_SCHEMA_VERSION=1', () => expect(CURRENT_SCHEMA_VERSION).toBe(1) )
  it('enforces auth_provider CHECK', async () => { await runMigrations(db,1); await expect(db.runAsync("INSERT INTO parent_account(id,email,auth_provider,auth_provider_id,created_at,updated_at)VALUES('p1','t@t.com','x','p1','2024-01-01','2024-01-01')")).rejects.toThrow() })
  it('enforces grade CHECK', async () => { await runMigrations(db,1); await expect(db.runAsync("INSERT INTO kid_profile(id,parent_account_id,name,grade,subjects,created_at,updated_at)VALUES('k1','p1','T','P7','[]','2024-01-01','2024-01-01')")).rejects.toThrow() })
})
