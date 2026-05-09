import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useModelDownload } from '../useModelDownload';
import {
  createInMemoryFs,
  createInMemoryCrypto,
  createMockFetch,
  makeTask,
  KNOWN_HASH,
} from '../../services/__tests__/test-apis';

function setup() {
  const { api: fs } = createInMemoryFs(50 * 1024 * 1024 * 1024);
  const { api: crypto } = createInMemoryCrypto();
  const testBody = new Uint8Array([1, 2, 3, 4]);
  const { api: fetchApi } = createMockFetch([
    { ok: true, status: 200, headers: new Map(), body: testBody },
    { ok: true, status: 200, headers: new Map(), body: testBody },
    { ok: true, status: 200, headers: new Map(), body: testBody },
  ]);

  return { fs, crypto, fetchApi, testBody };
}

describe('useModelDownload', () => {
  it('returns idle state initially', () => {
    const { fs, crypto, fetchApi } = setup();

    const { result } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isDownloading).toBe(false);
    expect(result.current.isDone).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.errorI18nKey).toBeNull();
  });

  it('transitions to done after successful download', async () => {
    const { fs, crypto, fetchApi } = setup();

    const { result } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    const task = makeTask({ sizeBytes: 4, sha256: KNOWN_HASH });

    await act(async () => {
      result.current.start([task]);
    });

    await waitFor(() => {
      expect(result.current.isDone).toBe(true);
    });
    expect(result.current.progress.phase).toBe('done');
  });

  it('exposes pause action after starting download', async () => {
    const { fs, crypto, fetchApi } = setup();

    const { result } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    const task = makeTask({ sizeBytes: 4, sha256: KNOWN_HASH });

    await act(async () => {
      result.current.start([task]);
    });

    // Wait for the coordinator to be created and download to start
    await waitFor(() => {
      expect(result.current.isDownloading || result.current.isDone).toBe(true);
    });

    act(() => {
      result.current.pause();
    });

    // After pause, the coordinator updates its internal state
    expect(result.current.isPaused).toBe(true);
  });

  it('exposes cancel action that resets state', async () => {
    const { fs, crypto, fetchApi } = setup();

    const { result } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    const task = makeTask({ sizeBytes: 4, sha256: KNOWN_HASH });

    await act(async () => {
      result.current.start([task]);
    });

    await waitFor(() => {
      expect(result.current.isDone).toBe(true);
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('sets error state on network failure', async () => {
    const { api: fs } = createInMemoryFs(50 * 1024 * 1024 * 1024);
    const { api: crypto } = createInMemoryCrypto();
    const { api: fetchApi } = createMockFetch([]);

    const { result } = renderHook(() =>
      useModelDownload({
        fs,
        crypto,
        fetch: fetchApi,
        maxRetries: 1,
        retryDelayMs: 0,
      }),
    );

    const task = makeTask({ sizeBytes: 4 });

    await act(async () => {
      result.current.start([task]);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.errorI18nKey).toBe(
      'modelDownload.errors.connectivity_lost',
    );
  });

  it('sets error state on disk full', async () => {
    const { api: fs } = createInMemoryFs(100);
    const { api: crypto } = createInMemoryCrypto();
    const { api: fetchApi } = createMockFetch([]);

    const { result } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    const task = makeTask({ sizeBytes: 10000000 });

    await act(async () => {
      result.current.start([task]);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.errorI18nKey).toBe(
      'modelDownload.errors.disk_insufficient',
    );
  });

  it('cleans up on unmount', () => {
    const { fs, crypto, fetchApi } = setup();

    const { unmount } = renderHook(() =>
      useModelDownload({ fs, crypto, fetch: fetchApi }),
    );

    expect(() => unmount()).not.toThrow();
  });
});
