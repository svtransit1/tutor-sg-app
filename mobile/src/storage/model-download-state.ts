/**
 * MMKV persistence for model download state.
 * Survives app kills so partial downloads can resume on next launch.
 */
import { MMKV } from 'react-native-mmkv';
import type { DownloadState } from '../services/model-download-types';
const STORAGE_KEY_PREFIX = 'download.state.';
const COMPLETED_KEY = 'download.completed';
let _store: MMKV | null = null;
function store(): MMKV {
  if (!_store) _store = new MMKV({ id: 'model_download' });
  return _store;
}
export function persistDownloadState(state: DownloadState): void {
  store().set(`${STORAGE_KEY_PREFIX}${state.fileName}`, JSON.stringify(state));
}
export function loadDownloadState(fileName: string): DownloadState | null {
  const raw = store().getString(`${STORAGE_KEY_PREFIX}${fileName}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as DownloadState; } catch { return null; }
}
export function clearDownloadState(fileName: string): void {
  store().delete(`${STORAGE_KEY_PREFIX}${fileName}`);
}
export function listIncompleteDownloads(): string[] {
  const keys = store().getAllKeys();
  return keys.filter((k) => k.startsWith(STORAGE_KEY_PREFIX)).map((k) => k.replace(STORAGE_KEY_PREFIX, ''));
}
export function markModelDownloaded(fileName: string): void {
  const completed = getCompletedDownloads();
  if (!completed.includes(fileName)) { completed.push(fileName); store().set(COMPLETED_KEY, JSON.stringify(completed)); }
  clearDownloadState(fileName);
}
export function isModelDownloaded(fileName: string): boolean {
  return getCompletedDownloads().includes(fileName);
}
export function getCompletedDownloads(): string[] {
  const raw = store().getString(COMPLETED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}
export function resetDownloadCompletion(): void {
  store().delete(COMPLETED_KEY);
}