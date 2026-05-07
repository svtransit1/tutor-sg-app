import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ParentAccountRepository } from '../repositories'
let db:SQLiteDatabase; let r:ParentAccountRepository
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); r=new ParentAccountRepository(db) })
afterEach(async () => { await db.closeAsync() })
describe('Parent',()=>{
  it('CR',async()=>{const a=await r.create('p@t.com','email','a1');expect(a.email).toBe('p@t.com');expect(a.authProvider).toBe('email')})
  it('findByEmail',async()=>{await r.create('f@t.com','google','g1');const f=await r.getByEmail('f@t.com');expect(f).not.toBeNull();expect(f!.email).toBe('f@t.com')})
  it('nullMissing',async()=>{expect(await r.getByEmail('x@t.com')).toBeNull()})
  it('updateEmail',async()=>{const a=await r.create('o@t.com','email','a1');await r.updateEmail(a.id,'n@t.com');expect((await r.getById(a.id))!.email).toBe('n@t.com')})
  it('delete',async()=>{const a=await r.create('d@t.com','apple','a1');await r.delete(a.id);expect(await r.getById(a.id)).toBeNull()})
})
