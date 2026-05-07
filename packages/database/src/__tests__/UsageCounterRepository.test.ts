import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ParentAccountRepository, KidProfileRepository, UsageCounterRepository } from '../repositories'
let db:SQLiteDatabase; let r:UsageCounterRepository; let kid:string
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); const pp=new ParentAccountRepository(db); const kp=new KidProfileRepository(db); kid=(await kp.create((await pp.create('p@t.com','email','a1')).id,'TK','P4',['math'])).id; r=new UsageCounterRepository(db) })
afterEach(async () => { await db.closeAsync() })
describe('UsageCounter',()=>{
  it('createOnAccess',async()=>{const c=await r.getOrCreate(kid,'2024-06-01');expect(c.photoCount).toBe(0);expect(c.questionCount).toBe(0)})
  it('incrementPhoto',async()=>{await r.incrementPhoto(kid,'2024-06-01');await r.incrementPhoto(kid,'2024-06-01');expect((await r.getUsage(kid,'2024-06-01')).photoCount).toBe(2)})
  it('incrementQuestion',async()=>{await r.incrementQuestion(kid,'2024-06-01');expect((await r.getUsage(kid,'2024-06-01')).questionCount).toBe(1)})
  it('separateDates',async()=>{await r.incrementPhoto(kid,'2024-06-01');await r.incrementPhoto(kid,'2024-06-01');await r.incrementPhoto(kid,'2024-06-02');expect((await r.getUsage(kid,'2024-06-01')).photoCount).toBe(2);expect((await r.getUsage(kid,'2024-06-02')).photoCount).toBe(1)})
})
