import { persistDownloadState, loadDownloadState, clearDownloadState, markModelDownloaded, isModelDownloaded, listIncompleteDownloads, getCompletedDownloads, resetDownloadCompletion } from '../model-download-state';
const S = { fileName: 'test.gguf', cdnUrl: 'https://cdn.example.com/test.gguf', expectedSha256: 'abc123', totalBytes: 1_000_000, downloadedBytes: 500_000, tempFilePath: '/tmp/test.gguf.part', finalFilePath: '/models/test.gguf', retryCount: 0, status: 'downloading' as const, lastProgressTimestamp: Date.now() };
describe('model-download-state persistence', () => {
  it('persists and loads download state', () => { persistDownloadState(S); expect(loadDownloadState(S.fileName)).toEqual(S); });
  it('returns null for non-existent state', () => { expect(loadDownloadState('none.gguf')).toBeNull(); });
  it('clears download state', () => { persistDownloadState(S); clearDownloadState(S.fileName); expect(loadDownloadState(S.fileName)).toBeNull(); });
  it('lists incomplete downloads', () => { clearDownloadState(S.fileName); persistDownloadState(S); expect(listIncompleteDownloads()).toContain('test.gguf'); });
  it('marks model as downloaded', () => { persistDownloadState(S); markModelDownloaded(S.fileName); expect(isModelDownloaded(S.fileName)).toBe(true); expect(loadDownloadState(S.fileName)).toBeNull(); });
  it('returns false for non-downloaded models', () => { expect(isModelDownloaded('never.gguf')).toBe(false); });
  it('lists completed downloads', () => { markModelDownloaded(S.fileName); expect(getCompletedDownloads()).toContain('test.gguf'); });
  it('resets download completion', () => { markModelDownloaded(S.fileName); resetDownloadCompletion(); expect(getCompletedDownloads()).toEqual([]); });
});
