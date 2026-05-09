import type { ModelDownloadErrorCode } from './model-download-errors';

export type DownloadPhase =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'done'
  | 'error'
  | 'paused';

export interface DownloadProgress {
  phase: DownloadPhase;
  currentFile: string;
  currentFileIndex: number;
  totalFiles: number;
  downloadedBytes: number;
  totalBytes: number;
  percent: number;
  speedBytesPerSec: number;
  remainingSec: number;
  error: ModelDownloadErrorCode | null;
}

export interface DownloadTask {
  modelFamily: string;
  paramCount: number;
  fileName: string;
  url: string;
  destPath: string;
  sizeBytes: number;
  sha256: string;
}

export interface ModelIntegrityManifest {
  version: number;
  entries: ModelIntegrityEntry[];
}

export interface ModelIntegrityEntry {
  modelFamily: string;
  paramCount: number;
  quant: string;
  format: string;
  sizeBytes: number;
  sha256: string;
  cdnUrls: string[];
  minDeviceTier: string;
  iosOnly?: boolean;
  recommended?: boolean;
}

export const DEFAULT_PROGRESS: DownloadProgress = {
  phase: 'idle',
  currentFile: '',
  currentFileIndex: 0,
  totalFiles: 0,
  downloadedBytes: 0,
  totalBytes: 0,
  percent: 0,
  speedBytesPerSec: 0,
  remainingSec: 0,
  error: null,
};
