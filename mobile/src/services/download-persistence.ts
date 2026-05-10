import * as FileSystem from 'expo-file-system';
import type { DownloadTask } from '../models/model-download';
import { getStateFilePath } from './download-fs';

const STATE_VERSION = 1;
export interface SavedDownloadState { version: number; tasks: DownloadTask[]; completedFileNames: string[]; downloadedBytes: number; savedAt: number; }

export async function saveDownloadState(tasks: DownloadTask[], completedFileNames: string[], downloadedBytes: number): Promise<void> {
  const state: SavedDownloadState = { version: STATE_VERSION, tasks, completedFileNames, downloadedBytes, savedAt: Date.now() };
  const path = getStateFilePath();
  await FileSystem.writeAsStringAsync(path, JSON.stringify(state), { encoding: FileSystem.EncodingType.UTF8 });
}

export async function loadDownloadState(): Promise<SavedDownloadState | null> {
  try {
    const path = getStateFilePath();
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const json = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.UTF8 });
    const state = JSON.parse(json) as SavedDownloadState;
    if (typeof state.version !== 'number' || state.version !== STATE_VERSION) { await clearDownloadState(); return null; }
    if (!Array.isArray(state.tasks) || state.tasks.length === 0) { await clearDownloadState(); return null; }
    const validTasks = await verifyPartialFiles(state.tasks);
    if (validTasks.length === 0) { await clearDownloadState(); return null; }
    if (validTasks.length < state.tasks.length) {
      const validFilenames = new Set(validTasks.map((t) => t.fileName));
      state.tasks = validTasks;
      state.completedFileNames = state.completedFileNames.filter((n) => validFilenames.has(n));
    }
    return state;
  } catch { return null; }
}

export async function clearDownloadState(): Promise<void> {
  try {
    const path = getStateFilePath();
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) { await FileSystem.deleteAsync(path, { idempotent: true }); }
  } catch { /* best effort */ }
}

async function verifyPartialFiles(tasks: DownloadTask[]): Promise<DownloadTask[]> {
  const valid: DownloadTask[] = [];
  for (const task of tasks) {
    try { const info = await FileSystem.getInfoAsync(task.destPath); if (info.exists) valid.push(task); } catch { /* skip */ }
  }
  return valid;
}
