import { v4 as uuid } from 'uuid'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { ModelMetadata } from '../types'
interface R { id: string; model_name: string; version: string; quant: string; file_path: string; hash: string; downloaded_at: string; size_bytes: number }
const t = (r: R): ModelMetadata => ({ id: r.id, modelName: r.model_name, version: r.version, quant: r.quant, filePath: r.file_path, hash: r.hash, downloadedAt: r.downloaded_at, sizeBytes: r.size_bytes })
export class ModelMetadataRepository {
  constructor(private db: SQLiteDatabase) {}
  async create(p:{modelName:string;version:string;quant:string;filePath:string;hash:string;sizeBytes:number}): Promise<ModelMetadata> { const id = uuid(); const n = new Date().toISOString(); await this.db.runAsync('INSERT INTO model_metadata(id,model_name,version,quant,file_path,hash,downloaded_at,size_bytes)VALUES(?,?,?,?,?,?,?,?)', id, p.modelName, p.version, p.quant, p.filePath, p.hash, n, p.sizeBytes); return this.getById(id) as Promise<ModelMetadata> }
  async getById(id: string): Promise<ModelMetadata|null> { const r = await this.db.getAllAsync<R>('SELECT * FROM model_metadata WHERE id = ?', id); return r.length ? t(r[0]!) : null }
  async getByModelName(mn: string): Promise<ModelMetadata|null> { const r = await this.db.getAllAsync<R>('SELECT * FROM model_metadata WHERE model_name = ? ORDER BY downloaded_at DESC LIMIT 1', mn); return r.length ? t(r[0]!) : null }
  async getAll(): Promise<ModelMetadata[]> { const r = await this.db.getAllAsync<R>('SELECT * FROM model_metadata ORDER BY downloaded_at DESC'); return r.map(t) }
  async delete(id: string): Promise<void> { await this.db.runAsync('DELETE FROM model_metadata WHERE id = ?', id) }
}
