import * as FileSystem from 'expo-file-system';
import type { FsApi, CryptoApi, FetchApi } from './model-download-coordinator';

const MODELS_DIR = 'models';
const STATE_FILE = '.model-download-state.json';

export function getDocumentDir(): string { return FileSystem.documentDirectory; }
export function getModelsDir(): string { return `${FileSystem.documentDirectory}${MODELS_DIR}/`; }
export function getStateFilePath(): string { return `${FileSystem.documentDirectory}${STATE_FILE}`; }

export function createRealFs(): FsApi {
  return {
    getDocumentDirectory: () => FileSystem.documentDirectory,
    getFreeDiskStorage: async () => { const info = await FileSystem.getFreeDiskStorageAsync(); return info ?? 0; },
    makeDirectoryAsync: async (path, options) => { await FileSystem.makeDirectoryAsync(path, options); },
    moveAsync: async (options) => { await FileSystem.moveAsync(options); },
    deleteAsync: async (path, options) => { await FileSystem.deleteAsync(path, options); },
    getInfoAsync: async (path) => { const info = await FileSystem.getInfoAsync(path, { size: true }); return info.exists ? { exists: true, size: info.size } : { exists: false }; },
    writeAsync: async (path, contents, options) => {
      const base64 = uint8ArrayToBase64(contents);
      if (options?.append) {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) { const existing = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 }); await FileSystem.writeAsStringAsync(path, `${existing}${base64}`, { encoding: FileSystem.EncodingType.Base64 }); return; }
      }
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
    },
  };
}

export function createRealCrypto(): CryptoApi {
  return { sha256FileAsync: async (path) => { return await FileSystem.digestStringAsync(FileSystem.CryptoDigestAlgorithm.SHA256, path); } };
}

export function createRealFetch(): FetchApi {
  return async (url, init) => { const resp = await globalThis.fetch(url, init as RequestInit); return { ok: resp.ok, status: resp.status, headers: { get: (n: string) => resp.headers.get(n) }, arrayBuffer: async () => resp.arrayBuffer() }; };
}

function uint8ArrayToBase64(arr: Uint8Array): string {
  const c: string[] = [];
  for (let i = 0; i < arr.length; i += 0x8000) { c.push(String.fromCharCode(...arr.subarray(i, i + 0x8000))); }
  return btoa(c.join(''));
}

export interface DownloadEnv { fs: FsApi; crypto: CryptoApi; fetch: FetchApi; }
export function createRealDownloadEnv(): DownloadEnv { return { fs: createRealFs(), crypto: createRealCrypto(), fetch: createRealFetch() }; }
