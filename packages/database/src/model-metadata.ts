import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { ModelMetadata } from './types';

export function insertModelMetadata(
  db: DatabaseExecutor,
  params: {
    modelName: string;
    version: string;
    quant: string;
    filePath: string;
    hash: string;
    sizeBytes: number;
  },
): ModelMetadata {
  const now = new Date().toISOString();
  const id = uuid();
  db.run(
    `INSERT INTO model_metadata (id, model_name, version, quant, file_path, hash, downloaded_at, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, params.modelName, params.version, params.quant, params.filePath, params.hash, now, params.sizeBytes],
  );
  return getModelMetadata(db, id)!;
}

export function getModelMetadata(
  db: DatabaseExecutor,
  id: string,
): ModelMetadata | null {
  const row = db.getFirst<{
    id: string;
    model_name: string;
    version: string;
    quant: string;
    file_path: string;
    hash: string;
    downloaded_at: string;
    size_bytes: number;
  }>('SELECT * FROM model_metadata WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    modelName: row.model_name,
    version: row.version,
    quant: row.quant,
    filePath: row.file_path,
    hash: row.hash,
    downloadedAt: row.downloaded_at,
    sizeBytes: row.size_bytes,
  };
}

export function getLatestModelMetadata(
  db: DatabaseExecutor,
  modelName: string,
): ModelMetadata | null {
  const row = db.getFirst<{
    id: string;
    model_name: string;
    version: string;
    quant: string;
    file_path: string;
    hash: string;
    downloaded_at: string;
    size_bytes: number;
  }>(
    'SELECT * FROM model_metadata WHERE model_name = ? ORDER BY downloaded_at DESC LIMIT 1',
    [modelName],
  );

  if (!row) return null;
  return {
    id: row.id,
    modelName: row.model_name,
    version: row.version,
    quant: row.quant,
    filePath: row.file_path,
    hash: row.hash,
    downloadedAt: row.downloaded_at,
    sizeBytes: row.size_bytes,
  };
}

export function listAllModels(
  db: DatabaseExecutor,
): ModelMetadata[] {
  const rows = db.getAll<{
    id: string;
    model_name: string;
    version: string;
    quant: string;
    file_path: string;
    hash: string;
    downloaded_at: string;
    size_bytes: number;
  }>('SELECT * FROM model_metadata ORDER BY downloaded_at DESC');

  return rows.map((row) => ({
    id: row.id,
    modelName: row.model_name,
    version: row.version,
    quant: row.quant,
    filePath: row.file_path,
    hash: row.hash,
    downloadedAt: row.downloaded_at,
    sizeBytes: row.size_bytes,
  }));
}
