/**
 * @tutor-sg/llm — Types for model download resilience.
 *
 * Defines all shared interfaces used by the download engine, network
 * detector, and orchestrator. Kept in a single file for discoverability.
 */

// ─── Network ──────────────────────────────────────────────────────────

/** Network connection type reported by the platform adapter. */
export type NetworkType = 'wifi' | 'cellular' | 'unknown' | 'none';

export interface NetworkState {
  type: NetworkType;
  isConnected: boolean;
}

/**
 * Platform adapter for network queries.
 * Injected at the app layer so the llm package stays RN-agnostic.
 */
export interface NetworkAdapter {
  getNetworkState(): Promise<NetworkState>;
  /** Subscribe to connectivity changes. Returns unsubscribe function. */
  onNetworkChange(listener: (state: NetworkState) => void): () => void;
}

// ─── Storage / File I/O Adapter ──────────────────────────────────────

/**
 * Low-level platform adapter that performs the actual HTTP download
 * and file operations. Implementations use `expo-file-system`,
 * `react-native-fs`, or a test mock.
 */
export interface FileDownloadAdapter {
  /**
   * Perform a resumable download from `url` to `destPath`.
   * - If `offset > 0`, the implementation MUST send HTTP Range headers.
   * - Returns final file size and the actual SHA-256 of downloaded content.
   *
   * Implementations should stream bytes to disk and not accumulate
   * the entire file in memory.
   */
  downloadRange(options: {
    url: string;
    destPath: string;
    offset: number;
    expectedSize: number;
    signal?: AbortSignal;
    onProgress?: (bytesDownloaded: number, totalBytes: number) => void;
  }): Promise<{ fileSize: number }>;

  /** Check if a file exists. */
  fileExists(path: string): Promise<boolean>;
  /** Get file size in bytes. */
  getFileSize(path: string): Promise<number>;
  /** Delete file at path. */
  deleteFile(path: string): Promise<void>;
  /** Atomically rename/move file. */
  moveFile(from: string, to: string): Promise<void>;
  /** Available free bytes in the directory's filesystem. */
  getFreeSpace(dirPath: string): Promise<number>;
  /** Compute SHA-256 hex digest of a file. */
  sha256(path: string): Promise<string>;
}

// ─── Download State Machine ──────────────────────────────────────────

export type DownloadState =
  | 'idle'
  | 'pending_cellular_approval'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'completed'
  | 'failed';

export type DownloadErrorType =
  | 'network'
  | 'storage'
  | 'integrity'
  | 'server'
  | 'cancelled'
  | 'unknown';

export interface DownloadProgress {
  bytesDownloaded: number;
  totalBytes: number;
  /** Instantaneous speed in bytes/sec (rolling window). */
  speedBytesPerSec: number;
  /** Percentage 0–100. */
  percent: number;
}

export interface DownloadError {
  type: DownloadErrorType;
  message: string;
  bytesReceived: number;
  cause?: unknown;
  /** Whether a retry with backoff is meaningful. */
  retryable: boolean;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: DownloadError;
  retriesConsumed: number;
}

export interface DownloadOptions {
  /** Remote URL for the model file. */
  url: string;
  /** Final destination path on disk. */
  destinationPath: string;
  /** Temporary path for partial downloads (survives app restart). */
  tempPath: string;
  /** Expected total file size in bytes (from registry). */
  expectedSize: number;
  /** Expected SHA-256 hex digest (from registry). */
  expectedSha256: string;
  /** Called on every progress tick. */
  onProgress?: (progress: DownloadProgress) => void;
  /** Called when state changes. */
  onStateChange?: (state: DownloadState) => void;
  /** Called when an error occurs (before retry). */
  onError?: (error: DownloadError) => void;
  /** AbortSignal to cancel the download. */
  signal?: AbortSignal;
  /** Maximum retries (default 3). */
  maxRetries?: number;
  /** File download adapter (platform-specific). */
  fileAdapter: FileDownloadAdapter;
}

// ─── Retry Backoff ────────────────────────────────────────────────────

export interface BackoffStrategy {
  /** Delay in ms for the nth retry (1-indexed). */
  delayMs(attempt: number): number;
}

// ─── Download Queue ──────────────────────────────────────────────────

export interface DownloadQueueItem {
  modelId: string;
  url: string;
  destinationPath: string;
  tempPath: string;
  expectedSize: number;
  expectedSha256: string;
  state: DownloadState;
  progress: DownloadProgress;
  error?: DownloadError;
  /** Abort controller to cancel/pause this item. */
  abortController: AbortController;
}

export interface ModelDownloadManagerConfig {
  network: NetworkAdapter;
  fileAdapter: FileDownloadAdapter;
  /** Directory for model files. */
  modelDir: string;
  /** Directory for temporary partial downloads. */
  tempDir: string;
  /** Called when any item's state or progress changes. */
  onStateChange?: (
    modelId: string,
    state: DownloadState,
    progress: DownloadProgress,
  ) => void;
  /** Whether to show cellular warning. Default true. */
  enableCellularWarning?: boolean;
}
