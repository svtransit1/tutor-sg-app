import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { runMigrations, resetDatabase } from '../migrations'
import { ModelMetadataRepository } from '../repositories'
let db:SQLiteDatabase; let r:ModelMetadataRepository
beforeEach(async () => { await resetDatabase(); db=await openDatabaseAsync(':memory:'); await runMigrations(db,1); r=new ModelMetadataRepository(db) })
afterEach(async () => { await db.closeAsync() })
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms))
describe('ModelMetadata',()=>{
  it('CR',async()=>{const m=await r.create({modelName:'gemma',version:'1.0',quant:'int4',filePath:'/m.bin',hash:'abc',sizeBytes:700_000_000});expect(m.modelName).toBe('gemma');expect(m.sizeBytes).toBe(700_000_000)})
  it('latestByName',async()=>{await r.create({modelName:'qwen',version:'1.0',quant:'int4',filePath:'/v1',hash:'h1',sizeBytes:1e9});await delay(5);await r.create({modelName:'qwen',version:'1.1',quant:'int4',filePath:'/v2',hash:'h2',sizeBytes:1e9});expect((await r.getByModelName('qwen'))!.version).toBe('1.1')})
  it('all',async()=>{await r.create({modelName:'a',version:'1',quant:'i',filePath:'/a',hash:'a',sizeBytes:100});await r.create({modelName:'b',version:'1',quant:'i',filePath:'/b',hash:'b',sizeBytes:200});expect((await r.getAll())).toHaveLength(2)})
  it('delete',async()=>{const m=await r.create({modelName:'t',version:'1',quant:'i',filePath:'/t',hash:'t',sizeBytes:50});await r.delete(m.id);expect(await r.getById(m.id)).toBeNull()})
})
