/**
 * Download state types for model delivery resilience.
 * All failure modes in ADD §3.3 map to these states.
 */
export type DownloadStatus =
  | 'idle' | 'checking_space' | 'downloading' | 'paused'
  | 'resuming' | 'retrying' | 'completed' | 'failed';
export type DownloadErrorCode =
  | 'connectivity_lost' | 'disk_insufficient' | 'cdn_unreachable'
  | 'hash_mismatch' | 'download_stuck' | 'unknown_error';
export interface DownloadError {
  code: DownloadErrorCode;
  message: string;
  retryCount?: number;
}
export interface DownloadProgress {
  status: DownloadStatus;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
  error?: DownloadError;
}
export interface DownloadState {
  fileName: string;
  cdnUrl: string;
  expectedSha256: string;
  totalBytes: number;
  downloadedBytes: number;
  tempFilePath: string;
  finalFilePath: string;
  retryCount: number;
  status: DownloadStatus;
  lastProgressTimestamp: number;
}
export const MAX_RETRIES = 3;
export const RETRY_DELAYS_MS = [5_000, 15_000, 30_000];
export const STUCK_TIMEOUT_MS = 60_000;
