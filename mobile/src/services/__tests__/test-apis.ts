import type { FsApi, CryptoApi, FetchApi } from '../model-download-coordinator';
import type { DownloadTask } from '../../models/model-download';

export interface FsState {
  files: Map<string, Uint8Array>;
  freeSpace: number;
}

export function createInMemoryFs(
  initialFreeSpace: number = 50 * 1024 * 1024 * 1024,
): {
  api: FsApi;
  state: FsState;
} {
  const state: FsState = {
    files: new Map(),
    freeSpace: initialFreeSpace,
  };

  const api: FsApi = {
    getDocumentDirectory(): string {
      return '/app/documents';
    },

    async getFreeDiskStorage(): Promise<number> {
      return state.freeSpace;
    },

    async makeDirectoryAsync(
      _path: string,
      _options?: { intermediates?: boolean },
    ): Promise<void> {},

    async moveAsync(_options: {
      from: string;
      to: string;
    }): Promise<void> {},

    async deleteAsync(
      path: string,
      _options?: { idempotent?: boolean },
    ): Promise<void> {
      state.files.delete(path);
    },

    async getInfoAsync(
      path: string,
    ): Promise<{ exists: boolean; size?: number }> {
      const data = state.files.get(path);
      return data ? { exists: true, size: data.byteLength } : { exists: false };
    },

    async writeAsync(
      path: string,
      contents: Uint8Array,
      options?: { append?: boolean },
    ): Promise<void> {
      if (options?.append) {
        const existing = state.files.get(path);
        if (existing) {
          const merged = new Uint8Array(
            existing.byteLength + contents.byteLength,
          );
          merged.set(existing, 0);
          merged.set(contents, existing.byteLength);
          state.files.set(path, merged);
          return;
        }
      }
      state.files.set(path, contents);
    },
  };

  return { api, state };
}

export function createInMemoryCrypto(): {
  api: CryptoApi;
  setNextHash: (hash: string) => void;
} {
  let nextHash =
    'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

  const api: CryptoApi = {
    async sha256FileAsync(_path: string): Promise<string> {
      return nextHash;
    },
  };

  return {
    api,
    setNextHash: (h: string) => {
      nextHash = h;
    },
  };
}

export type MockFetchResponse = {
  ok: boolean;
  status: number;
  headers: Map<string, string>;
  body: Uint8Array;
};

export function createMockFetch(
  responses: MockFetchResponse[],
): {
  api: FetchApi;
  calls: Array<{ url: string; headers: Record<string, string> }>;
} {
  const calls: Array<{ url: string; headers: Record<string, string> }> = [];

  const api: FetchApi = async (url, init) => {
    calls.push({ url, headers: init?.headers ?? {} });

    if (responses.length === 0) {
      throw new Error('network error: no mock responses');
    }

    const resp = responses.shift()!;

    return {
      ok: resp.ok,
      status: resp.status,
      headers: {
        get: (_name: string) => resp.headers.get(_name) ?? null,
      },
      arrayBuffer: async () => resp.body.buffer,
    };
  };

  return { api, calls };
}

export function makeTask(
  overrides: Partial<{
    modelFamily: string;
    paramCount: number;
    fileName: string;
    url: string;
    destPath: string;
    sizeBytes: number;
    sha256: string;
  }> = {},
): DownloadTask {
  return {
    modelFamily: overrides.modelFamily ?? 'gemma-2',
    paramCount: overrides.paramCount ?? 2,
    fileName: overrides.fileName ?? 'gemma-2-2b.gguf',
    url:
      overrides.url ?? 'https://cdn.example.com/models/gemma-2-2b.gguf',
    destPath:
      overrides.destPath ?? '/app/documents/models/gemma-2-2b.gguf',
    sizeBytes: overrides.sizeBytes ?? 1000000,
    sha256:
      overrides.sha256 ??
      'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
  };
}

export const KNOWN_HASH =
  'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
