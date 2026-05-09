import { ModelDownloadCoordinator } from '../model-download-coordinator';
import type { DownloadProgress } from '../../models/model-download';
import type { ModelDownloadError } from '../../models/model-download-errors';
import {
  createInMemoryFs,
  createInMemoryCrypto,
  createMockFetch,
  makeTask,
  KNOWN_HASH,
} from './test-apis';

function createCoordinator(
  config: {
    maxRetries?: number;
    retryDelayMs?: number;
    maxRetryDelayMs?: number;
    stuckTimeoutMs?: number;
    diskSpaceBufferBytes?: number;
    fsFreeSpace?: number;
  } = {},
) {
  const { api: fs, state: fsState } = createInMemoryFs(
    config.fsFreeSpace ?? 50 * 1024 * 1024 * 1024,
  );
  const { api: crypto, setNextHash } = createInMemoryCrypto();
  const progressEvents: DownloadProgress[] = [];
  const errorEvents: ModelDownloadError[] = [];

  return {
    fs,
    fsState,
    crypto,
    setNextHash,
    progressEvents,
    errorEvents,
    buildCoordinator: (
      fetch: ReturnType<typeof createMockFetch>['api'],
    ) => {
      return new ModelDownloadCoordinator(
        {
          maxRetries: config.maxRetries ?? 3,
          retryDelayMs: config.retryDelayMs ?? 0,
          maxRetryDelayMs: config.maxRetryDelayMs ?? 100,
          stuckTimeoutMs: config.stuckTimeoutMs ?? 60000,
          diskSpaceBufferBytes: config.diskSpaceBufferBytes ?? 0,
          fs,
          crypto,
          fetch,
        },
        (p) => progressEvents.push(p),
        (e) => errorEvents.push(e),
      );
    },
  };
}

describe('ModelDownloadCoordinator', () => {
  describe('disk space check', () => {
    it('throws diskFullError when free space is insufficient', async () => {
      const { buildCoordinator, progressEvents, errorEvents } =
        createCoordinator({ fsFreeSpace: 1000 });

      const { api: fetch } = createMockFetch([]);
      const coordinator = buildCoordinator(fetch);
      const task = makeTask({ sizeBytes: 10000000 });

      await coordinator.start([task]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('error');
      expect(last.error).toBe('disk_insufficient');
      expect(errorEvents.length).toBeGreaterThanOrEqual(1);
      expect(errorEvents[0].code).toBe('disk_insufficient');
    });
  });

  describe('successful download', () => {
    it('completes a single file download with verification', async () => {
      const testBody = new Uint8Array([10, 20, 30, 40, 50]);
      const { buildCoordinator, progressEvents } = createCoordinator();

      const { api: fetch } = createMockFetch([
        {
          ok: true,
          status: 200,
          headers: new Map(),
          body: testBody,
        },
      ]);
      const coordinator = buildCoordinator(fetch);
      const task = makeTask({
        sizeBytes: testBody.byteLength,
        sha256: KNOWN_HASH,
      });

      await coordinator.start([task]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('done');
      expect(last.percent).toBe(100);
    });

    it('downloads multiple files sequentially', async () => {
      const { buildCoordinator, progressEvents } = createCoordinator();
      const body = new Uint8Array([1, 2, 3, 4]);

      const { api: fetch } = createMockFetch([
        { ok: true, status: 200, headers: new Map(), body },
        { ok: true, status: 200, headers: new Map(), body },
      ]);
      const coordinator = buildCoordinator(fetch);

      const task1 = makeTask({
        fileName: 'model1.gguf',
        destPath: '/app/documents/models/model1.gguf',
        sizeBytes: body.byteLength,
        sha256: KNOWN_HASH,
      });
      const task2 = makeTask({
        fileName: 'model2.gguf',
        destPath: '/app/documents/models/model2.gguf',
        sizeBytes: body.byteLength,
        sha256: KNOWN_HASH,
      });

      await coordinator.start([task1, task2]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('done');
      expect(last.totalFiles).toBe(2);
    });
  });

  describe('network errors', () => {
    it('retries on network failure and eventually reports connectivity_lost', async () => {
      const { buildCoordinator, progressEvents, errorEvents } =
        createCoordinator({ maxRetries: 2, retryDelayMs: 0 });

      const { api: fetch } = createMockFetch([]);
      const coordinator = buildCoordinator(fetch);
      const task = makeTask({ sizeBytes: 1000 });

      await coordinator.start([task]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('error');
      expect(last.error).toBe('connectivity_lost');
      expect(errorEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('hash mismatch', () => {
    it('fails with hash_mismatch after retry', async () => {
      const wrongHash =
        '0000000000000000000000000000000000000000000000000000000000000000';
      const { buildCoordinator, progressEvents, setNextHash } =
        createCoordinator({ maxRetries: 1, retryDelayMs: 0 });

      setNextHash(wrongHash);

      const testBody = new Uint8Array([1, 2, 3]);
      const { api: fetch } = createMockFetch([
        { ok: true, status: 200, headers: new Map(), body: testBody },
        { ok: true, status: 200, headers: new Map(), body: testBody },
      ]);
      const coordinator = buildCoordinator(fetch);
      const task = makeTask({
        sizeBytes: testBody.byteLength,
        sha256: KNOWN_HASH,
      });

      await coordinator.start([task]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('error');
      expect(last.error).toBe('hash_mismatch');
    });
  });

  describe('CDN unreachable', () => {
    it('emits cdn_unreachable on HTTP 500', async () => {
      const { buildCoordinator, progressEvents, errorEvents } =
        createCoordinator({ maxRetries: 0, retryDelayMs: 0 });

      const { api: fetch } = createMockFetch([
        {
          ok: false,
          status: 500,
          headers: new Map(),
          body: new Uint8Array(0),
        },
      ]);
      const coordinator = buildCoordinator(fetch);
      const task = makeTask({ sizeBytes: 100 });

      await coordinator.start([task]);

      const last = progressEvents[progressEvents.length - 1];
      expect(last.phase).toBe('error');
      const errorCodes = errorEvents.map((e) => e.code);
      expect(errorCodes).toContain('cdn_unreachable');
    });
  });

  describe('pause / resume', () => {
    it('sets phase to paused when pause is called', () => {
      const { buildCoordinator } = createCoordinator();
      const { api: fetch } = createMockFetch([]);
      const coordinator = buildCoordinator(fetch);

      coordinator.pause();

      expect(coordinator.state.phase).toBe('paused');
      expect(coordinator.isPaused).toBe(true);
    });
  });

  describe('cancel', () => {
    it('marks coordinator as cancelled', () => {
      const { buildCoordinator } = createCoordinator();
      const { api: fetch } = createMockFetch([]);
      const coordinator = buildCoordinator(fetch);

      coordinator.cancel();

      expect(coordinator.isCancelled).toBe(true);
    });
  });
});
