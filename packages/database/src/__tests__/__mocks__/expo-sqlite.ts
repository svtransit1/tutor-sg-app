import initSqlJs from 'sql.js'
const m = new Map<string,any>(); let r: Promise<any>|null = null
async function g(n: string) { let d = m.get(n); if (!d) { if (!r) r = initSqlJs(); const S = await r; d = new S.Database(); m.set(n, d) }; return d }
export async function openDatabaseAsync(n: string) {
  const d = await g(n)
  return {
    execAsync: async (s: string) => { d.run(s) },
    runAsync: async (s: string, ...p: unknown[]) => { try { d.run(s, p); return { lastInsertRowId: (d.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0]??0) as number, changes: d.getRowsModified() } } catch(e) { return Promise.reject(e) } },
    getAllAsync: async <T>(s: string, ...p: unknown[]) => { const t = d.prepare(s); if (p.length > 0) t.bind(p); const rows: T[] = []; while (t.step()) rows.push(t.getAsObject() as T); t.free(); return rows },
    getFirstAsync: async <T>(s: string, ...p: unknown[]) => { const t = d.prepare(s); if (p.length > 0) t.bind(p); let row: T|null = null; if (t.step()) row = t.getAsObject() as T; t.free(); return row },
    closeAsync: async () => { d.close(); m.delete(n) },
    closeSync: () => { d.close(); m.delete(n) },
  }
}
export function openDatabaseSync(): never { throw new Error('n/a') }
export function deleteDatabaseAsync(n: string) { const d = m.get(n); if (d) { d.close(); m.delete(n) }; return Promise.resolve() }
