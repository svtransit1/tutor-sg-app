/**
 * React hook for model download lifecycle.
 *
 * Wraps the modelDownload service with reactive state management.
 * Usage:
 *   const { progress, status, start, pause, resume, cancel, retry } = useModelDownload(deviceTier);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Paths } from 'expo-file-system';
import {
  createDownloadSession,
  getProgress,
  saveSessionState,
  loadSessionState,
  clearSessionState,
  verifyFileIntegrity,
  pickCdnUrl,
  getRetryDelayMs,
  isMockCdnEnabled,
  type DownloadSessionState,
  type DownloadProgress,
  type DownloadStatus,
} from './modelDownload';
import type { DeviceTier } from '@tutor-sg/shared';

// ── Legacy download import ────────────────────────────────────────
// We use the legacy expo-file-system API for createDownloadResumable
// which supports progress callbacks + pause/resume.
type DownloadResumable = {
  downloadAsync(): Promise<{ uri: string } | undefined>;
  pauseAsync(): Promise<{ resumeData?: string }>;
  resumeAsync(): Promise<{ uri: string } | undefined>;
  cancelAsync(): Promise<void>;
  savable(): { resumeData?: string };
};

/** Get the document directory path for storing downloaded models. */
async function getModelDir(): Promise<string> {
  // Prefer new Paths.document, fall back to legacy documentDirectory
  try {
    if (Paths.document?.uri) return `${Paths.document.uri}models/`;
  } catch { /* fall through */ }
  const LegacyFS = await import('expo-file-system/legacy');
  return `${LegacyFS.documentDirectory ?? ''}models/`;
}

function getRuntimeEnv(): Record<string, string | undefined> {
  const maybeGlobal = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };
  return maybeGlobal.process?.env ?? {};
}

interface UseModelDownloadReturn {
  /** Current progress data (reactive). */
  progress: DownloadProgress;
  /** Overall session status. */
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';
  /** Current model's download status. */
  currentStatus: DownloadStatus;
  /** Error message if any. */
  error: string | null;
  /** Start/resume the download session. */
  start: () => void;
  /** Pause the current download. */
  pause: () => void;
  /** Resume a paused download. */
  resume: () => void;
  /** Cancel the entire session. */
  cancel: () => void;
  /** Retry after an error. */
  retry: () => void;
  /** Whether the session has started. */
  hasStarted: boolean;
  /** Whether all models are downloaded and verified. */
  isComplete: boolean;
  /** Current model display name. */
  currentModelName: string;
}

export function useModelDownload(deviceTier: DeviceTier): UseModelDownloadReturn {
  const [session, setSession] = useState<DownloadSessionState>(() =>
    createDownloadSession(deviceTier),
  );
  const [pendingAction, setPendingAction] = useState<'idle' | 'starting' | 'pausing' | 'resuming' | 'cancelling' | 'retrying'>('idle');
  const sessionRef = useRef<DownloadSessionState>(session);
  sessionRef.current = session;

  // Keep a ref to the active DownloadResumable so we can cancel/pause
  const downloadRef = useRef<DownloadResumable | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether download was cancelled during the active download
  const cancelledRef = useRef(false);
  // Track whether we're currently in a download operation
  const downloadingRef = useRef(false);

  // ── Persist session changes ────────────────────────────────────
  useEffect(() => {
    if (session.sessionStatus !== 'idle') {
      saveSessionState(session).catch(() => {});
    }
  }, [session]);

  // ── Internal: download the current model ────────────────────────
  const downloadCurrentModel = useCallback(async (
    state: DownloadSessionState,
  ): Promise<DownloadSessionState> => {
    // Dynamically import legacy expo-file-system for resumable downloads
    const LegacyFS = (await import('expo-file-system/legacy'));

    const modelIndex = state.currentIndex;
    if (modelIndex >= state.models.length) return state;

    const model = state.models[modelIndex]!;
    if (model.status === 'completed' || model.status === 'verifying') return state;

    // Determine local path
    const fileName = `${model.entry.modelFamily}-${model.entry.paramCount}b-${model.entry.quant}.${model.entry.format}`;
    const localDir = await getModelDir();

    // Ensure directory exists (use legacy API)
    try {
      await LegacyFS.makeDirectoryAsync(localDir, { intermediates: true });
    } catch {
      // Directory may already exist — fine
    }

    const fileUri = localDir + fileName;

    // Update model state to downloading
    const updatingModels = [...state.models];
    updatingModels[modelIndex] = {
      ...updatingModels[modelIndex]!,
      status: 'downloading',
      localUri: fileUri,
      currentUrl: model.currentUrl || pickCdnUrl(model.entry),
    };

    const updatedState: DownloadSessionState = {
      ...state,
      models: updatingModels,
      sessionStatus: 'running',
      startedAtMs: state.startedAtMs ?? Date.now(),
    };
    setSession(updatedState);
    sessionRef.current = updatedState;

    if (isMockCdnEnabled(getRuntimeEnv())) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const mockModels = updatedState.models.map((m) => ({
        ...m,
        status: 'completed' as DownloadStatus,
        downloadedBytes: m.totalBytes,
        verified: true,
        retryAttempt: 0,
      }));
      const mockState: DownloadSessionState = {
        ...updatedState,
        models: mockModels,
        currentIndex: mockModels.length,
        sessionStatus: 'completed',
        downloadedBytes: mockModels.reduce((sum, m) => sum + m.downloadedBytes, 0),
        overallProgress: 1,
        startedAtMs: undefined,
      };
      setSession(mockState);
      sessionRef.current = mockState;
      await clearSessionState();
      return mockState;
    }

    // Create resumable download with progress callback
    const downloadResumable = LegacyFS.createDownloadResumable(
      updatedState.models[modelIndex]!.currentUrl,
      fileUri,
      {},
      (progress: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
        if (cancelledRef.current) return;

        const current = sessionRef.current;
        const models = [...current.models];
        const m = { ...models[current.currentIndex]! };
        m.downloadedBytes = progress.totalBytesWritten;
        m.resumeData = downloadResumable.savable().resumeData ?? m.resumeData;
        models[current.currentIndex] = m;

        const totalDownloaded = models.reduce((sum, mod) => sum + mod.downloadedBytes, 0);
        const overallProgress = current.totalBytes > 0
          ? totalDownloaded / current.totalBytes
          : 0;

        const next: DownloadSessionState = {
          ...current,
          models,
          downloadedBytes: totalDownloaded,
          overallProgress,
          startedAtMs: current.startedAtMs ?? Date.now(),
        };
        sessionRef.current = next;
        setSession(next);
        saveSessionState(next).catch(() => {});
      },
      model.resumeData,
    );

    downloadRef.current = downloadResumable;

    try {
      const result = await downloadResumable.downloadAsync();

      if (cancelledRef.current) {
        const cancelModels = [...sessionRef.current.models];
        cancelModels[sessionRef.current.currentIndex] = {
          ...cancelModels[sessionRef.current.currentIndex]!,
          status: 'cancelled',
        };
        const cancelState: DownloadSessionState = {
          ...sessionRef.current,
          models: cancelModels,
          sessionStatus: 'cancelled',
        };
        setSession(cancelState);
        sessionRef.current = cancelState;
        return cancelState;
      }

      if (!result) {
        throw new Error('Download returned empty result');
      }

      // ── Integrity verification ──────────────────────────────────
      const verifyModels = [...sessionRef.current.models];
      verifyModels[sessionRef.current.currentIndex] = {
        ...verifyModels[sessionRef.current.currentIndex]!,
        status: 'verifying',
        downloadedBytes: verifyModels[sessionRef.current.currentIndex]!.totalBytes,
      };
      const verifyState: DownloadSessionState = {
        ...sessionRef.current,
        models: verifyModels,
        downloadedBytes: verifyModels.reduce((sum, m) => sum + m.downloadedBytes, 0),
        overallProgress: verifyModels.reduce((sum, m) => sum + m.downloadedBytes, 0) /
          (sessionRef.current.totalBytes || 1),
      };
      setSession(verifyState);
      sessionRef.current = verifyState;

      await verifyFileIntegrity(fileUri, model.entry.sha256);

      // ── Model complete ──────────────────────────────────────────
      const completeModels = [...sessionRef.current.models];
      completeModels[sessionRef.current.currentIndex] = {
        ...completeModels[sessionRef.current.currentIndex]!,
        status: 'completed' as DownloadStatus,
        verified: true,
        downloadedBytes: completeModels[sessionRef.current.currentIndex]!.totalBytes,
        retryAttempt: 0,
      };

      // Move to next model or mark session complete
      const nextIndex = sessionRef.current.currentIndex + 1;
      const allDone = nextIndex >= completeModels.length;
      const completeState: DownloadSessionState = {
        ...sessionRef.current,
        models: completeModels,
        currentIndex: nextIndex,
        sessionStatus: allDone ? 'completed' : 'running',
        downloadedBytes: completeModels.reduce((sum, m) => sum + m.downloadedBytes, 0),
        overallProgress: allDone ? 1 : completeModels.reduce((sum, m) => sum + m.downloadedBytes, 0) /
          (sessionRef.current.totalBytes || 1),
        startedAtMs: allDone ? undefined : sessionRef.current.startedAtMs,
      };

      setSession(completeState);
      sessionRef.current = completeState;

      if (!allDone) {
        // Start next model download
        return downloadCurrentModel(completeState);
      }

      // All done — clear persisted session
      await clearSessionState();
      return completeState;
    } catch (err) {
      if (cancelledRef.current) {
        const cancelModels = [...sessionRef.current.models];
        cancelModels[sessionRef.current.currentIndex] = {
          ...cancelModels[sessionRef.current.currentIndex]!,
          status: 'cancelled',
        };
        const cancelState: DownloadSessionState = {
          ...sessionRef.current,
          models: cancelModels,
          sessionStatus: 'cancelled',
        };
        setSession(cancelState);
        sessionRef.current = cancelState;
        return cancelState;
      }

      const errorModels = [...sessionRef.current.models];
      const failedModel = errorModels[sessionRef.current.currentIndex]!;
      const retryAttempt = failedModel.retryAttempt ?? 0;
      errorModels[sessionRef.current.currentIndex] = {
        ...failedModel,
        status: 'error' as DownloadStatus,
        error: String(err),
        retryAttempt,
      };
      const errorState: DownloadSessionState = {
        ...sessionRef.current,
        models: errorModels,
        sessionStatus: 'error',
      };
      setSession(errorState);
      sessionRef.current = errorState;
      await saveSessionState(errorState);

      if (retryAttempt < 3) {
        const delayMs = getRetryDelayMs(retryAttempt);
        retryTimerRef.current = setTimeout(() => {
          const models = [...sessionRef.current.models];
          const retryModel = models[sessionRef.current.currentIndex];
          if (!retryModel || retryModel.status !== 'error') return;

          models[sessionRef.current.currentIndex] = {
            ...retryModel,
            status: 'idle',
            error: undefined,
            retryAttempt: retryAttempt + 1,
          };
          const retryState: DownloadSessionState = {
            ...sessionRef.current,
            models,
            sessionStatus: 'running',
            startedAtMs: Date.now(),
          };
          setSession(retryState);
          sessionRef.current = retryState;
          downloadCurrentModel(retryState).catch(() => {});
        }, delayMs);
        return errorState;
      }

      throw err;
    }
  }, []);

  // ── Load persisted session on mount ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await loadSessionState();
      if (!saved || cancelled) return;
      if (saved.sessionStatus === 'completed' || saved.sessionStatus === 'cancelled') return;

      setSession(saved);
      sessionRef.current = saved;

      if (saved.sessionStatus === 'running') {
        downloadCurrentModel(saved).catch(() => {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [downloadCurrentModel]);

  // ── Public API ──────────────────────────────────────────────────

  const start = useCallback(() => {
    if (session.sessionStatus === 'running' || session.sessionStatus === 'completed') return;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    cancelledRef.current = false;
    setPendingAction('starting');

    // If resuming from paused, start from current state
    const stateToUse = session.sessionStatus === 'paused'
      ? session
      : { ...createDownloadSession(deviceTier), startedAtMs: Date.now() };

    setSession(stateToUse);
    sessionRef.current = stateToUse;

    downloadCurrentModel(stateToUse)
      .catch(() => {
        // Error already handled in downloadCurrentModel
      })
      .finally(() => {
        setPendingAction('idle');
      });
  }, [session, deviceTier, downloadCurrentModel]);

  const pause = useCallback(async () => {
    if (downloadRef.current) {
      setPendingAction('pausing');
      try {
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        const pauseState = await downloadRef.current.pauseAsync();
        if (pauseState && pauseState.resumeData !== undefined) {
          const models = [...sessionRef.current.models];
          models[sessionRef.current.currentIndex] = {
            ...models[sessionRef.current.currentIndex]!,
            status: 'paused',
            resumeData: pauseState.resumeData,
          };
          const newState: DownloadSessionState = {
            ...sessionRef.current,
            models,
            sessionStatus: 'paused',
          };
          setSession(newState);
          sessionRef.current = newState;
          await saveSessionState(newState);
        }
      } catch (e) {
        // Pause might fail if already done
      } finally {
        setPendingAction('idle');
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (session.sessionStatus !== 'paused') return;
    cancelledRef.current = false;
    setPendingAction('resuming');
    downloadCurrentModel(sessionRef.current)
      .catch(() => {})
      .finally(() => setPendingAction('idle'));
  }, [session, downloadCurrentModel]);

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setPendingAction('cancelling');

    if (downloadRef.current) {
      try {
        await downloadRef.current.cancelAsync();
      } catch {
        // Ignore cancel errors
      }
    }

    const cancelModels = [...sessionRef.current.models].map((m) =>
      m.status === 'downloading' || m.status === 'paused' || m.status === 'idle'
        ? { ...m, status: 'cancelled' as DownloadStatus }
        : m,
    );
    const cancelState: DownloadSessionState = {
      ...sessionRef.current,
      models: cancelModels,
      sessionStatus: 'cancelled',
    };
    setSession(cancelState);
    sessionRef.current = cancelState;
    await clearSessionState();
    setPendingAction('idle');
  }, []);

  const retry = useCallback(() => {
    if (session.sessionStatus !== 'error') return;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    cancelledRef.current = false;
    setPendingAction('retrying');

    // Reset the error model to idle
    const models = [...sessionRef.current.models];
    const errIdx = models.findIndex((m) => m.status === 'error');
    if (errIdx >= 0) {
      models[errIdx] = {
        ...models[errIdx]!,
        status: 'idle',
        error: undefined,
        retryAttempt: 0,
        downloadedBytes: 0,
      };
    }

    // If the error model has mirror URLs, try the next one
    // For simplicity, just restart from current index
    const retryState: DownloadSessionState = {
      ...sessionRef.current,
      models,
      currentIndex: errIdx >= 0 ? errIdx : sessionRef.current.currentIndex,
      sessionStatus: 'idle',
      startedAtMs: Date.now(),
    };
    setSession(retryState);
    sessionRef.current = retryState;

    downloadCurrentModel(retryState)
      .catch(() => {})
      .finally(() => setPendingAction('idle'));
  }, [session, downloadCurrentModel]);

  // ── Derived state ───────────────────────────────────────────────

  const progress = getProgress(session);
  const currentModel = session.models[session.currentIndex];
  const currentStatus = currentModel?.status ?? 'idle';
  const error = currentModel?.error ?? null;
  const hasStarted = session.sessionStatus !== 'idle';
  const isComplete = session.sessionStatus === 'completed';

  return {
    progress,
    status: session.sessionStatus,
    currentStatus,
    error,
    start,
    pause,
    resume,
    cancel,
    retry,
    hasStarted,
    isComplete,
    currentModelName: progress.currentFileName,
  };
}
