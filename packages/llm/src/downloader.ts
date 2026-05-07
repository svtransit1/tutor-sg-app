/**
 * @tutor-sg/llm — Core model download engine.
 *
 * Handles the retry/backoff/resume/integrity orchestration. The actual
 * HTTP file I/O is delegated to a platform-specific FileDownloadAdapter
 * (expo-file-system, react-native-fs, or test mock).
 *
 * Resilience features:
 * - HTTP Range-based resume (continues from existing partial data)
 * - Exponential backoff with jitter (max 3 retries)
 * - SHA-256 integrity verification after completion
 * - Storage space check before starting
 * - Progress callback with rolling speed estimate
 * - AbortController support for cancel/pause
 */

import type {
  DownloadOptions,
  DownloadResult,
  DownloadError,
  DownloadProgress,
  FileDownloadAdapter,
  BackoffStrategy,
  DownloadState,
} from './types';

// ─── Default backoff: exponential with jitter ────────────────────────

export const exponentialBackoff: BackoffStrategy = {
  /** Returns delay in ms for the nth retry (1-indexed). Caps at 30s. */
  delayMs(attempt: number): number {
    const base = 1_000; // 1 second
    const maxDelay = 30_000; // 30 second cap
    const delay = Math.min(base * Math.pow(2, attempt - 1), maxDelay);
    // Add ±25% jitter, then clamp to maxDelay
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(Math.min(delay + jitter, maxDelay));
  },
};

// ─── Progress speed estimator ────────────────────────────────────────

class SpeedEstimator {
  private samples: Array<{ time: number; bytes: number }> = [];
  private readonly windowMs = 3_000; // 3-second rolling window

  record(bytes: number): void {
    const now = Date.now();
    this.samples.push({ time: now, bytes });
    // Prune samples outside the window
    const cutoff = now - this.windowMs;
    this.samples = this.samples.filter((s) => s.time >= cutoff);
  }

  get speedBytesPerSec(): number {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0]!;
    const last = this.samples[this.samples.length - 1]!;
    const elapsedSec = (last.time - first.time) / 1000;
    if (elapsedSec <= 0) return 0;
    return Math.round((last.bytes - first.bytes) / elapsedSec);
  }
}

// ─── Storage space check ─────────────────────────────────────────────

async function ensureFreeSpace(
  adapter: FileDownloadAdapter,
  dirPath: string,
  requiredBytes: number,
): Promise<DownloadError | null> {
  let free: number;
  try {
    free = await adapter.getFreeSpace(dirPath);
  } catch {
    // Can't check → proceed (OS will fail with clear error if space runs out)
    return null;
  }

  // Require 2× the file size as buffer (temp + final coexist briefly)
  if (free < requiredBytes * 2) {
    const needGb = ((requiredBytes * 2) / 1_000_000_000).toFixed(1);
    const haveGb = (free / 1_000_000_000).toFixed(1);
    return {
      type: 'storage',
      message: `Not enough free space. Need ~${needGb} GB, have ${haveGb} GB.`,
      bytesReceived: 0,
      retryable: false,
    };
  }
  return null;
}

// ─── Core download function ──────────────────────────────────────────

/**
 * Download a single model file with resilience features.
 *
 * Flow:
 * 1. Storage space check
 * 2. Detect existing partial download → resume from offset
 * 3. Download loop with exponential backoff retry
 * 4. SHA-256 integrity verification
 * 5. Move temp → permanent location
 */
export async function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
  const {
    url,
    destinationPath,
    tempPath,
    expectedSize,
    expectedSha256,
    onProgress,
    onStateChange,
    onError,
    signal,
    maxRetries = 3,
    fileAdapter,
  } = options;

  let retriesConsumed = 0;
  let finalError: DownloadError | undefined;
  const speedEst = new SpeedEstimator();

  // ═══ Phase 1: Storage check ═══════════════════════════════════════
  const storageErr = await ensureFreeSpace(fileAdapter, tempPath, expectedSize);
  if (storageErr) {
    onStateChange?.('failed');
    return { success: false, error: storageErr, retriesConsumed: 0 };
  }

  // ═══ Phase 2: Detect existing partial download ═══════════════════
  let offset = 0;
  try {
    const partialExists = await fileAdapter.fileExists(tempPath);
    if (partialExists) {
      const partialSize = await fileAdapter.getFileSize(tempPath);
      if (partialSize > expectedSize) {
        // Corrupt partial — delete and start fresh
        await fileAdapter.deleteFile(tempPath);
      } else if (partialSize > 0) {
        offset = partialSize;
      }
    }
  } catch {
    // If we can't check, start from scratch
  }

  // ═══ Phase 3: Download loop with retries ═════════════════════════
  let attempts = 0;
  const maxAttempts = 1 + maxRetries; // original attempt + retries

  while (attempts < maxAttempts) {
    attempts++;

    // Check for abort
    if (signal?.aborted) {
      return {
        success: false,
        error: {
          type: 'cancelled',
          message: 'Download was cancelled.',
          bytesReceived: offset,
          retryable: false,
        },
        retriesConsumed,
      };
    }

    if (offset > 0) {
      onStateChange?.('downloading'); // resuming
    } else {
      onStateChange?.('downloading');
    }

    try {
      await fileAdapter.downloadRange({
        url,
        destPath: tempPath,
        offset,
        expectedSize,
        signal,
        onProgress: (downloaded, total) => {
          speedEst.record(downloaded);
          onProgress?.({
            bytesDownloaded: downloaded,
            totalBytes: total,
            speedBytesPerSec: speedEst.speedBytesPerSec,
            percent: total > 0 ? Math.round((downloaded / total) * 100) : 0,
          });
        },
      });

      // Download succeeded — verify file size
      const finalSize = await fileAdapter.getFileSize(tempPath);
      offset = finalSize;

      if (finalSize !== expectedSize) {
        throw {
          type: 'network',
          message: `Downloaded file size mismatch: got ${finalSize}, expected ${expectedSize}.`,
          retryable: true,
        };
      }

      // Download succeeded — clear any prior error and exit retry loop
      finalError = undefined;
      break;
    } catch (err) {
      // Update offset from whatever was written
      try {
        offset = await fileAdapter.getFileSize(tempPath).catch(() => offset);
      } catch {
        // ignore
      }

      const downloadError = normalizeError(err, offset);

      if (!downloadError.retryable || attempts >= maxAttempts) {
        finalError = downloadError;
        onError?.(downloadError);
        break;
      }

      // Retry with backoff
      retriesConsumed++;
      finalError = downloadError;
      onError?.(downloadError);
      await sleep(exponentialBackoff.delayMs(retriesConsumed), signal);
      continue;
    }
  }

  // ═══ Phase 4: Integrity check ════════════════════════════════════
  if (!finalError && offset === expectedSize) {
    onStateChange?.('verifying');

    try {
      const actualHash = await fileAdapter.sha256(tempPath);
      const expectedHash = expectedSha256.toLowerCase();

      if (actualHash !== expectedHash) {
        finalError = {
          type: 'integrity',
          message: `SHA-256 mismatch. Expected ${expectedHash}, got ${actualHash}.`,
          bytesReceived: offset,
          retryable: true,
          cause: { expected: expectedHash, actual: actualHash },
        };
        onError?.(finalError);

        // Delete corrupt file
        await fileAdapter.deleteFile(tempPath).catch(() => {});
        offset = 0;

        // One more retry if we still have budget
        if (retriesConsumed < maxRetries) {
          retriesConsumed++;
          onStateChange?.('downloading');
          await sleep(exponentialBackoff.delayMs(retriesConsumed), signal);
          const retryResult = await downloadFile({
            ...options,
            maxRetries: 0,
          }); // recurse once
          // Combine retry counts
          return {
            ...retryResult,
            retriesConsumed: retriesConsumed + retryResult.retriesConsumed,
          };
        }
      }
    } catch (err) {
      finalError = {
        type: 'unknown',
        message: `Integrity check failed: ${err instanceof Error ? err.message : String(err)}`,
        bytesReceived: offset,
        retryable: false,
        cause: err,
      };
    }
  }

  // ═══ Phase 5: Finalize ═══════════════════════════════════════════
  if (finalError) {
    onStateChange?.('failed');
    return { success: false, error: finalError, retriesConsumed };
  }

  // Move temp → permanent
  try {
    await fileAdapter.moveFile(tempPath, destinationPath);
  } catch (err) {
    onStateChange?.('failed');
    return {
      success: false,
      error: {
        type: 'unknown',
        message: `Failed to move file to destination: ${
          err instanceof Error ? err.message : String(err)
        }`,
        bytesReceived: offset,
        retryable: false,
        cause: err,
      },
      retriesConsumed,
    };
  }

  onStateChange?.('completed');
  return { success: true, filePath: destinationPath, retriesConsumed };
}

// ─── Error normalization ─────────────────────────────────────────────

function normalizeError(err: unknown, bytesReceived: number): DownloadError {
  // Range-based HTTP errors come as structured objects from the adapter
  if (isAdapterError(err)) {
    return {
      type: err.type,
      message: err.message,
      bytesReceived,
      retryable: err.retryable ?? (err.type === 'network' || err.type === 'server'),
      cause: err.cause ?? err,
    };
  }

  // AbortError — check safely across environments (Node, Hermes, browser)
  if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'AbortError'
  ) {
    return {
      type: 'cancelled',
      message: 'Download was cancelled.',
      bytesReceived,
      retryable: false,
      cause: err,
    };
  }

  // Generic
  return {
    type: 'unknown',
    message: err instanceof Error ? err.message : String(err),
    bytesReceived,
    retryable: false,
    cause: err,
  };
}

function isAdapterError(err: unknown): err is {
  type: DownloadError['type'];
  message: string;
  retryable?: boolean;
  cause?: unknown;
} {
  return typeof err === 'object' && err !== null && 'type' in err && 'message' in err;
}

// ─── Utilities ───────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
