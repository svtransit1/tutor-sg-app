/**
 * @tutor-sg/llm — Tests for ModelDownloadManager (queue orchestrator).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelDownloadManager, tempPathForModel } from '../modelManager';
import type {
  FileDownloadAdapter,
  NetworkAdapter,
  NetworkState,
  ModelDownloadManagerConfig,
  DownloadProgress,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────

function makeNetworkAdapter(
  initialType: NetworkState['type'] = 'wifi',
): NetworkAdapter {
  const listeners: Array<(state: NetworkState) => void> = [];
  return {
    getNetworkState: vi.fn(async () => ({
      type: initialType,
      isConnected: initialType !== 'none',
    })),
    onNetworkChange: vi.fn((listener) => {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    }),
  } as NetworkAdapter;
}

/**
 * In-memory filesystem for the async adapter.
 */
class TestFS {
  private store = new Map<string, number>();
  exists(path: string): boolean { return this.store.has(path); }
  size(path: string): number { return this.store.get(path) ?? 0; }
  write(path: string, size: number): void { this.store.set(path, size); }
  delete(path: string): void { this.store.delete(path); }
  move(from: string, to: string): void {
    const s = this.store.get(from);
    if (s !== undefined) { this.store.set(to, s); this.store.delete(from); }
  }
}

/**
 * Adapter that uses deferred progress to simulate real download timing,
 * backed by an in-memory filesystem.
 */
function makeAsyncAdapter(delayMs = 20): { adapter: FileDownloadAdapter; fs: TestFS } {
  const fs = new TestFS();
  const adapter: FileDownloadAdapter = {
    fileExists: vi.fn(async (path) => fs.exists(path)),
    getFileSize: vi.fn(async (path) => fs.size(path)),
    deleteFile: vi.fn(async (path) => fs.delete(path)),
    moveFile: vi.fn(async (from, to) => fs.move(from, to)),
    getFreeSpace: vi.fn(async () => 100_000_000_000),
    sha256: vi.fn(async () => 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1'),
    downloadRange: vi.fn(async (opts) => {
      // Simulate download in chunks with delays, checking for abort
      const chunks = 3;
      for (let i = 1; i <= chunks; i++) {
        if (opts.signal?.aborted) {
          throw { type: 'cancelled', message: 'Download cancelled', retryable: false };
        }
        await new Promise((r) => setTimeout(r, delayMs / chunks));
        // Check again after sleep
        if (opts.signal?.aborted) {
          throw { type: 'cancelled', message: 'Download cancelled', retryable: false };
        }
        opts.onProgress?.(Math.round((opts.expectedSize * i) / chunks), opts.expectedSize);
      }
      // Write the completed file to the in-memory filesystem
      fs.write(opts.destPath, opts.expectedSize);
      return { fileSize: opts.expectedSize };
    }),
  };
  return { adapter, fs };
}

function makeConfig(overrides: Partial<ModelDownloadManagerConfig> = {}): ModelDownloadManagerConfig {
  const { fileAdapter: overrideAdapter, ...rest } = overrides as any;
  const { adapter } = makeAsyncAdapter();
  return {
    network: makeNetworkAdapter(),
    fileAdapter: overrideAdapter ?? adapter,
    modelDir: '/models/',
    tempDir: '/tmp/',
    onStateChange: vi.fn(),
    enableCellularWarning: true,
    ...rest,
  };
}

function addTestModel(
  manager: ModelDownloadManager,
  modelId: string,
  suffix = '',
): void {
  manager.addToQueue({
    modelId,
    url: `https://cdn.example.com/${modelId}.gguf${suffix}`,
    destinationPath: `/models/${modelId}.gguf`,
    tempPath: `/tmp/${modelId}.gguf.partial`,
    expectedSize: 1_000_000,
    expectedSha256: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  });
}

describe('ModelDownloadManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queue management', () => {
    it('should accept and list items', () => {
      const manager = new ModelDownloadManager(makeConfig());
      addTestModel(manager, 'gemma-e2b');

      const items = manager.getAllItems();
      expect(items).toHaveLength(1);
      expect(items[0]!.modelId).toBe('gemma-e2b');
      expect(items[0]!.state).toBe('idle');
    });

    it('should ignore duplicate model IDs', () => {
      const manager = new ModelDownloadManager(makeConfig());
      addTestModel(manager, 'gemma-e2b');
      addTestModel(manager, 'gemma-e2b'); // Same ID

      expect(manager.getAllItems()).toHaveLength(1);
    });

    it('should report item by modelId', () => {
      const manager = new ModelDownloadManager(makeConfig());
      addTestModel(manager, 'gemma-e2b');

      expect(manager.getItem('gemma-e2b')).toBeDefined();
      expect(manager.getItem('nonexistent')).toBeUndefined();
    });
  });

  describe('cellular warning', () => {
    it('should go to pending_cellular_approval on cellular, then complete after approval', async () => {
      const network = makeNetworkAdapter('cellular');
      const manager = new ModelDownloadManager(makeConfig({ network }));
      addTestModel(manager, 'gemma-e2b');

      // startAll will pause waiting for cellular approval
      const promise = manager.startAll();

      // Give it a moment to hit the gate
      await new Promise((r) => setTimeout(r, 10));

      const item = manager.getItem('gemma-e2b');
      expect(item?.state).toBe('pending_cellular_approval');

      // Approve cellular → should proceed
      manager.approveCellular('gemma-e2b');
      await promise;

      expect(manager.getItem('gemma-e2b')?.state).toBe('completed');
    });

    it('should skip cellular warning when enableCellularWarning is false', async () => {
      const network = makeNetworkAdapter('cellular');
      const manager = new ModelDownloadManager(
        makeConfig({ network, enableCellularWarning: false }),
      );
      addTestModel(manager, 'gemma-e2b');

      await manager.startAll();
      expect(manager.getItem('gemma-e2b')?.state).toBe('completed');
    });
  });

  describe('pause and resume', () => {
    it('should allow pausing a running download', async () => {
      const { adapter } = makeAsyncAdapter(100); // 100ms total download
      const manager = new ModelDownloadManager(makeConfig({ fileAdapter: adapter }));
      addTestModel(manager, 'slow-model');

      const promise = manager.startAll();

      // Wait a bit then pause
      await new Promise((r) => setTimeout(r, 30));
      manager.pause('slow-model');

      const paused = manager.getItem('slow-model');
      expect(paused?.state).toBe('paused');

      // Resume
      manager.resume('slow-model');
      await promise;

      expect(manager.getItem('slow-model')?.state).toBe('completed');
    });

    it('should not affect completed items on pause', async () => {
      const manager = new ModelDownloadManager(makeConfig());
      addTestModel(manager, 'gemma-e2b');
      await manager.startAll();

      manager.pause('gemma-e2b');
      expect(manager.getItem('gemma-e2b')?.state).toBe('completed');
    });
  });

  describe('cancel', () => {
    it('should mark item as failed with cancelled error', () => {
      const manager = new ModelDownloadManager(makeConfig());
      addTestModel(manager, 'gemma-e2b');

      manager.cancel('gemma-e2b');
      const item = manager.getItem('gemma-e2b');
      expect(item?.state).toBe('failed');
      expect(item?.error?.type).toBe('cancelled');
    });
  });

  describe('tempPathForModel', () => {
    it('should append .partial to the destination path', () => {
      expect(tempPathForModel('/models/gemma.gguf')).toBe('/models/gemma.gguf.partial');
      expect(tempPathForModel('/models/qwen.gguf')).toBe('/models/qwen.gguf.partial');
    });
  });

  describe('sequential download queue', () => {
    it('should download all items sequentially', async () => {
      const downloadCalls: string[] = [];
      const { adapter } = makeAsyncAdapter(10);
      // Override downloadRange to track calls
      (adapter.downloadRange as ReturnType<typeof vi.fn>).mockImplementation(
        async (opts: { url: string }) => {
          downloadCalls.push(opts.url);
          return { fileSize: 1_000_000 };
        },
      );

      const manager = new ModelDownloadManager(makeConfig({ fileAdapter: adapter }));
      addTestModel(manager, 'model-a');
      addTestModel(manager, 'model-b');

      await manager.startAll();

      expect(downloadCalls).toEqual([
        'https://cdn.example.com/model-a.gguf',
        'https://cdn.example.com/model-b.gguf',
      ]);
      expect(manager.getItem('model-a')?.state).toBe('completed');
      expect(manager.getItem('model-b')?.state).toBe('completed');
    });
  });
});
