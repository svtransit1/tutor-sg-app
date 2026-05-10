import { useState, useCallback, useRef, useEffect } from 'react';
import type { DownloadTask, DownloadProgress } from '../models/model-download';
import type { ModelDownloadError } from '../models/model-download-errors';
import { i18nKeyForError } from '../models/model-download-errors';
import { DEFAULT_PROGRESS } from '../models/model-download';
import { ModelDownloadCoordinator } from '../services/model-download-coordinator';
import type {
  DownloadCoordinatorConfig,
  FsApi,
  CryptoApi,
  FetchApi,
} from '../services/model-download-coordinator';

export interface UseModelDownloadResult {
  progress: DownloadProgress;
  error: ModelDownloadError | null;
  errorI18nKey: string | null;
  isIdle: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  isVerifying: boolean;
  isPaused: boolean;
  isDone: boolean;
  isError: boolean;
  tasks: DownloadTask[];
  start: (tasks: DownloadTask[]) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  retry: () => void;
}

export interface UseModelDownloadOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  maxRetryDelayMs?: number;
  stuckTimeoutMs?: number;
  diskSpaceBufferBytes?: number;
  fs: FsApi;
  crypto: CryptoApi;
  fetch: FetchApi;
  onPersist?: (
    tasks: DownloadTask[],
    completedFileNames: string[],
    downloadedBytes: number,
  ) => void;
}

export function useModelDownload(
  options: UseModelDownloadOptions,
): UseModelDownloadResult {
  const [progress, setProgress] = useState<DownloadProgress>(DEFAULT_PROGRESS);
  const [error, setError] = useState<ModelDownloadError | null>(null);
  const coordinatorRef = useRef<ModelDownloadCoordinator | null>(null);
  const tasksRef = useRef<DownloadTask[]>([]);
  const lastPersistedIndexRef = useRef<number>(-1);

  const persistIfNeeded = useCallback(
    (p: DownloadProgress) => {
      if (
        p.currentFileIndex > lastPersistedIndexRef.current &&
        p.phase === 'verifying' &&
        tasksRef.current.length > 0
      ) {
        lastPersistedIndexRef.current = p.currentFileIndex;
        const completed = tasksRef.current
          .slice(0, p.currentFileIndex)
          .map((t) => t.fileName);
        options.onPersist?.(tasksRef.current, completed, p.downloadedBytes);
      }
    },
    [options],
  );

  const createCoordinator = useCallback(
    (tasks: DownloadTask[]) => {
      lastPersistedIndexRef.current = -1;

      const config: DownloadCoordinatorConfig = {
        maxRetries: options.maxRetries ?? 3,
        retryDelayMs: options.retryDelayMs ?? 2000,
        maxRetryDelayMs: options.maxRetryDelayMs ?? 30000,
        stuckTimeoutMs: options.stuckTimeoutMs ?? 30000,
        diskSpaceBufferBytes:
          options.diskSpaceBufferBytes ?? 500 * 1024 * 1024,
        fs: options.fs,
        crypto: options.crypto,
        fetch: options.fetch,
      };

      const coordinator = new ModelDownloadCoordinator(
        config,
        (p) => {
          setProgress(p);
          if (p.phase !== 'error') {
            setError(null);
          }
          persistIfNeeded(p);
        },
        (err) => {
          setError(err);
          const p = coordinatorRef.current?.state;
          if (p && tasksRef.current.length > 0) {
            const completed = tasksRef.current
              .slice(0, p.currentFileIndex)
              .map((t) => t.fileName);
            options.onPersist?.(tasksRef.current, completed, p.downloadedBytes);
          }
        },
      );

      coordinatorRef.current = coordinator;
      coordinator.start(tasks);
    },
    [
      options.maxRetries,
      options.retryDelayMs,
      options.maxRetryDelayMs,
      options.stuckTimeoutMs,
      options.diskSpaceBufferBytes,
      options.fs,
      options.crypto,
      options.fetch,
      options.onPersist,
      persistIfNeeded,
    ],
  );

  const start = useCallback(
    (tasks: DownloadTask[]) => {
      tasksRef.current = tasks;
      setProgress(DEFAULT_PROGRESS);
      setError(null);
      lastPersistedIndexRef.current = -1;
      createCoordinator(tasks);
    },
    [createCoordinator],
  );

  const pause = useCallback(() => {
    const p = coordinatorRef.current?.state;
    if (p && tasksRef.current.length > 0) {
      const completed = tasksRef.current
        .slice(0, p.currentFileIndex)
        .map((t) => t.fileName);
      options.onPersist?.(tasksRef.current, completed, p.downloadedBytes);
    }
    coordinatorRef.current?.pause();
  }, [options]);

  const resume = useCallback(() => {
    coordinatorRef.current?.resume();
  }, []);

  const cancel = useCallback(() => {
    coordinatorRef.current?.cancel();
    coordinatorRef.current = null;
    setProgress(DEFAULT_PROGRESS);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    coordinatorRef.current?.cancel();
    coordinatorRef.current = null;
    setProgress(DEFAULT_PROGRESS);
    setError(null);
    lastPersistedIndexRef.current = -1;
    createCoordinator(tasksRef.current);
  }, [createCoordinator]);

  useEffect(() => {
    return () => {
      coordinatorRef.current?.cancel();
    };
  }, []);

  const errorI18nKey: string | null =
    error !== null ? i18nKeyForError(error.code) : null;

  return {
    progress,
    error,
    errorI18nKey,
    isIdle: progress.phase === 'idle',
    isChecking: progress.phase === 'checking',
    isDownloading: progress.phase === 'downloading',
    isVerifying: progress.phase === 'verifying',
    isPaused: progress.phase === 'paused',
    isDone: progress.phase === 'done',
    isError: progress.phase === 'error',
    tasks: tasksRef.current,
    start,
    pause,
    resume,
    cancel,
    retry,
  };
}
