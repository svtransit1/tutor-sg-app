/**
 * Debug test for the retry scenario
 */
import { test, expect } from 'vitest';
import { downloadFile } from '../downloader';
import type { FileDownloadAdapter } from '../types';

test('debug retry', async () => {
  class MockFS {
    files = new Map<string, number>();
    size(path: string) { return this.files.get(path) ?? 0; }
    writeDownload(path: string, size: number) { this.files.set(path, size); }
  }

  const fs = new MockFS();
  let callCount = 0;
  const adapter: FileDownloadAdapter = {
    fileExists: async (p) => fs.files.has(p),
    getFileSize: async (p) => fs.size(p),
    deleteFile: async (p) => { fs.files.delete(p); },
    moveFile: async (from, to) => {
      const s = fs.files.get(from);
      if (s !== undefined) { fs.files.set(to, s); fs.files.delete(from); }
    },
    getFreeSpace: async () => 100_000_000_000,
    sha256: async () => 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    downloadRange: async (opts) => {
      callCount++;
      if (callCount <= 2) {
        throw { type: 'network', message: 'Connection lost', retryable: true };
      }
      fs.writeDownload(opts.destPath, opts.expectedSize);
      opts.onProgress?.(opts.expectedSize, opts.expectedSize);
      return { fileSize: opts.expectedSize };
    },
  };

  const result = await downloadFile({
    url: 'https://cdn.example.com/test.gguf',
    destinationPath: '/models/test.gguf',
    tempPath: '/models/test.gguf.partial',
    expectedSize: 1_000_000,
    expectedSha256: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    maxRetries: 3,
    fileAdapter: adapter,
  });

  console.log('result:', JSON.stringify(result, null, 2));
  console.log('callCount:', callCount);
  console.log('fs files:', [...fs.files.entries()]);

  expect(result.success).toBe(true);
  expect(result.retriesConsumed).toBe(2);
});
