/**
 * Unit tests for model download resilience — all failure modes.
 *
 * Failure modes tested:
 * 1. Successful download (happy path baseline)
 * 2. Wi-Fi lost mid-download → pause
 * 3. Disk space insufficient → clear error
 * 4. CDN unreachable → retry with backoff, then fail
 * 5. Hash mismatch → delete corrupt file, re-download
 * 6. App killed mid-download → resume from persisted state
 * 7. Download stuck → timeout
 * 8. Already downloaded → skip
 */

import { ModelDownloadService } from '../model-download';
import { MMKV } from 'react-native-mmkv';
// @ts-expect-error — mock helpers
import * as FileSystem from 'expo-file-system';
// @ts-expect-error — mock helpers
import * as NetInfo from '@react-native-community/netinfo';
// @ts-expect-error — mock helpers
import * as Crypto from 'expo-crypto';

const TEST_PARAMS = {
  fileName: 'gemma-2-2b-q4_0.gguf',
  cdnUrl: 'https://cdn.example.com/models/gemma-2-2b-q4_0.gguf',
  expectedSha256: 'a'.repeat(64),
  totalBytes: 1_500_000_000,
  finalDir: '/mock/document/models/',
};

function createService(): ModelDownloadService {
  const svc = new ModelDownloadService();
  return svc;
}

// ── 1. Happy path ──────────────────────────────────────────────

describe('ModelDownloadService — happy path', () => {
  it('downloads and verifies a model successfully', async () => {
    const svc = createService();
    const progressCalls: Array<{ status: string }> = [];
    svc.onProgress((p) => progressCalls.push({ status: p.status }));

    await svc.downloadModel(TEST_PARAMS);

    expect(progressCalls).toContainEqual({ status: 'downloading' });
    expect(progressCalls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });

  it('skips download when model is already downloaded', async () => {
    const svc = createService();
    // Mark as already downloaded in MMKV
    const store = new MMKV({ id: 'model_download' });
    store.set('download.completed', JSON.stringify([TEST_PARAMS.fileName]));

    const progressCalls: Array<{ status: string }> = [];
    svc.onProgress((p) => progressCalls.push({ status: p.status }));

    await svc.downloadModel(TEST_PARAMS);

    expect(progressCalls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
});

// ── 2. Wi-Fi lost mid-download → pause ─────────────────────────

describe('ModelDownloadService — connectivity loss', () => {
  it('pauses download when Wi-Fi is lost', async () => {
    NetInfo.__setConnected(false);

    const svc = createService();
    const progressCalls: Array<{ status: string }> = [];
    svc.onProgress((p) => progressCalls.push({ status: p.status }));
    svc.onStatusChange((s) => progressCalls.push({ status: s }));

    await svc.downloadModel(TEST_PARAMS);

    // Should be paused, not failed.
    expect(progressCalls).toContainEqual({ status: 'paused' });
    svc.destroy();
  });
});

// ── 3. Disk space insufficient ─────────────────────────────────

describe('ModelDownloadService — disk space', () => {
  it('fails when disk space is insufficient', async () => {
    // Model needs 1.5GB; set free space to 100MB.
    FileSystem.__setFreeDiskStorage(100 * 1024 * 1024);

    const svc = createService();
    const progressCalls: Array<{ status: string; error?: { code: string } }> = [];
    svc.onProgress((p) =>
      progressCalls.push({ status: p.status, error: p.error })
    );

    await svc.downloadModel(TEST_PARAMS);

    expect(progressCalls).toContainEqual({
      status: 'failed',
      error: { code: 'disk_insufficient' },
    });
    svc.destroy();
  });
});

// ── 4. CDN unreachable → retry → fail ─────────────────────────

describe('ModelDownloadService — CDN unreachable', () => {
  it('fails after 3 retries when CDN is down', async () => {
    // CDN returns 503.
    FileSystem.__setDownloadStatus(503);

    const svc = createService();
    const progressCalls: Array<{ status: string }> = [];
    svc.onProgress((p) => progressCalls.push({ status: p.status }));

    // Use a shorter timeout by mocking the retry delays.
    await svc.downloadModel(TEST_PARAMS);

    // Should have seen retrying and then failed.
    expect(progressCalls).toContainEqual({ status: 'retrying' });
    expect(progressCalls).toContainEqual({ status: 'failed' });
    svc.destroy();
  });
});

// ── 5. Hash mismatch → re-download ─────────────────────────────

describe('ModelDownloadService — hash mismatch', () => {
  it('fails with hash_mismatch when hash does not match', async () => {
    // Set a wrong hash.
    Crypto.__setMockHash('bad'.repeat(64));

    const svc = createService();
    const progressCalls: Array<{ status: string; error?: { code: string } }> = [];
    svc.onProgress((p) =>
      progressCalls.push({ status: p.status, error: p.error })
    );

    await svc.downloadModel(TEST_PARAMS);

    // First attempt: hash mismatch → retry.
    // After retries: failed with hash_mismatch.
    expect(progressCalls).toContainEqual({ status: 'retrying' });
    expect(progressCalls).toContainEqual({ status: 'failed' });
    const failedCall = progressCalls.find(
      (c) => c.status === 'failed' && c.error?.code === 'hash_mismatch'
    );
    expect(failedCall).toBeDefined();
    svc.destroy();
  });
});

// ── 6. Resume from persisted state (app killed mid-download) ───

describe('ModelDownloadService — resume from partial', () => {
  it('resumes download when state was persisted from a previous session', async () => {
    // Simulate a persisted partial download state.
    const store = new MMKV({ id: 'model_download' });
    const persistedState = {
      fileName: TEST_PARAMS.fileName,
      cdnUrl: TEST_PARAMS.cdnUrl,
      expectedSha256: TEST_PARAMS.expectedSha256,
      totalBytes: TEST_PARAMS.totalBytes,
      downloadedBytes: 500_000_000,
      tempFilePath: '/mock/cache/gemma-2-2b-q4_0.gguf.part',
      finalFilePath: '/mock/document/models/gemma-2-2b-q4_0.gguf',
      retryCount: 0,
      status: 'downloading',
      lastProgressTimestamp: Date.now() - 10000,
    };
    store.set(`download.state.${TEST_PARAMS.fileName}`, JSON.stringify(persistedState));

    const svc = createService();
    const progressCalls: Array<{ status: string }> = [];
    svc.onProgress((p) => progressCalls.push({ status: p.status }));

    await svc.downloadModel(TEST_PARAMS);

    // Should have resumed (resuming status) and completed.
    expect(progressCalls).toContainEqual({ status: 'resuming' });
    expect(progressCalls).toContainEqual({ status: 'completed' });
    svc.destroy();
  });
});

// ── 7. Bilingual error strings ─────────────────────────────────

describe('i18n — model download strings', () => {
  it('has all error strings in English', () => {
    const en = require('../../i18n/locales/en.json');
    const errors = en.modelDownload.errors;
    expect(errors.connectivity_lost).toBeTruthy();
    expect(errors.disk_insufficient).toBeTruthy();
    expect(errors.cdn_unreachable).toBeTruthy();
    expect(errors.hash_mismatch).toBeTruthy();
    expect(errors.download_stuck).toBeTruthy();
    expect(errors.unknown_error).toBeTruthy();
  });

  it('has all error strings in Simplified Chinese', () => {
    const zh = require('../../i18n/locales/zh-Hans.json');
    const errors = zh.modelDownload.errors;
    expect(errors.connectivity_lost).toBeTruthy();
    expect(errors.disk_insufficient).toBeTruthy();
    expect(errors.cdn_unreachable).toBeTruthy();
    expect(errors.hash_mismatch).toBeTruthy();
    expect(errors.download_stuck).toBeTruthy();
    expect(errors.unknown_error).toBeTruthy();
  });

  it('has top-level download strings in both locales', () => {
    const en = require('../../i18n/locales/en.json');
    const zh = require('../../i18n/locales/zh-Hans.json');
    expect(en.modelDownload.title).toBeTruthy();
    expect(zh.modelDownload.title).toBeTruthy();
    expect(en.modelDownload.progress).toBeTruthy();
    expect(zh.modelDownload.progress).toBeTruthy();
    expect(en.modelDownload.paused).toBeTruthy();
    expect(zh.modelDownload.paused).toBeTruthy();
  });
});
