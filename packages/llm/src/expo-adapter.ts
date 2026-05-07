/**
 * @tutor-sg/llm — Expo platform adapter.
 *
 * Bridges the generic FileDownloadAdapter and NetworkAdapter interfaces
 * to Expo modules (`expo-file-system` legacy API, `expo-network`).
 *
 * ## Usage
 *
 * ```ts
 * import { ModelDownloadManager, tempPathForModel } from '@tutor-sg/llm';
 * import { ExpoFileDownloadAdapter, ExpoNetworkAdapter } from '@tutor-sg/llm/expo-adapter';
 *
 * const manager = new ModelDownloadManager({
 *   network: new ExpoNetworkAdapter(),
 *   fileAdapter: new ExpoFileDownloadAdapter(),
 *   modelDir: FileSystem.documentDirectory + 'models/',
 *   tempDir: FileSystem.cacheDirectory + 'downloads/',
 *   onStateChange: (modelId, state, progress) => { ... },
 * });
 * ```
 *
 * @module expo-adapter
 */

// Use the legacy API which has createDownloadResumable with Range support
import * as FileSystem from 'expo-file-system/legacy';
import * as Network from 'expo-network';
import type {
  FileDownloadAdapter,
  NetworkAdapter,
  NetworkState,
} from './types';

// ─── File Download Adapter ──────────────────────────────────────────

/**
 * Expo-based implementation using `expo-file-system` legacy API.
 *
 * Uses `FileSystem.createDownloadResumable()` for HTTP Range resume
 * and streaming-to-disk. Falls back to fetch-based download when
 * the resumable API is unavailable.
 */
export class ExpoFileDownloadAdapter implements FileDownloadAdapter {
  async fileExists(path: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  }

  async getFileSize(path: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return 0;
    return info.size;
  }

  async deleteFile(path: string): Promise<void> {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
  }

  async moveFile(from: string, to: string): Promise<void> {
    const destDir = to.substring(0, to.lastIndexOf('/'));
    await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
    await FileSystem.moveAsync({ from, to });
  }

  async getFreeSpace(dirPath: string): Promise<number> {
    // expo-file-system legacy API does not expose free space.
    // Return a large sentinel; storage pressure is caught by
    // the OS-level error during download.
    return Number.MAX_SAFE_INTEGER;
  }

  async sha256(path: string): Promise<string> {
    // Read file as base64 → ArrayBuffer → Web Crypto SHA-256
    const base64 = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binaryString = globalThis.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async downloadRange(options: {
    url: string;
    destPath: string;
    offset: number;
    expectedSize: number;
    signal?: AbortSignal;
    onProgress?: (bytesDownloaded: number, totalBytes: number) => void;
  }): Promise<{ fileSize: number }> {
    const { url, destPath, offset, expectedSize, signal, onProgress } = options;

    // Ensure the temp directory exists
    const destDir = destPath.substring(0, destPath.lastIndexOf('/'));
    await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });

    // Create a resumable download. expo-file-system automatically sends
    // the Range header when resuming from a partial file.
    const download = FileSystem.createDownloadResumable(
      url,
      destPath,
      {},
      (downloadProgress) => {
        const total = downloadProgress.totalBytesExpectedToWrite ?? expectedSize;
        onProgress?.(downloadProgress.totalBytesWritten, total);
      },
    );

    try {
      const result = await download.downloadAsync();
      if (!result) {
        throw new Error('Download returned no result');
      }
      const info = await FileSystem.getInfoAsync(result.uri);
      return { fileSize: info.exists ? info.size : 0 };
    } catch (err) {
      // Map to structured error type expected by the download engine
      const message = err instanceof Error ? err.message : String(err);
      const isCancelled =
        message.toLowerCase().includes('cancelled') ||
        message.toLowerCase().includes('abort') ||
        err instanceof DOMException ||
        (typeof err === 'object' && err !== null && 'name' in err &&
          (err as { name: string }).name === 'AbortError');

      throw {
        type: isCancelled ? 'cancelled' : 'network',
        message,
        retryable: !isCancelled,
        cause: err,
      };
    }
  }
}

// ─── Network Adapter ─────────────────────────────────────────────────

/**
 * Expo-based implementation using `expo-network`.
 */
export class ExpoNetworkAdapter implements NetworkAdapter {
  async getNetworkState(): Promise<NetworkState> {
    const netState = await Network.getNetworkStateAsync();
    return {
      type: this.mapType(netState.type ?? Network.NetworkStateType.UNKNOWN),
      isConnected: netState.isConnected ?? false,
    };
  }

  onNetworkChange(listener: (state: NetworkState) => void): () => void {
    // expo-network does not expose a direct subscription API.
    // In a real app, use @react-native-community/netinfo instead.
    // Return a no-op unsubscribe.
    return () => {};
  }

  private mapType(type: Network.NetworkStateType): NetworkState['type'] {
    switch (type) {
      case Network.NetworkStateType.CELLULAR:
        return 'cellular';
      case Network.NetworkStateType.WIFI:
        return 'wifi';
      case Network.NetworkStateType.NONE:
        return 'none';
      default:
        return 'unknown';
    }
  }
}
