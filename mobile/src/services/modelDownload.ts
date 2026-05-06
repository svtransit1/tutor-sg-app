/**
 * Model Download Service
 *
 * Handles downloading LLM model files from CDN with:
 * - Progress tracking (bytes + percentage)
 * - Pause / Resume (via expo-file-system/legacy DownloadResumable)
 * - Cancel support
 * - SHA-256 integrity verification
 * - Persistent state for crash recovery
 *
 * Architecture: pure functions + DownloadSession class (stateful lifecycle).
 * No React dependency — consumed by useModelDownload hook.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ModelRegistryEntry,
  ModelRegistry,
  DeviceTier,
} from '@tutor-sg/shared';
import { SAMPLE_REGISTRY } from '@tutor-sg/shared';

// ── Types ──────────────────────────────────────────────────────────

export type DownloadStatus =
  | 'idle'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface ModelDownloadState {
  /** The model entry being downloaded/verified. */
  entry: ModelRegistryEntry;
  /** Current status of this model's download. */
  status: DownloadStatus;
  /** Total size in bytes for this model. */
  totalBytes: number;
  /** Bytes written so far. */
  downloadedBytes: number;
  /** CDN URL currently being used (first in the mirror list). */
  currentUrl: string;
  /** Local file URI where the model is stored after download. */
  localUri: string;
  /** Error message if status is 'error'. */
  error?: string;
  /** SHA-256 verification result. */
  verified?: boolean;
  /** Resume data for pause/resume (opaque string from expo-file-system). */
  resumeData?: string;
}

export interface DownloadSessionState {
  /** List of all models to download (in order). */
  models: ModelDownloadState[];
  /** Index of the currently active model in `models`. */
  currentIndex: number;
  /** Overall session status. */
  sessionStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';
  /** Aggregate progress (0–1). */
  overallProgress: number;
  /** Total bytes across all models. */
  totalBytes: number;
  /** Total bytes downloaded across all models. */
  downloadedBytes: number;
}

export interface DownloadProgress {
  /** 0–1 progress of the current file. */
  fileProgress: number;
  /** 0–1 overall progress across all files. */
  overallProgress: number;
  /** Current file's downloaded / total bytes. */
  currentFileBytes: { downloaded: number; total: number };
  /** All files' total bytes. */
  overallBytes: { downloaded: number; total: number };
  /** Human-readable current file name. */
  currentFileName: string;
}

// ── Persistence keys ──────────────────────────────────────────────

const SESSION_STORAGE_KEY = '@tutor_sg:model_download_session';
const MODEL_DIR_NAME = 'models';

// ── Model selection ───────────────────────────────────────────────

/**
 * Select which models to download based on device tier and platform.
 * Returns entries sorted by download priority (smallest first for snappy UX).
 */
export function selectModelsForTier(
  tier: DeviceTier,
  registry: ModelRegistry = SAMPLE_REGISTRY,
): ModelRegistryEntry[] {
  const selected = registry.filter((entry) => {
    // Tier gate: entry.minDeviceTier must be ≤ current tier
    const tierOrder: Record<string, number> = { low: 0, mid: 1, high: 2 };
    if (tierOrder[entry.minDeviceTier] > tierOrder[tier]) return false;

    // Platform gate
    if (Platform.OS === 'ios' && entry.androidOnly) return false;
    if (Platform.OS === 'android' && entry.iosOnly) return false;

    return true;
  });

  // Prefer recommended models, then sort by size (smallest first)
  return selected.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.sizeBytes - b.sizeBytes;
  });
}

// ── URL selection (mirror failover) ────────────────────────────────

/**
 * Pick the CDN URL for an entry. Returns the first URL by default.
 * Could be extended for mirror failover.
 */
export function pickCdnUrl(entry: ModelRegistryEntry, _attemptIndex = 0): string {
  return entry.cdnUrls[0] ?? '';
}

// ── Session persistence ────────────────────────────────────────────

export async function saveSessionState(state: DownloadSessionState): Promise<void> {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}

export async function loadSessionState(): Promise<DownloadSessionState | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DownloadSessionState;
  } catch {
    return null;
  }
}

export async function clearSessionState(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

// ── SHA-256 verification ──────────────────────────────────────────

/**
 * Verify a downloaded file's SHA-256 hash matches the expected value.
 * Uses chunked reading via new expo-file-system FileHandle API.
 *
 * On failure, throws with a descriptive error.
 */
export async function verifyFileIntegrity(
  localUri: string,
  expectedSha256: string,
): Promise<void> {
  // Dynamically import the new-sdk FileSystem to access FileHandle
  const { File: EFile, Directory } = await import('expo-file-system');

  const file = new EFile(localUri);
  if (!file.exists) {
    throw new Error(`Downloaded file not found at ${localUri}`);
  }

  const fileSize = file.size;
  if (fileSize === null || fileSize === 0) {
    throw new Error(`Downloaded file is empty at ${localUri}`);
  }

  try {
    const fh = file.open();
    const CHUNK_SIZE = 64 * 1024; // 64 KB chunks

    // Simple SHA-256 via repeated hashing of concatenated data
    // We accumulate all bytes and hash once at the end since
    // React Native's Hermes doesn't have SubtleCrypto streaming.
    const chunks: Uint8Array[] = [];
    let offset = 0;

    while (offset < fileSize) {
      const chunkSize = Math.min(CHUNK_SIZE, fileSize - offset);
      const chunk = fh.readBytes(chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    fh.close();

    // Compute SHA-256 over all chunks
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const combined = new Uint8Array(totalLength);
    let writeOffset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, writeOffset);
      writeOffset += chunk.length;
    }

    const hash = await sha256Hex(combined.buffer);

    if (hash !== expectedSha256) {
      throw new Error(
        `SHA-256 mismatch.\nExpected: ${expectedSha256}\nGot: ${hash}`,
      );
    }
  } catch (err) {
    // Re-throw with context
    if (err instanceof Error && err.message.includes('SHA-256 mismatch')) {
      throw err;
    }
    throw new Error(`Integrity verification failed: ${String(err)}`);
  }
}

/**
 * Compute SHA-256 hash of an ArrayBuffer.
 * Uses SubtleCrypto if available (JSC), falls back to pure JS.
 */
async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  // Try SubtleCrypto (available in JSC / Hermes with polyfill)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to JS fallback
    }
  }

  // Pure JS SHA-256 fallback
  return jsSha256(new Uint8Array(buffer));
}

/**
 * Pure JS SHA-256 implementation (for environments without SubtleCrypto).
 * Based on the standard SHA-256 algorithm.
 */
function jsSha256(data: Uint8Array): string {
  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Initial hash values
  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  // Pre-processing: padding
  const msgLenBits = data.length * 8;
  const paddingLen = (448 - (msgLenBits + 1) % 512 + 512) % 512; // in bits
  const totalBits = msgLenBits + 1 + paddingLen + 64;
  const totalBytes = totalBits / 8;

  const padded = new Uint8Array(totalBytes);
  padded.set(data);
  padded[data.length] = 0x80; // append '1' bit

  // Append length in big-endian 64-bit
  const view = new DataView(padded.buffer);
  view.setUint32(totalBytes - 4, msgLenBits >>> 0); // low 32 bits
  view.setUint32(totalBytes - 8, 0); // high 32 bits (assuming < 4GB)

  // Process each 512-bit (64-byte) chunk
  for (let chunkStart = 0; chunkStart < totalBytes; chunkStart += 64) {
    const W = new Uint32Array(64);

    for (let t = 0; t < 16; t++) {
      const offset = chunkStart + t * 4;
      W[t] = (padded[offset]! << 24) |
             (padded[offset + 1]! << 16) |
             (padded[offset + 2]! << 8) |
             padded[offset + 3]!;
    }

    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(W[t - 15]!, 7) ^ rightRotate(W[t - 15]!, 18) ^ (W[t - 15]! >>> 3);
      const s1 = rightRotate(W[t - 2]!, 17) ^ rightRotate(W[t - 2]!, 19) ^ (W[t - 2]! >>> 10);
      W[t] = (W[t - 16]! + s0 + W[t - 7]! + s1) >>> 0;
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t]! + W[t]!) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) +
         toHex(H4) + toHex(H5) + toHex(H6) + toHex(H7);
}

function rightRotate(n: number, bits: number): number {
  return ((n >>> bits) | (n << (32 - bits))) >>> 0;
}

// ── Download session ───────────────────────────────────────────────

/**
 * Create an initial download session for a given device tier.
 */
export function createDownloadSession(tier: DeviceTier): DownloadSessionState {
  const entries = selectModelsForTier(tier);
  const models: ModelDownloadState[] = entries.map((entry) => ({
    entry,
    status: 'idle' as DownloadStatus,
    totalBytes: entry.sizeBytes,
    downloadedBytes: 0,
    currentUrl: pickCdnUrl(entry),
    localUri: '',
  }));

  const totalBytes = models.reduce((sum, m) => sum + m.totalBytes, 0);

  return {
    models,
    currentIndex: 0,
    sessionStatus: 'idle',
    overallProgress: 0,
    totalBytes,
    downloadedBytes: 0,
  };
}

/**
 * Get the current progress as a structured DownloadProgress.
 */
export function getProgress(state: DownloadSessionState): DownloadProgress {
  const currentModel = state.models[state.currentIndex];
  const fileTotal = currentModel?.totalBytes ?? 0;
  const fileDownloaded = currentModel?.downloadedBytes ?? 0;

  return {
    fileProgress: fileTotal > 0 ? fileDownloaded / fileTotal : 0,
    overallProgress: state.overallProgress,
    currentFileBytes: { downloaded: fileDownloaded, total: fileTotal },
    overallBytes: { downloaded: state.downloadedBytes, total: state.totalBytes },
    currentFileName: formatModelName(currentModel?.entry),
  };
}

/**
 * Format a model entry into a human-readable name.
 */
export function formatModelName(entry?: ModelRegistryEntry): string {
  if (!entry) return '';
  const family = entry.modelFamily === 'gemma-3' ? 'Gemma 3' : 'Gemma 2';
  return `${family} ${entry.paramCount}B (${entry.quant})`;
}

/**
 * Format bytes into human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
