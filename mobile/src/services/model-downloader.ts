import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";

import type { ModelEntry } from "./device-tier";

export interface DownloadProgress {
  modelId: string;
  fileName: string;
  bytesWritten: number;
  totalBytes: number;
  percent: number;
}

export type DownloadStatus =
  | "idle"
  | "detecting"
  | "ready"
  | "downloading"
  | "paused"
  | "verifying"
  | "completed"
  | "error";

export type DownloadErrorCode =
  | "connectivity_lost"
  | "disk_insufficient"
  | "cdn_unreachable"
  | "hash_mismatch"
  | "download_stuck"
  | "unknown_error";

export interface DownloadError {
  code: DownloadErrorCode;
  message: string;
  modelId?: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;
export type StatusCallback = (status: DownloadStatus, error?: DownloadError) => void;

const MODELS_DIR = `${FileSystem.documentDirectory}models/`;
const STATE_FILE = `${MODELS_DIR}download-state.json`;

interface DownloadState {
  downloadedModels: string[];
  completedAt?: number;
}

interface ActiveDownload {
  resumable: FileSystem.DownloadResumable;
  modelId: string;
  fileName: string;
  totalBytes: number;
  lastBytes: number;
  lastTime: number;
  stuckCheckInterval: ReturnType<typeof setInterval> | null;
}

const activeDownloads: Map<string, ActiveDownload> = new Map();
let currentStatus: DownloadStatus = "idle";
let statusCallback: StatusCallback | null = null;
let progressCallback: ProgressCallback | null = null;
let downloadQueue: ModelEntry[] = [];
let currentIndex = 0;

function notifyStatus(status: DownloadStatus, error?: DownloadError) {
  currentStatus = status;
  statusCallback?.(status, error);
}

function notifyProgress(progress: DownloadProgress) {
  progressCallback?.(progress);
}

async function ensureModelsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
}

async function loadDownloadState(): Promise<DownloadState> {
  try {
    const info = await FileSystem.getInfoAsync(STATE_FILE);
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(STATE_FILE);
      return JSON.parse(raw) as DownloadState;
    }
  } catch {
    // State file corrupted or unreadable, start fresh
  }
  return { downloadedModels: [] };
}

async function saveDownloadState(state: DownloadState): Promise<void> {
  await ensureModelsDir();
  await FileSystem.writeAsStringAsync(STATE_FILE, JSON.stringify(state));
}

function isAllZeroHash(sha256: string): boolean {
  return /^0{64}$/.test(sha256);
}

async function verifyIntegrity(fileUri: string, expectedSha256: string): Promise<boolean> {
  if (isAllZeroHash(expectedSha256)) return true;

  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);
    return hash === expectedSha256;
  } catch {
    return false;
  }
}

function startStuckDetection(modelId: string): ReturnType<typeof setInterval> {
  const interval = setInterval(() => {
    const download = activeDownloads.get(modelId);
    if (!download) {
      clearInterval(interval);
      return;
    }
    if (Date.now() - download.lastTime > 30000 && download.lastBytes > 0) {
      clearInterval(interval);
      clearAllDownloads();
      notifyStatus("error", {
        code: "download_stuck",
        message: "Download seems stuck. Retrying...",
        modelId,
      });
    }
  }, 10000);
  return interval;
}

function clearAllDownloads() {
  for (const [, download] of activeDownloads) {
    if (download.stuckCheckInterval) clearInterval(download.stuckCheckInterval);
  }
  activeDownloads.clear();
}

async function downloadOneModel(
  model: ModelEntry,
  onModelProgress: (progress: DownloadProgress) => void,
): Promise<boolean> {
  const fileUri = `${MODELS_DIR}${model.fileName}`;

  // If file already exists and hash verifies, skip
  const existingInfo = await FileSystem.getInfoAsync(fileUri);
  if (existingInfo.exists && existingInfo.size === model.sizeBytes) {
    const valid = await verifyIntegrity(fileUri, model.sha256);
    if (valid) return true;
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    model.cdnUrl,
    fileUri,
    {},
    (downloadProgress) => {
      const written = downloadProgress.totalBytesWritten;
      const total = downloadProgress.totalBytesExpectedToWrite;
      const percent = total > 0 ? Math.round((written / total) * 100) : 0;
      onModelProgress({
        modelId: model.id,
        fileName: model.fileName,
        bytesWritten: written,
        totalBytes: total,
        percent,
      });
    },
  );

  const active: ActiveDownload = {
    resumable: downloadResumable,
    modelId: model.id,
    fileName: model.fileName,
    totalBytes: model.sizeBytes,
    lastBytes: 0,
    lastTime: Date.now(),
    stuckCheckInterval: null,
  };
  activeDownloads.set(model.id, active);
  active.stuckCheckInterval = startStuckDetection(model.id);

  try {
    const result = await downloadResumable.downloadAsync();
    if (active.stuckCheckInterval) clearInterval(active.stuckCheckInterval);
    activeDownloads.delete(model.id);

    if (result && result.status === 200) {
      notifyStatus("verifying");
      const valid = await verifyIntegrity(result.uri, model.sha256);
      if (!valid) {
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        notifyStatus("error", {
          code: "hash_mismatch",
          message: "Download file corrupted. Re-downloading...",
          modelId: model.id,
        });
        return false;
      }
      return true;
    }
  } catch (err: unknown) {
    if (active.stuckCheckInterval) clearInterval(active.stuckCheckInterval);
    activeDownloads.delete(model.id);

    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("exceeded") || msg.includes("storage") || msg.includes("space")) {
      notifyStatus("error", {
        code: "disk_insufficient",
        message: "Not enough storage space.",
        modelId: model.id,
      });
    } else if (msg.includes("network") || msg.includes("connect") || msg.includes("ENOENT")) {
      notifyStatus("error", {
        code: "cdn_unreachable",
        message: "Cannot reach server.",
        modelId: model.id,
      });
    } else {
      notifyStatus("error", { code: "unknown_error", message: msg, modelId: model.id });
    }
    return false;
  }

  if (active.stuckCheckInterval) clearInterval(active.stuckCheckInterval);
  activeDownloads.delete(model.id);
  return false;
}

export async function startDownload(
  models: ModelEntry[],
  onProgress: ProgressCallback,
  onStatus: StatusCallback,
): Promise<void> {
  clearAllDownloads();
  downloadQueue = [...models];
  currentIndex = 0;
  statusCallback = onStatus;
  progressCallback = onProgress;

  if (models.length === 0) {
    notifyStatus("completed");
    return;
  }

  await ensureModelsDir();
  const state = await loadDownloadState();

  notifyStatus("downloading");

  for (let i = 0; i < models.length; i++) {
    if (getDownloadStatus() !== "downloading") break;
    currentIndex = i;
    const model = models[i];

    if (state.downloadedModels.includes(model.id)) {
      const valid = await verifyIntegrity(`${MODELS_DIR}${model.fileName}`, model.sha256);
      if (valid) {
        notifyProgress({
          modelId: model.id,
          fileName: model.fileName,
          bytesWritten: model.sizeBytes,
          totalBytes: model.sizeBytes,
          percent: 100,
        });
        continue;
      }
      state.downloadedModels = state.downloadedModels.filter((id) => id !== model.id);
    }

    notifyProgress({
      modelId: model.id,
      fileName: model.fileName,
      bytesWritten: 0,
      totalBytes: model.sizeBytes,
      percent: 0,
    });

    const success = await downloadOneModel(model, notifyProgress);
    if (!success && getDownloadStatus() !== "downloading") return;

    if (success) {
      state.downloadedModels.push(model.id);
      await saveDownloadState(state);
    }
  }

  clearAllDownloads();
  state.completedAt = Date.now();
  await saveDownloadState(state);
  notifyStatus("completed");
}

export function pauseDownload(): void {
  for (const [, download] of activeDownloads) {
    download.resumable.pauseAsync();
    if (download.stuckCheckInterval) clearInterval(download.stuckCheckInterval);
  }
  notifyStatus("paused");
}

export async function resumeDownload(): Promise<void> {
  if (currentStatus !== "paused") return;
  const remaining = downloadQueue.slice(currentIndex);
  if (remaining.length === 0) {
    notifyStatus("completed");
    return;
  }
  notifyStatus("downloading");

  const state = await loadDownloadState();
  for (let i = 0; i < remaining.length; i++) {
    if (getDownloadStatus() !== "downloading") break;
    const model = remaining[i];
    const actualIndex = currentIndex + i;

    if (state.downloadedModels.includes(model.id)) {
      notifyProgress({
        modelId: model.id,
        fileName: model.fileName,
        bytesWritten: model.sizeBytes,
        totalBytes: model.sizeBytes,
        percent: 100,
      });
      continue;
    }

    notifyProgress({
      modelId: model.id,
      fileName: model.fileName,
      bytesWritten: 0,
      totalBytes: model.sizeBytes,
      percent: 0,
    });

    currentIndex = actualIndex;
    const success = await downloadOneModel(model, notifyProgress);
    if (!success && getDownloadStatus() !== "downloading") return;

    if (success) {
      state.downloadedModels.push(model.id);
      await saveDownloadState(state);
    }
  }

  clearAllDownloads();
  state.completedAt = Date.now();
  await saveDownloadState(state);
  notifyStatus("completed");
}

export function getDownloadStatus(): DownloadStatus {
  return currentStatus;
}

export function cancelDownload(): void {
  clearAllDownloads();
  notifyStatus("idle");
}

export async function areModelsDownloaded(models: ModelEntry[]): Promise<boolean> {
  if (models.length === 0) return true;

  const state = await loadDownloadState();
  for (const model of models) {
    const fileUri = `${MODELS_DIR}${model.fileName}`;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) return false;
    if (info.size !== model.sizeBytes) return false;

    const valid = await verifyIntegrity(fileUri, model.sha256);
    if (!valid) return false;

    if (!state.downloadedModels.includes(model.id)) {
      state.downloadedModels.push(model.id);
      await saveDownloadState(state);
    }
  }
  return true;
}
