/**
 * @tutor-sg/llm — On-device LLM model download and management.
 *
 * Provides:
 * - `downloadFile()` — Core download engine with HTTP Range resume,
 *   exponential backoff retry (max 3), and SHA-256 integrity check
 * - `ModelDownloadManager` — Queue orchestrator with cellular warning
 *   gate, pause/resume, and state notifications
 * - Types for platform adapters (NetworkAdapter, FileDownloadAdapter)
 *
 * ## Quick start
 *
 * ```ts
 * import { ModelDownloadManager, tempPathForModel } from '@tutor-sg/llm';
 * import { ExpoFileDownloadAdapter } from '@tutor-sg/llm/expo-adapter';
 * import { ExpoNetworkAdapter } from '@tutor-sg/llm/expo-adapter';
 *
 * const manager = new ModelDownloadManager({
 *   network: new ExpoNetworkAdapter(),
 *   fileAdapter: new ExpoFileDownloadAdapter(),
 *   modelDir: FileSystem.documentDirectory + 'models/',
 *   tempDir: FileSystem.cacheDirectory + 'downloads/',
 *   onStateChange: (modelId, state, progress) => {
 *     console.log(`${modelId}: ${state} (${progress.percent}%)`);
 *   },
 *   enableCellularWarning: true,
 * });
 *
 * await manager.start();
 *
 * manager.addToQueue({
 *   modelId: 'gemma-e2b',
 *   url: 'https://cdn.example.com/models/gemma-2-2b.gguf',
 *   destinationPath: modelDir + 'gemma-e2b.gguf',
 *   tempPath: tempPathForModel(modelDir + 'gemma-e2b.gguf'),
 *   expectedSize: 700_000_000,
 *   expectedSha256: 'abc123...',
 * });
 *
 * await manager.startAll();
 * ```
 */

export { downloadFile, exponentialBackoff } from './downloader';
export { ModelDownloadManager, tempPathForModel } from './modelManager';
export type {
  // Adapter interfaces (implement these per platform)
  NetworkAdapter,
  NetworkState,
  NetworkType,
  FileDownloadAdapter,
  // Download types
  DownloadOptions,
  DownloadResult,
  DownloadState,
  DownloadProgress,
  DownloadError,
  DownloadErrorType,
  DownloadQueueItem,
  ModelDownloadManagerConfig,
  BackoffStrategy,
} from './types';
