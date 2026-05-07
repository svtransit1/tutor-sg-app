import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ParentAccountRepository, KidProfileRepository, SessionRepository } from '../repositories'
let db:SQLiteDatabase; let r:SessionRepository; let kid:string
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); const pp=new ParentAccountRepository(db); const kp=new KidProfileRepository(db); kid=(await kp.create((await pp.create('p@t.com','email','a1')).id,'TK','P4',['math'])).id; r=new SessionRepository(db) })
afterEach(async () => { await db.closeAsync() })
describe('Session',()=>{
  it('create',async()=>{const s=await r.create(kid,'high','math');expect(s.subject).toBe('math');expect(s.deviceTier).toBe('high');expect(s.endedAt).toBeNull()})
  it('close',async()=>{const s=await r.create(kid,'low');await r.close(s.id);expect((await r.getById(s.id))!.endedAt).not.toBeNull()})
  it('events',async()=>{const s=await r.create(kid,'high','science');const e=await r.addEvent(s.id,'photo_captured',{u:'f.jpg'});expect(e.eventType).toBe('photo_captured');expect(JSON.parse(e.payload)).toEqual({u:'f.jpg'});const evts=await r.getEvents(s.id);expect(evts.length).toBe(1)})
  it('recent',async()=>{await r.create(kid,'high','math');await r.create(kid,'high','english');const recent=await r.getRecent(kid,2);expect(recent.length).toBe(2)})
  it('byDate',async()=>{const s=await r.create(kid,'high','math');const d=s.startedAt.slice(0,10);const byDate=await r.getByDate(kid,d);expect(byDate.length).toBeGreaterThanOrEqual(1)})
  it('count',async()=>{await r.create(kid,'high','math');await r.create(kid,'low','english');expect(await r.getSessionCount(kid)).toBe(2)})
})
