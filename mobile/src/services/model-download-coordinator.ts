import type { DownloadTask, DownloadProgress } from '../models/model-download';
import {
  networkLostError,
  cdnUnreachableError,
  hashMismatchError,
  diskFullError,
  unknownDownloadError,
} from '../models/model-download-errors';
import type { ModelDownloadError } from '../models/model-download-errors';
import { DEFAULT_PROGRESS } from '../models/model-download';

export interface DownloadCoordinatorConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  stuckTimeoutMs: number;
  diskSpaceBufferBytes: number;
  fs: FsApi;
  crypto: CryptoApi;
  fetch: FetchApi;
}

export interface FsApi {
  getDocumentDirectory(): string;
  getFreeDiskStorage(): Promise<number>;
  makeDirectoryAsync(
    path: string,
    options?: { intermediates?: boolean },
  ): Promise<void>;
  moveAsync(options: { from: string; to: string }): Promise<void>;
  deleteAsync(
    path: string,
    options?: { idempotent?: boolean },
  ): Promise<void>;
  getInfoAsync(path: string): Promise<{ exists: boolean; size?: number }>;
  writeAsync(
    path: string,
    contents: Uint8Array,
    options?: { append?: boolean },
  ): Promise<void>;
}

export interface CryptoApi {
  sha256FileAsync(path: string): Promise<string>;
}

export interface FetchApi {
  (
    url: string,
    init?: {
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
  ): Promise<{
    ok: boolean;
    status: number;
    headers: { get(name: string): string | null };
    arrayBuffer(): Promise<ArrayBuffer>;
  }>;
}

const DEFAULT_CONFIG: Omit<
  DownloadCoordinatorConfig,
  'fs' | 'crypto' | 'fetch'
> = {
  maxRetries: 3,
  retryDelayMs: 2000,
  maxRetryDelayMs: 30000,
  stuckTimeoutMs: 30000,
  diskSpaceBufferBytes: 500 * 1024 * 1024,
};

export type ProgressCallback = (progress: DownloadProgress) => void;
export type ErrorCallback = (error: ModelDownloadError) => void;

interface StuckTimer {
  clear: () => void;
  reset: () => void;
}

export class ModelDownloadCoordinator {
  private config: DownloadCoordinatorConfig;
  private tasks: DownloadTask[] = [];
  private progress: DownloadProgress;
  private onProgress: ProgressCallback;
  private onError: ErrorCallback;
  private abortController: AbortController | null = null;
  private paused: boolean = false;
  private cancelled: boolean = false;

  constructor(
    config: Omit<DownloadCoordinatorConfig, 'fs' | 'crypto' | 'fetch'> &
      Pick<DownloadCoordinatorConfig, 'fs' | 'crypto' | 'fetch'>,
    onProgress: ProgressCallback,
    onError: ErrorCallback,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.progress = { ...DEFAULT_PROGRESS };
    this.onProgress = onProgress;
    this.onError = onError;
  }

  get state(): DownloadProgress {
    return { ...this.progress };
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get isCancelled(): boolean {
    return this.cancelled;
  }

  async start(tasks: DownloadTask[]): Promise<void> {
    this.tasks = [...tasks];
    this.cancelled = false;
    this.paused = false;

    const totalBytes = tasks.reduce((sum, t) => sum + t.sizeBytes, 0);
    this.progress = {
      ...DEFAULT_PROGRESS,
      totalFiles: tasks.length,
      totalBytes,
    };

    try {
      await this.checkDiskSpace(totalBytes);
      await this.ensureDownloadDir();

      for (let i = 0; i < tasks.length; i++) {
        if (this.cancelled || this.paused) return;

        const task = tasks[i];
        this.progress.currentFile = task.fileName;
        this.progress.currentFileIndex = i;
        this.emitProgress();

        await this.downloadWithRetry(task);

        if (this.cancelled || this.paused) return;

        this.updatePhase('verifying');
        await this.verifyWithRetry(task);

        if (this.cancelled || this.paused) return;
      }

      this.progress.phase = 'done';
      this.progress.percent = 100;
      this.emitProgress();
    } catch (err) {
      if (this.cancelled) return;
      this.handleError(err);
    }
  }

  pause(): void {
    this.paused = true;
    this.abortController?.abort();
    this.abortController = null;
    this.progress.phase = 'paused';
    this.emitProgress();
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.progress.phase = 'checking';
    this.emitProgress();
    this.start(this.tasks);
  }

  cancel(): void {
    this.cancelled = true;
    this.paused = false;
    this.abortController?.abort();
    this.abortController = null;
  }

  private emitProgress(): void {
    this.onProgress({ ...this.progress });
  }

  private updatePhase(phase: DownloadProgress['phase']): void {
    this.progress.phase = phase;
    this.progress.error = null;
  }

  private async checkDiskSpace(totalBytes: number): Promise<void> {
    this.updatePhase('checking');
    this.emitProgress();

    const free = await this.config.fs.getFreeDiskStorage();
    const needed = totalBytes + this.config.diskSpaceBufferBytes;

    if (free < needed) {
      this.progress.phase = 'error';
      this.progress.error = 'disk_insufficient';
      this.emitProgress();
      throw diskFullError(needed);
    }
  }

  private async ensureDownloadDir(): Promise<void> {
    const dir = this.config.fs.getDocumentDirectory();
    await this.config.fs.makeDirectoryAsync(`${dir}/models`, {
      intermediates: true,
    });
  }

  private async downloadWithRetry(task: DownloadTask): Promise<void> {
    let delay = this.config.retryDelayMs;
    let recoverableBytes = await this.getExistingSize(task.destPath);
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      if (this.cancelled || this.paused) return;

      try {
        await this.downloadFile(task, recoverableBytes);
        return;
      } catch (err) {
        if (this.cancelled || this.paused) return;

        const isHashDriven =
          isModelDownloadError(err) && err.code === 'hash_mismatch';

        const isNetworkErr =
          err instanceof Error && isNetworkError(err);

        if (isHashDriven) {
          recoverableBytes = 0;
          await this.config.fs
            .deleteAsync(task.destPath, { idempotent: true })
            .catch(() => {});
        } else if (isNetworkErr) {
          recoverableBytes = await this.getExistingSize(task.destPath);
        } else if (isModelDownloadError(err)) {
          throw err;
        } else {
          throw err;
        }

        attempt++;

        if (attempt > this.config.maxRetries) {
          if (isNetworkErr)
            throw networkLostError(err.message, recoverableBytes);
          throw hashMismatchError();
        }

        this.onError(
          isNetworkErr
            ? networkLostError(
                err instanceof Error ? err.message : 'Network error',
                recoverableBytes,
              )
            : hashMismatchError(),
        );

        await sleep(delay);
        delay = Math.min(delay * 2, this.config.maxRetryDelayMs);
      }
    }

    throw unknownDownloadError('download failed after retries');
  }

  private async getExistingSize(path: string): Promise<number> {
    try {
      return (await this.config.fs.getInfoAsync(path)).size ?? 0;
    } catch {
      return 0;
    }
  }

  private async downloadFile(
    task: DownloadTask,
    resumeFrom: number,
  ): Promise<void> {
    this.updatePhase('downloading');
    this.emitProgress();

    this.abortController = new AbortController();

    const headers: Record<string, string> = {};
    if (resumeFrom > 0) {
      headers['Range'] = `bytes=${resumeFrom}-`;
    }

    const stuckTimer = createStuckTimer(
      this.config.stuckTimeoutMs,
      () => {
        this.abortController?.abort();
      },
    );

    let response: Awaited<ReturnType<FetchApi>>;
    try {
      response = await this.config.fetch(task.url, {
        headers,
        signal: this.abortController.signal,
      });
    } catch (err) {
      stuckTimer.clear();
      if (this.abortController?.signal.aborted) {
        throw err;
      }
      throw cdnUnreachableError(
        err instanceof Error ? err.message : 'Network request failed',
      );
    }

    stuckTimer.clear();

    if (!response.ok) {
      const status = response.status;
      if (status === 416) {
        return;
      }
      const reason = status >= 500 ? `Server error (${status})` : `HTTP ${status}`;
      throw cdnUnreachableError(reason);
    }

    const body = await response.arrayBuffer();
    const chunk = new Uint8Array(body);

    await this.config.fs.writeAsync(task.destPath, chunk, {
      append: resumeFrom > 0,
    });

    this.progress.downloadedBytes += chunk.byteLength;
    this.progress.percent =
      this.progress.totalBytes > 0
        ? Math.round(
            (this.progress.downloadedBytes / this.progress.totalBytes) * 100,
          )
        : 0;
    this.emitProgress();
  }

  private async verifyWithRetry(task: DownloadTask): Promise<void> {
    for (let attempt = 0; attempt <= 1; attempt++) {
      if (this.cancelled || this.paused) return;

      const hash = await this.config.crypto.sha256FileAsync(task.destPath);

      if (hash.toLowerCase() === task.sha256.toLowerCase()) {
        return;
      }

      if (attempt >= 1) {
        this.progress.phase = 'error';
        this.progress.error = 'hash_mismatch';
        this.emitProgress();
        throw hashMismatchError();
      }

      this.onError(hashMismatchError());
      await this.config.fs
        .deleteAsync(task.destPath, { idempotent: true })
        .catch(() => {});
      await this.downloadWithRetry(task);
    }
  }

  private handleError(err: unknown): void {
    if (isModelDownloadError(err)) {
      this.progress.phase = 'error';
      this.progress.error = err.code;
      this.emitProgress();
      this.onError(err);
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      this.progress.phase = 'error';
      this.progress.error = 'unknown_error';
      this.emitProgress();
      this.onError(unknownDownloadError(msg));
    }
  }
}

function isModelDownloadError(err: unknown): err is ModelDownloadError {
  return err instanceof Error && err.name === 'ModelDownloadError';
}

interface ErrorWithCode extends Error {
  code?: string;
}

function isNetworkError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('connection') ||
    msg.includes('dns') ||
    msg.includes('abort') ||
    (err as ErrorWithCode).code === 'ECONNRESET' ||
    (err as ErrorWithCode).code === 'ETIMEDOUT'
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createStuckTimer(
  timeoutMs: number,
  onStuck: () => void,
): StuckTimer {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const start = () => {
    timer = setTimeout(() => {
      onStuck();
    }, timeoutMs);
  };

  start();

  return {
    clear: () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
    reset: () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      start();
    },
  };
}
