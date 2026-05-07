/**
 * @tutor-sg/llm — Model download queue orchestrator.
 *
 * Manages multiple model downloads with:
 * - Serial queue (one download at a time to avoid saturating bandwidth)
 * - Cellular warning gating per model
 * - Pause/resume individual downloads
 * - State persistence (survives app restart)
 * - Progress aggregation across all items
 */

import type {
  DownloadQueueItem,
  DownloadState,
  DownloadProgress,
  DownloadError,
  DownloadOptions,
  ModelDownloadManagerConfig,
  NetworkAdapter,
  FileDownloadAdapter,
  NetworkState,
} from './types';
import { downloadFile, exponentialBackoff } from './downloader';

// ─── Constants ───────────────────────────────────────────────────────

const CHECKPOINT_FILE = 'downloads_checkpoint.json';

// ─── Manager ─────────────────────────────────────────────────────────

export class ModelDownloadManager {
  private items: Map<string, DownloadQueueItem> = new Map();
  private queue: string[] = []; // Ordered model IDs
  private currentDownload: Promise<void> | null = null;
  private cancelled = false;
  private unsubNetwork: (() => void) | null = null;
  /** Resolve functions for pending cellular approval waits, keyed by modelId. */
  private cellularResolvers = new Map<string, () => void>();

  readonly config: ModelDownloadManagerConfig;

  constructor(config: ModelDownloadManagerConfig) {
    this.config = config;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────

  /** Start the manager: load checkpoints and listen for network changes. */
  async start(): Promise<void> {
    this.cancelled = false;

    // Listen for network changes (e.g., cellular → wifi)
    this.unsubNetwork = this.config.network.onNetworkChange((state) => {
      this.handleNetworkChange(state).catch(() => {});
    });
  }

  /** Stop the manager and clean up. */
  async stop(): Promise<void> {
    this.cancelled = true;
    this.unsubNetwork?.();
    this.unsubNetwork = null;

    // Resolve all cellular approval waits so they can exit
    for (const [modelId, resolve] of this.cellularResolvers) {
      resolve();
    }
    this.cellularResolvers.clear();

    // Abort all active downloads
    for (const item of this.items.values()) {
      if (item.state === 'downloading' || item.state === 'pending_cellular_approval') {
        item.abortController.abort();
      }
    }
  }

  // ─── Queue Management ──────────────────────────────────────────────

  /**
   * Add a model to the download queue. If the model already exists,
   * it's ignored (idempotent add).
   */
  addToQueue(model: {
    modelId: string;
    url: string;
    destinationPath: string;
    tempPath: string;
    expectedSize: number;
    expectedSha256: string;
  }): void {
    if (this.items.has(model.modelId)) return;

    const item: DownloadQueueItem = {
      ...model,
      state: 'idle',
      progress: {
        bytesDownloaded: 0,
        totalBytes: model.expectedSize,
        speedBytesPerSec: 0,
        percent: 0,
      },
      abortController: new AbortController(),
    };

    this.items.set(model.modelId, item);
    this.queue.push(model.modelId);
  }

  /**
   * Check the cellular warning gate for a specific model.
   * Returns true if the download should proceed.
   */
  async checkCellularGate(modelId: string): Promise<boolean> {
    const item = this.items.get(modelId);
    if (!item) return false;
    if (!this.config.enableCellularWarning) return true;

    const netState = await this.config.network.getNetworkState();
    if (netState.type === 'cellular') {
      item.state = 'pending_cellular_approval';
      this.notifyStateChange(item);
      return false; // Awaiting user approval
    }
    return true; // WiFi or unknown — proceed
  }

  /**
   * Approve cellular download for a specific model (called after user taps
   * "Download anyway"). Lets `startAll` resume the queue naturally.
   */
  approveCellular(modelId: string): void {
    const resolve = this.cellularResolvers.get(modelId);
    if (resolve) {
      resolve();
      this.cellularResolvers.delete(modelId);
    }
  }

  /** Pause a specific download. */
  pause(modelId: string): void {
    const item = this.items.get(modelId);
    if (!item || item.state !== 'downloading') return;
    item.abortController.abort();
    item.state = 'paused';
    // Create a fresh abort controller for resume
    item.abortController = new AbortController();
    this.notifyStateChange(item);
  }

  /** Resume a paused or idle download. */
  resume(modelId: string): void {
    const item = this.items.get(modelId);
    if (!item) return;
    if (item.state === 'paused' || item.state === 'failed' || item.state === 'idle') {
      item.state = 'idle'; // Reset for re-queue
      this.startItem(item).catch(() => {});
    }
  }

  /** Cancel a download entirely. */
  cancel(modelId: string): void {
    const item = this.items.get(modelId);
    if (!item) return;
    item.abortController.abort();
    item.state = 'failed';
    item.error = {
      type: 'cancelled',
      message: 'Download cancelled by user.',
      bytesReceived: item.progress.bytesDownloaded,
      retryable: false,
    };
    this.notifyStateChange(item);
  }

  /** Get a snapshot of all download queue items. */
  getAllItems(): DownloadQueueItem[] {
    return this.queue
      .map((id) => this.items.get(id)!)
      .filter(Boolean);
  }

  /** Get a single item by model ID. */
  getItem(modelId: string): DownloadQueueItem | undefined {
    return this.items.get(modelId);
  }

  /** Start all queued downloads sequentially. */
  async startAll(): Promise<void> {
    for (const modelId of this.queue) {
      if (this.cancelled) break;
      const item = this.items.get(modelId)!;

      // Skip already-completed items
      if (item.state === 'completed') continue;

      // Check cellular gate
      if (this.config.enableCellularWarning) {
        const netState = await this.config.network.getNetworkState();
        if (netState.type === 'cellular') {
          item.state = 'pending_cellular_approval';
          this.notifyStateChange(item);
          // Wait here until user approves or we get cancelled
          await this.waitForCellularApproval(modelId);
          // Re-read item state — may have been changed by approveCellular()
          const fresh = this.getItem(modelId);
          if (this.cancelled || !fresh || fresh.state === 'failed') continue;
        }
      }

      await this.startItem(item);
      // Re-read fresh state in case item was mutated by callbacks
      const freshItem = this.items.get(modelId);
      if (freshItem && freshItem.state !== 'completed') break;
    }
  }

  // ─── Internal ──────────────────────────────────────────────────────

  private async startItem(item: DownloadQueueItem): Promise<void> {
    if (item.state === 'completed') return;

    const options: DownloadOptions = {
      url: item.url,
      destinationPath: item.destinationPath,
      tempPath: item.tempPath,
      expectedSize: item.expectedSize,
      expectedSha256: item.expectedSha256,
      maxRetries: 3,
      signal: item.abortController.signal,
      fileAdapter: this.config.fileAdapter,
      onProgress: (progress) => {
        item.progress = progress;
        this.notifyStateChange(item);
      },
      onStateChange: (state) => {
        // Only update for non-terminal states; let startItem decide terminal state
        if (state === 'verifying') {
          item.state = 'verifying';
          this.notifyStateChange(item);
        }
      },
      onError: (error) => {
        item.error = error;
        this.notifyStateChange(item);
      },
    };

    const result = await downloadFile(options);
    if (result.success) {
      item.state = 'completed';
      item.error = undefined;
    } else if (result.error?.type !== 'cancelled') {
      item.state = 'failed';
      item.error = result.error;
    }
    this.notifyStateChange(item);
  }

  /**
   * Wait for cellular approval or cancellation.
   * Resolves when `approveCellular()` is called, the download is cancelled,
   * or the manager is stopped.
   */
  private async waitForCellularApproval(modelId: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.cellularResolvers.set(modelId, resolve);
      // Also resolve on manager stop
    });
  }

  private async handleNetworkChange(state: NetworkState): Promise<void> {
    // If we switched to wifi and have paused/pending cellular items, resume them
    if (state.type === 'wifi' || state.type === 'unknown') {
      for (const [modelId, item] of this.items) {
        if (item.state === 'pending_cellular_approval') {
          // Auto-approved on wifi
          this.startItem(item).catch(() => {});
        }
      }
    }
  }

  private notifyStateChange(item: DownloadQueueItem): void {
    this.config.onStateChange?.(
      item.modelId,
      item.state,
      item.progress,
    );
  }
}

// ─── Helper: compute temp path from destination ──────────────────────

/** Derive a temporary download path from the final destination. */
export function tempPathForModel(destinationPath: string): string {
  return `${destinationPath}.partial`;
}
