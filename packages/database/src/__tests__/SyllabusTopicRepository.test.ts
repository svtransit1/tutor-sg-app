import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { SyllabusTopicRepository } from '../repositories'
let db:SQLiteDatabase; let r:SyllabusTopicRepository
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); r=new SyllabusTopicRepository(db) })
afterEach(async () => { await db.closeAsync() })
const n=(s:any,l:any,i:string,e:string,z:string)=>({subject:s,level:l,topicId:i,parentTopicId:null,nameEn:e,nameZh:z,sequence:1})
describe('Syllabus',()=>{
  it('upsert',async()=>{const a=await r.upsert(n('math','P3','t1','Add','加'));expect(a.nameEn).toBe('Add');expect(a.nameZh).toBe('加')})
  it('bySubjectLevel',async()=>{await r.upsert(n('math','P3','t1','A','加'));await r.upsert(n('math','P3','t2','S','减'));await r.upsert(n('english','P3','t3','G','语法'));expect((await r.getBySubjectAndLevel('math','P3'))).toHaveLength(2)})
  it('roots',async()=>{await r.upsert(n('math','P4','r1','R1','根1'));await r.upsert({...n('math','P4','c1','C1','子1'),parentTopicId:'r1'});expect((await r.getRootNodes('math','P4'))).toHaveLength(1)})
  it('children',async()=>{await r.upsert(n('math','P5','p1','P','父'));await r.upsert({...n('math','P5','c1','CA','子A'),parentTopicId:'p1'});await r.upsert({...n('math','P5','c2','CB','子B'),parentTopicId:'p1'});expect((await r.getChildren('p1'))).toHaveLength(2)})
  it('delete',async()=>{await r.upsert(n('science','P3','s1','Sci','科学'));await r.deleteBySubjectAndLevel('science','P3');expect((await r.getBySubjectAndLevel('science','P3'))).toHaveLength(0)})
})
