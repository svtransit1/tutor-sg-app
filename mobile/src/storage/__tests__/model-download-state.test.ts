/**
 * Unit tests for model download state persistence.
 */

import {
  persistDownloadState,
  loadDownloadState,
  clearDownloadState,
  markModelDownloaded,
  isModelDownloaded,
  listIncompleteDownloads,
  getCompletedDownloads,
  resetDownloadCompletion,
} from '../model-download-state';

const TEST_STATE = {
  fileName: 'test-model.gguf',
  cdnUrl: 'https://cdn.example.com/test.gguf',
  expectedSha256: 'abc123',
  totalBytes: 1_000_000,
  downloadedBytes: 500_000,
  tempFilePath: '/tmp/test.gguf.part',
  finalFilePath: '/models/test.gguf',
  retryCount: 0,
  status: 'downloading' as const,
  lastProgressTimestamp: Date.now(),
};

describe('model-download-state persistence', () => {
  it('persists and loads download state', () => {
    persistDownloadState(TEST_STATE);
    const loaded = loadDownloadState(TEST_STATE.fileName);
    expect(loaded).toEqual(TEST_STATE);
  });

  it('returns null for non-existent state', () => {
    const loaded = loadDownloadState('nonexistent.gguf');
    expect(loaded).toBeNull();
  });

  it('clears download state', () => {
    persistDownloadState(TEST_STATE);
    clearDownloadState(TEST_STATE.fileName);
    expect(loadDownloadState(TEST_STATE.fileName)).toBeNull();
  });

  it('lists incomplete downloads', () => {
    clearDownloadState(TEST_STATE.fileName);
    persistDownloadState(TEST_STATE);
    const incomplete = listIncompleteDownloads();
    expect(incomplete).toContain('test-model.gguf');
  });

  it('marks model as downloaded and removes state', () => {
    persistDownloadState(TEST_STATE);
    markModelDownloaded(TEST_STATE.fileName);
    expect(isModelDownloaded(TEST_STATE.fileName)).toBe(true);
    expect(loadDownloadState(TEST_STATE.fileName)).toBeNull();
  });

  it('returns false for non-downloaded models', () => {
    expect(isModelDownloaded('never-downloaded.gguf')).toBe(false);
  });

  it('lists completed downloads', () => {
    markModelDownloaded(TEST_STATE.fileName);
    const completed = getCompletedDownloads();
    expect(completed).toContain('test-model.gguf');
  });

  it('resets download completion', () => {
    markModelDownloaded(TEST_STATE.fileName);
    resetDownloadCompletion();
    expect(getCompletedDownloads()).toEqual([]);
  });
});
