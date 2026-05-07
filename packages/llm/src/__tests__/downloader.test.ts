/**
 * @tutor-sg/llm — Tests for the download engine.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadFile, exponentialBackoff } from '../downloader';
import type { FileDownloadAdapter, DownloadOptions } from '../types';

// ─── Smart Mock Filesystem ──────────────────────────────────────────

/**
 * In-memory filesystem mock that tracks file creation, deletion, and sizes
 * so getFileSize returns realistic values that change as downloads proceed.
 */
class MockFileSystem {
  private files = new Map<string, { size: number; content: Uint8Array }>();

  reset(): void {
    this.files.clear();
  }

  setFile(path: string, size: number): void {
    this.files.set(path, { size, content: new Uint8Array(size) });
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  size(path: string): number {
    return this.files.get(path)?.size ?? 0;
  }

  delete(path: string): void {
    this.files.delete(path);
  }

  move(from: string, to: string): void {
    const f = this.files.get(from);
    if (f) {
      this.files.set(to, f);
      this.files.delete(from);
    }
  }

  /** Simulate writing downloaded content. */
  writeDownload(path: string, size: number): void {
    this.files.set(path, { size, content: new Uint8Array(size) });
  }
}

function createSmartAdapter(
  fs: MockFileSystem,
  override?: Partial<FileDownloadAdapter>,
): FileDownloadAdapter {
  return {
    fileExists: vi.fn(async (path) => fs.exists(path)),
    getFileSize: vi.fn(async (path) => fs.size(path)),
    deleteFile: vi.fn(async (path) => fs.delete(path)),
    moveFile: vi.fn(async (from, to) => fs.move(from, to)),
    getFreeSpace: vi.fn(async () => 100_000_000_000),
    sha256: vi.fn(async (_path) => 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1'),
    downloadRange: vi.fn(async (opts) => {
      // Simulate successful download — write the file to the mock fs
      fs.writeDownload(opts.destPath, opts.expectedSize - opts.offset);
      opts.onProgress?.(opts.expectedSize, opts.expectedSize);
      return { fileSize: opts.expectedSize };
    }),
    ...override,
  };
}

function makeDefaultOptions(adapter: FileDownloadAdapter): DownloadOptions {
  return {
    url: 'https://cdn.example.com/models/test.gguf',
    destinationPath: '/models/test.gguf',
    tempPath: '/models/test.gguf.partial',
    expectedSize: 1_000_000,
    expectedSha256: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    maxRetries: 3,
    fileAdapter: adapter,
  };
}

describe('downloadFile', () => {
  let fs: MockFileSystem;

  beforeEach(() => {
    fs = new MockFileSystem();
    vi.clearAllMocks();
  });

  it('should complete a successful download', async () => {
    const adapter = createSmartAdapter(fs);
    const result = await downloadFile(makeDefaultOptions(adapter));

    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/models/test.gguf');
    expect(result.retriesConsumed).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it('should resume from existing partial file', async () => {
    fs.setFile('/models/test.gguf.partial', 500_000); // 500 KB partial

    const adapter = createSmartAdapter(fs, {
      downloadRange: vi.fn(async (opts) => {
        expect(opts.offset).toBe(500_000); // Should resume from existing offset
        // After download, total on disk = offset + remaining = expectedSize
        fs.writeDownload(opts.destPath, opts.expectedSize);
        opts.onProgress?.(opts.expectedSize, opts.expectedSize);
        return { fileSize: opts.expectedSize - opts.offset };
      }),
    });

    const result = await downloadFile(makeDefaultOptions(adapter));
    expect(result.success).toBe(true);
  });

  it('should delete corrupt partial file (bigger than expected)', async () => {
    fs.setFile('/models/test.gguf.partial', 2_000_000); // Bigger than expected!

    const adapter = createSmartAdapter(fs, {
      downloadRange: vi.fn(async (opts) => {
        expect(opts.offset).toBe(0); // Should start fresh after delete
        fs.writeDownload(opts.destPath, opts.expectedSize);
        opts.onProgress?.(opts.expectedSize, opts.expectedSize);
        return { fileSize: opts.expectedSize };
      }),
    });

    const result = await downloadFile(makeDefaultOptions(adapter));
    expect(result.success).toBe(true);
    expect(fs.exists('/models/test.gguf.partial')).toBe(false); // temp was moved
    expect(fs.exists('/models/test.gguf')).toBe(true); // final exists
  });

  it('should retry with exponential backoff on network error', async () => {
    let callCount = 0;
    const adapter = createSmartAdapter(fs, {
      downloadRange: vi.fn(async (opts) => {
        callCount++;
        if (callCount <= 2) {
          throw { type: 'network', message: 'Connection lost', retryable: true };
        }
        fs.writeDownload(opts.destPath, opts.expectedSize);
        opts.onProgress?.(opts.expectedSize, opts.expectedSize);
        return { fileSize: opts.expectedSize };
      }),
    });

    const result = await downloadFile(makeDefaultOptions(adapter));
    expect(result.success).toBe(true);
    expect(result.retriesConsumed).toBe(2);
  });

  it('should give up after max retries', async () => {
    const adapter = createSmartAdapter(fs, {
      downloadRange: vi.fn(async () => {
        throw { type: 'network', message: 'Connection lost', retryable: true };
      }),
    });

    const result = await downloadFile({
      ...makeDefaultOptions(adapter),
      maxRetries: 2,
    });
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('network');
    expect(result.retriesConsumed).toBe(2);
  });

  it('should detect storage errors before downloading', async () => {
    const adapter = createSmartAdapter(fs, {
      getFreeSpace: vi.fn(async () => 1_000), // Only ~1 KB free
    });

    const result = await downloadFile({
      ...makeDefaultOptions(adapter),
      expectedSize: 1_000_000_000, // 1 GB — will fail storage check
    });
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('storage');
    expect(result.retriesConsumed).toBe(0);
  });

  it('should fail on integrity mismatch', async () => {
    const adapter = createSmartAdapter(fs, {
      sha256: vi.fn(async () => 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
    });

    const result = await downloadFile({
      ...makeDefaultOptions(adapter),
      maxRetries: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('integrity');
  });

  it('should retry once on integrity failure if retries remain', async () => {
    let shaCalls = 0;
    const adapter = createSmartAdapter(fs, {
      sha256: vi.fn(async () => {
        shaCalls++;
        if (shaCalls === 1) return 'badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad1';
        return 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1';
      }),
    });

    const result = await downloadFile({
      ...makeDefaultOptions(adapter),
      maxRetries: 2,
    });
    expect(result.success).toBe(true);
    expect(result.retriesConsumed).toBe(1);
  });

  it('should handle cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    const adapter = createSmartAdapter(fs, {
      downloadRange: vi.fn(async (_opts) => {
        controller.abort();
        throw { type: 'cancelled', message: 'Cancelled', retryable: false };
      }),
    });

    const result = await downloadFile({
      ...makeDefaultOptions(adapter),
      signal: controller.signal,
    });
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('cancelled');
  });

  it('should invoke progress callback', async () => {
    const adapter = createSmartAdapter(fs);
    const progressFn = vi.fn();
    await downloadFile({ ...makeDefaultOptions(adapter), onProgress: progressFn });

    expect(progressFn).toHaveBeenCalled();
    const progress = progressFn.mock.calls[0]?.[0];
    expect(progress).toBeDefined();
    expect(progress).toHaveProperty('percent');
    expect(progress).toHaveProperty('bytesDownloaded');
    expect(progress).toHaveProperty('totalBytes');
    expect(progress).toHaveProperty('speedBytesPerSec');
  });

  it('should invoke state change callback', async () => {
    const adapter = createSmartAdapter(fs);
    const stateFn = vi.fn();
    await downloadFile({ ...makeDefaultOptions(adapter), onStateChange: stateFn });

    expect(stateFn).toHaveBeenCalledWith('completed');
  });
});

describe('exponentialBackoff', () => {
  it('should produce increasing delays', () => {
    const delays = [1, 2, 3].map((a) => exponentialBackoff.delayMs(a));
    expect(delays[0]!).toBeLessThan(delays[1]!);
    expect(delays[1]!).toBeLessThan(delays[2]!);
  });

  it('should cap at 30 seconds', () => {
    const delay = exponentialBackoff.delayMs(10); // Would be 512s without cap
    expect(delay).toBeLessThanOrEqual(30_000);
  });

  it('should add jitter (not return exact power of 2 every time)', () => {
    const delays = Array.from({ length: 10 }, () => exponentialBackoff.delayMs(2));
    const unique = new Set(delays);
    expect(unique.size).toBeGreaterThan(1);
  });
});
