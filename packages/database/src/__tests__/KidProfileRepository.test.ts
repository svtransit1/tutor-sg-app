import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ParentAccountRepository, KidProfileRepository } from '../repositories'
let db:SQLiteDatabase; let kr:KidProfileRepository; let pid:string
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); const pr=new ParentAccountRepository(db); kr=new KidProfileRepository(db); pid=(await pr.create('p@t.com','email','a1')).id })
afterEach(async () => { await db.closeAsync() })
describe('KidProfile',()=>{
  it('CR',async()=>{const k=await kr.create(pid,'Alice','P3',['math','english']);expect(k.name).toBe('Alice');expect(k.grade).toBe('P3');expect(k.subjects).toEqual(['math','english'])})
  it('allForParent',async()=>{await kr.create(pid,'A','P3',['math']);await kr.create(pid,'B','P5',['science']);expect((await kr.getAllForParent(pid))).toHaveLength(2)})
  it('updateGrade',async()=>{const k=await kr.create(pid,'C','P1',['english']);await kr.updateGrade(k.id,'P2');expect((await kr.getById(k.id))!.grade).toBe('P2')})
  it('updateSubjects',async()=>{const k=await kr.create(pid,'D','P4',['math']);await kr.updateSubjects(k.id,['math','science']);expect((await kr.getById(k.id))!.subjects).toEqual(['math','science'])})
  it('delete',async()=>{const k=await kr.create(pid,'E','P6',['science']);await kr.delete(k.id);expect(await kr.getById(k.id)).toBeNull()})
})
