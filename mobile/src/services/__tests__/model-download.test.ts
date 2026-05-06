import { ModelDownloadService } from '../model-download';
import { MMKV } from 'react-native-mmkv';
import * as FileSystem from 'expo-file-system';
import NetInfoDefault from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';

const TEST_PARAMS = { fileName: 'gemma-2-2b-q4_0.gguf', cdnUrl: 'https://cdn.example.com/models/gemma-2-2b-q4_0.gguf', expectedSha256: 'a'.repeat(64), totalBytes: 1_500_000_000, finalDir: '/mock/document/models/' };

// Override retry delays to 1ms so tests don't wait 5+ seconds per retry.
jest.mock('../model-download-types', () => ({
  ...jest.requireActual('../model-download-types'),
  RETRY_DELAYS_MS: [1, 1, 1],
  STUCK_TIMEOUT_MS: 60000,
  MAX_RETRIES: 3,
}));

// Reset mock module-scoped state AND MMKV before each test.
beforeEach(() => {
  const fs = require('expo-file-system');
  const crypto = require('expo-crypto');
  const netinfo = require('@react-native-community/netinfo');
  if (typeof fs.__resetMockFs === 'function') fs.__resetMockFs();
  if (typeof crypto.__resetMockHash === 'function') crypto.__resetMockHash();
  if (typeof netinfo.__resetNetInfo === 'function') netinfo.__resetNetInfo();
  // Clear MMKV persisted state (singleton survives between tests)
  const store = new MMKV({ id: 'model_download' });
  store.clearAll();
});

describe('ModelDownloadService — happy path', () => {
  it('downloads and verifies a model successfully', async () => {
    const svc = new ModelDownloadService();
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    await svc.downloadModel(TEST_PARAMS);
    expect(calls).toContainEqual({ status: 'downloading' });
    expect(calls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
  it('skips download when already downloaded', async () => {
    const svc = new ModelDownloadService();
    const store = new MMKV({ id: 'model_download' });
    store.set('download.completed', JSON.stringify([TEST_PARAMS.fileName]));
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    await svc.downloadModel(TEST_PARAMS);
    expect(calls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
});

describe('ModelDownloadService — connectivity loss', () => {
  it('pauses when Wi-Fi is lost', async () => {
    // Use require() to access the same cached mock module the service uses.
    const netinfo = require('@react-native-community/netinfo');
    netinfo.__setConnected(false);

    const svc = new ModelDownloadService();
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    svc.onStatusChange((s) => calls.push({ status: s }));
    await svc.downloadModel(TEST_PARAMS);
    expect(calls).toContainEqual({ status: 'paused' });
    svc.destroy();
  });
});

describe('ModelDownloadService — disk space', () => {
  it('fails when disk space is insufficient', async () => {
    const fs = require('expo-file-system');
    fs.__setFreeDiskStorage(100 * 1024 * 1024);

    const svc = new ModelDownloadService();
    const calls: Array<{ status: string; error?: { code: string } }> = [];
    svc.onProgress((p) => calls.push({ status: p.status, error: p.error }));
    await svc.downloadModel(TEST_PARAMS);
    const failCall = calls.find((c) => c.status === 'failed' && c.error?.code === 'disk_insufficient');
    expect(failCall).toBeDefined();
    svc.destroy();
  });
});

describe('ModelDownloadService — CDN unreachable', () => {
  it('retries and fails when CDN returns error status', async () => {
    const fs = require('expo-file-system');
    fs.__setDownloadStatus(503);

    const svc = new ModelDownloadService();
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    await svc.downloadModel(TEST_PARAMS);
    expect(calls).toContainEqual({ status: 'failed' });
    svc.destroy();
  });
});

describe('ModelDownloadService — hash mismatch', () => {
  it('fails with hash_mismatch when computed hash differs', async () => {
    const crypto = require('expo-crypto');
    crypto.__setMockHash('different_hash_value_here_12345');

    const badParams = { ...TEST_PARAMS, expectedSha256: 'bad'.repeat(64) };
    const svc = new ModelDownloadService();
    const calls: Array<{ status: string; error?: { code: string } }> = [];
    svc.onProgress((p) => calls.push({ status: p.status, error: p.error }));
    await svc.downloadModel(badParams);
    const f = calls.find((c) => c.status === 'failed' && c.error?.code === 'hash_mismatch');
    expect(f).toBeDefined();
    svc.destroy();
  });
});

describe('ModelDownloadService — resume from partial', () => {
  it('loads persisted state and continues download', async () => {
    const store = new MMKV({ id: 'model_download' });
    store.set(`download.state.${TEST_PARAMS.fileName}`, JSON.stringify({
      fileName: TEST_PARAMS.fileName, cdnUrl: TEST_PARAMS.cdnUrl,
      expectedSha256: TEST_PARAMS.expectedSha256, totalBytes: TEST_PARAMS.totalBytes,
      downloadedBytes: 500_000_000, tempFilePath: '/mock/cache/g.gguf.part',
      finalFilePath: '/mock/document/models/g.gguf', retryCount: 0,
      status: 'downloading', lastProgressTimestamp: Date.now(),
    }));
    const svc = new ModelDownloadService();
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    await svc.downloadModel(TEST_PARAMS);
    // Should complete the download (mock always returns status 200 + matching hash).
    expect(calls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
  it('skips resume when final file already exists and hash is valid', async () => {
    // getInfoAsync returns exists: true by default in some mocks.
    // If the file exists and hash matches, it should complete immediately.
    const store = new MMKV({ id: 'model_download' });
    store.set(`download.state.${TEST_PARAMS.fileName}`, JSON.stringify({
      fileName: TEST_PARAMS.fileName, cdnUrl: TEST_PARAMS.cdnUrl,
      expectedSha256: 'a'.repeat(64), totalBytes: TEST_PARAMS.totalBytes,
      downloadedBytes: 500_000_000, tempFilePath: '/mock/cache/g.gguf.part',
      finalFilePath: '/mock/document/models/g.gguf', retryCount: 0,
      status: 'downloading', lastProgressTimestamp: Date.now(),
    }));
    // Make getInfoAsync return exists: true for the final file.
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true, uri: '/mock/document/models/g.gguf' });
    const svc = new ModelDownloadService();
    const calls: Array<{ status: string }> = [];
    svc.onProgress((p) => calls.push({ status: p.status }));
    await svc.downloadModel(TEST_PARAMS);
    expect(calls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
});

describe('i18n — model download strings', () => {
  it('has all error strings in English', () => {
    const en = require('../../i18n/locales/en.json');
    const e = en.modelDownload.errors;
    expect(e.connectivity_lost).toBeTruthy();
    expect(e.disk_insufficient).toBeTruthy();
    expect(e.cdn_unreachable).toBeTruthy();
    expect(e.hash_mismatch).toBeTruthy();
    expect(e.download_stuck).toBeTruthy();
    expect(e.unknown_error).toBeTruthy();
  });
  it('has all error strings in zh-Hans', () => {
    const zh = require('../../i18n/locales/zh-Hans.json');
    const e = zh.modelDownload.errors;
    expect(e.connectivity_lost).toBeTruthy();
    expect(e.disk_insufficient).toBeTruthy();
    expect(e.cdn_unreachable).toBeTruthy();
    expect(e.hash_mismatch).toBeTruthy();
    expect(e.download_stuck).toBeTruthy();
    expect(e.unknown_error).toBeTruthy();
  });
  it('has top-level download strings in both locales', () => {
    const en = require('../../i18n/locales/en.json');
    const zh = require('../../i18n/locales/zh-Hans.json');
    expect(en.modelDownload.title).toBeTruthy();
    expect(zh.modelDownload.title).toBeTruthy();
  });
});
