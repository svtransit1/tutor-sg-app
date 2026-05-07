import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ParentAccountRepository, KidProfileRepository, SessionRepository, QuestionAttemptRepository } from '../repositories'
let db:SQLiteDatabase; let r:QuestionAttemptRepository; let sid:string
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); const pp=new ParentAccountRepository(db); const kp=new KidProfileRepository(db); const sp=new SessionRepository(db); sid=(await sp.create((await kp.create((await pp.create('p@t.com','email','a1')).id,'TK','P4',['math'])).id,'high','math')).id; r=new QuestionAttemptRepository(db) })
afterEach(async () => { await db.closeAsync() })
describe('QuestionAttempt',()=>{
  it('CR',async()=>{const a=await r.create({sessionLogId:sid,questionText:'2+2?',subject:'math',topic:'add'});expect(a.correct).toBeNull();expect(a.hintsUsed).toBe(0)})
  it('markCorrect',async()=>{const a=await r.create({sessionLogId:sid,questionText:'3+5',subject:'math',topic:'add',answer:'8'});await r.markCorrect(a.id);expect((await r.getById(a.id))!.correct).toBe(true);await r.markIncorrect(a.id);expect((await r.getById(a.id))!.correct).toBe(false)})
  it('hints',async()=>{const a=await r.create({sessionLogId:sid,questionText:'10-4',subject:'math',topic:'sub'});await r.incrementHints(a.id);await r.incrementHints(a.id);expect((await r.getById(a.id))!.hintsUsed).toBe(2)})
  it('bySession',async()=>{await r.create({sessionLogId:sid,questionText:'Q1',subject:'math',topic:'a'});await r.create({sessionLogId:sid,questionText:'Q2',subject:'math',topic:'b'});expect((await r.getBySession(sid))).toHaveLength(2)})
  it('updateAnswer',async()=>{const a=await r.create({sessionLogId:sid,questionText:'Q',subject:'math',topic:'g'});await r.updateAnswer(a.id,'42');expect((await r.getById(a.id))!.answer).toBe('42')})
})
