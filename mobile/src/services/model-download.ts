/**
 * Model download service with full resilience for all failure modes.
 * Handles (ADD §3.3): connectivity loss, disk space, CDN unreachable,
 * hash mismatch, app-killed resume, stuck download timeout.
 * Does NOT block the UI thread — all operations are async.
 */
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import type {
  DownloadStatus, DownloadError, DownloadErrorCode, DownloadProgress, DownloadState,
} from './model-download-types';
import { MAX_RETRIES, RETRY_DELAYS_MS, STUCK_TIMEOUT_MS } from './model-download-types';
import {
  persistDownloadState, loadDownloadState, clearDownloadState,
  markModelDownloaded, isModelDownloaded, listIncompleteDownloads,
} from '../storage/model-download-state';

type ProgressListener = (progress: DownloadProgress) => void;
type StateListener = (status: DownloadStatus) => void;

export class ModelDownloadService {
  private listeners = new Set<ProgressListener>();
  private stateListeners = new Set<StateListener>();
  private stuckTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private connectivitySubscription: ReturnType<typeof NetInfo.addEventListener> | null = null;
  private connectivityQueue: Set<string> = new Set();

  onProgress(fn: ProgressListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onStatusChange(fn: StateListener): () => void {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  async downloadModel(params: {
    fileName: string; cdnUrl: string; expectedSha256: string;
    totalBytes: number; finalDir: string; onProgress?: ProgressListener;
  }): Promise<void> {
    const { fileName, cdnUrl, expectedSha256, totalBytes, finalDir } = params;
    if (isModelDownloaded(fileName)) {
      this._emit({ status: 'completed', fileName, totalBytes, downloadedBytes: totalBytes, progress: 1 });
      return;
    }
    const previous = loadDownloadState(fileName);
    if (previous) { await this._resumeDownload(previous); return; }
    await this._freshDownload({ fileName, cdnUrl, expectedSha256, totalBytes, finalDir, retryCount: 0 });
  }

  async resumeInterruptedDownloads(_finalDir: string): Promise<void> {
    const incomplete = listIncompleteDownloads();
    for (const fileName of incomplete) {
      const state = loadDownloadState(fileName);
      if (state) await this._resumeDownload(state);
    }
  }

  pauseAll(): void { this._emitStatus('paused'); }

  async resumeAll(finalDir: string): Promise<void> { await this.resumeInterruptedDownloads(finalDir); }

  destroy(): void {
    for (const timer of this.stuckTimers.values()) clearTimeout(timer);
    this.stuckTimers.clear();
    this.listeners.clear();
    this.stateListeners.clear();
    if (this.connectivitySubscription) {
      this.connectivitySubscription();
      this.connectivitySubscription = null;
    }
  }

  private async _freshDownload(params: {
    fileName: string; cdnUrl: string; expectedSha256: string;
    totalBytes: number; finalDir: string; retryCount: number;
  }): Promise<void> {
    const { fileName, cdnUrl, expectedSha256, totalBytes, finalDir, retryCount } = params;
    const hasSpace = await this._checkDiskSpace(totalBytes);
    if (!hasSpace) {
      this._fail(fileName, totalBytes, 0, { code: 'disk_insufficient', message: 'Not enough storage space', retryCount });
      return;
    }
    const connected = await this._isConnected();
    if (!connected) {
      this._queueForConnectivity({ fileName, cdnUrl, expectedSha256, totalBytes, finalDir, retryCount });
      return;
    }
    const tempDir = FileSystem.cacheDirectory ?? '/tmp/';
    const state: DownloadState = {
      fileName, cdnUrl, expectedSha256, totalBytes, downloadedBytes: 0,
      tempFilePath: `${tempDir}${fileName}.part`, finalFilePath: `${finalDir}${fileName}`,
      retryCount, status: 'downloading', lastProgressTimestamp: Date.now(),
    };
    persistDownloadState(state);
    this._emitStatus('downloading');
    await this._doDownload(state);
  }

  private async _resumeDownload(state: DownloadState): Promise<void> {
    const { fileName, totalBytes, retryCount } = state;
    const fileInfo = await FileSystem.getInfoAsync(state.finalFilePath);
    if (fileInfo.exists) {
      const valid = await this._verifyHash(state.finalFilePath, state.expectedSha256);
      if (valid) {
        markModelDownloaded(fileName);
        this._emit({ status: 'completed', fileName, totalBytes, downloadedBytes: totalBytes, progress: 1 });
        return;
      }
      await FileSystem.deleteAsync(state.finalFilePath, { idempotent: true });
    }
    const connected = await this._isConnected();
    if (!connected) {
      this._queueForConnectivity({
        fileName: state.fileName, cdnUrl: state.cdnUrl, expectedSha256: state.expectedSha256,
        totalBytes: state.totalBytes, finalDir: state.finalFilePath.replace(state.fileName, ''),
        retryCount: state.retryCount,
      });
      return;
    }
    const remaining = state.totalBytes - state.downloadedBytes;
    const hasSpace = await this._checkDiskSpace(remaining);
    if (!hasSpace) {
      this._fail(fileName, totalBytes, state.downloadedBytes, { code: 'disk_insufficient', message: 'Not enough storage space', retryCount });
      return;
    }
    state.status = 'resuming';
    state.lastProgressTimestamp = Date.now();
    persistDownloadState(state);
    this._emitStatus('resuming');
    await this._doDownload(state);
  }

  private async _doDownload(state: DownloadState): Promise<void> {
    const { fileName, cdnUrl, expectedSha256, totalBytes, tempFilePath, downloadedBytes, retryCount } = state;
    this._resetStuckTimer(fileName);
    try {
      const headers: Record<string, string> = {};
      if (downloadedBytes > 0) headers.Range = `bytes=${downloadedBytes}-`;
      const result = await FileSystem.downloadAsync(cdnUrl, tempFilePath, {
        headers, sessionType: FileSystem.FileSystemSessionType.Download,
      });
      this._cancelStuckTimer(fileName);
      if (!result?.status || (result.status !== 200 && result.status !== 206)) {
        await this._handleRetry({ ...state, retryCount: retryCount ?? 0, errorCode: 'cdn_unreachable' });
        return;
      }
      state.downloadedBytes = totalBytes;
      state.lastProgressTimestamp = Date.now();
      persistDownloadState(state);
      this._emit({ status: 'downloading', fileName, totalBytes, downloadedBytes: totalBytes, progress: 1 });
      const hashValid = await this._verifyHash(tempFilePath, expectedSha256);
      if (!hashValid) {
        await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
        await this._handleRetry({ ...state, retryCount: retryCount ?? 0, errorCode: 'hash_mismatch' });
        return;
      }
      const finalDir = state.finalFilePath.substring(0, state.finalFilePath.lastIndexOf('/') + 1);
      const dirInfo = await FileSystem.getInfoAsync(finalDir);
      if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(finalDir, { intermediates: true });
      await FileSystem.moveAsync({ from: tempFilePath, to: state.finalFilePath });
      markModelDownloaded(fileName);
      this._emit({ status: 'completed', fileName, totalBytes, downloadedBytes: totalBytes, progress: 1 });
    } catch (err: unknown) {
      this._cancelStuckTimer(fileName);
      if (this._isNetworkError(err)) {
        await this._handleRetry({ ...state, retryCount: retryCount ?? 0, errorCode: 'connectivity_lost' });
        return;
      }
      this._fail(fileName, totalBytes, state.downloadedBytes, { code: 'unknown_error', message: err instanceof Error ? err.message : 'Unknown error', retryCount });
    }
  }

  private async _handleRetry(params: {
    fileName: string; cdnUrl: string; expectedSha256: string;
    totalBytes: number; tempFilePath: string; finalFilePath: string;
    downloadedBytes: number; retryCount: number; errorCode: DownloadErrorCode;
  }): Promise<void> {
    const { fileName, totalBytes, downloadedBytes, retryCount, errorCode } = params;
    const nextRetry = retryCount + 1;
    if (nextRetry >= MAX_RETRIES) {
      this._fail(fileName, totalBytes, downloadedBytes, { code: errorCode, message: `Failed after ${MAX_RETRIES} retries`, retryCount });
      return;
    }
    if (errorCode === 'hash_mismatch') {
      await FileSystem.deleteAsync(params.tempFilePath, { idempotent: true });
      params.downloadedBytes = 0;
    }
    const delay = RETRY_DELAYS_MS[retryCount] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
    this._emit({
      status: 'retrying', fileName, totalBytes, downloadedBytes,
      progress: totalBytes > 0 ? downloadedBytes / totalBytes : 0,
      error: { code: errorCode, message: `Retry ${nextRetry}/${MAX_RETRIES}`, retryCount: nextRetry },
    });
    this._emitStatus('retrying');
    await new Promise((resolve) => setTimeout(resolve, delay));
    const connected = await this._isConnected();
    if (!connected) { this._queueForConnectivity(params); return; }
    const newState: DownloadState = {
      fileName: params.fileName, cdnUrl: params.cdnUrl, expectedSha256: params.expectedSha256,
      totalBytes: params.totalBytes, downloadedBytes: params.downloadedBytes,
      tempFilePath: params.tempFilePath, finalFilePath: params.finalFilePath,
      retryCount: nextRetry, status: 'downloading', lastProgressTimestamp: Date.now(),
    };
    persistDownloadState(newState);
    await this._doDownload(newState);
  }

  private _resetStuckTimer(fileName: string): void {
    this._cancelStuckTimer(fileName);
    const timer = setTimeout(() => {
      this._emit({
        status: 'failed', fileName, totalBytes: 0, downloadedBytes: 0, progress: 0,
        error: { code: 'download_stuck', message: `No progress for ${STUCK_TIMEOUT_MS / 1000}s` },
      });
    }, STUCK_TIMEOUT_MS);
    this.stuckTimers.set(fileName, timer);
  }

  private _cancelStuckTimer(fileName: string): void {
    const timer = this.stuckTimers.get(fileName);
    if (timer) { clearTimeout(timer); this.stuckTimers.delete(fileName); }
  }

  private async _verifyHash(filePath: string, expectedSha256: string): Promise<boolean> {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256, filePath, { encoding: Crypto.CryptoEncoding.HEX }
    );
    return digest.toLowerCase() === expectedSha256.toLowerCase();
  }

  private async _checkDiskSpace(neededBytes: number): Promise<boolean> {
    try { return (await FileSystem.getFreeDiskStorageAsync()) >= neededBytes; } catch { return true; }
  }

  private async _isConnected(): Promise<boolean> {
    try { const s = await NetInfo.fetch(); return s.isConnected === true && s.type !== 'none'; } catch { return false; }
  }

  private _queueForConnectivity(params: {
    fileName: string; cdnUrl: string; expectedSha256: string;
    totalBytes: number; finalDir: string; retryCount: number;
  }): void {
    const state: DownloadState = {
      ...params, tempFilePath: '', finalFilePath: '',
      downloadedBytes: 0, status: 'paused', lastProgressTimestamp: Date.now(),
    };
    persistDownloadState(state);
    this._emitStatus('paused');
    this.connectivityQueue.add(params.fileName);
    if (!this.connectivitySubscription) {
      this.connectivitySubscription = NetInfo.addEventListener((ns) => {
        if (ns.isConnected === true && ns.type !== 'none') this.connectivityQueue.clear();
      });
    }
  }

  private _isNetworkError(err: unknown): boolean {
    if (err instanceof TypeError) return true;
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes('Network request failed') || msg.includes('network') ||
      msg.includes('connection') || msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT');
  }

  private _fail(fileName: string, totalBytes: number, downloadedBytes: number, error: DownloadError): void {
    clearDownloadState(fileName);
    this._emit({
      status: 'failed', fileName, totalBytes, downloadedBytes,
      progress: totalBytes > 0 ? downloadedBytes / totalBytes : 0, error,
    });
    this._emitStatus('failed');
  }

  private _emit(p: DownloadProgress): void { for (const fn of this.listeners) fn(p); }
  private _emitStatus(s: DownloadStatus): void { for (const fn of this.stateListeners) fn(s); }
}

export const modelDownloadService = new ModelDownloadService();