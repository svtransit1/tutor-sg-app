export const documentDirectory = '/mock/document/';
export const cacheDirectory = '/mock/cache/';
export const bundleDirectory = '/mock/bundle/';
export const storageDirectory = '/mock/storage/';
export const FileSystemSessionType = { Download: 'download' as const };

let _mockFreeDisk = 10 * 1024 * 1024 * 1024;
let _mockDownloadStatus = 200;

export function __setFreeDiskStorage(bytes: number) { _mockFreeDisk = bytes; }
export function __setDownloadStatus(status: number) { _mockDownloadStatus = status; }
/** Called by setup-jest.ts beforeEach */
export function __resetMockFs() { _mockFreeDisk = 10 * 1024 * 1024 * 1024; _mockDownloadStatus = 200; }

export const readAsStringAsync = jest.fn().mockResolvedValue('');
export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest
  .fn()
  .mockResolvedValue({ exists: false, size: 100, isDirectory: false });
export const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
export const moveAsync = jest.fn().mockResolvedValue(undefined);

export async function getFreeDiskStorageAsync() { return _mockFreeDisk; }

export async function downloadAsync(_uri: string, fileUri: string) {
  return { uri: fileUri, status: _mockDownloadStatus, headers: {} };
}

export const StorageAccessFramework = {
  requestDirectoryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true, directoryUri: '/mock/dir' }),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
};

export default {
  documentDirectory, cacheDirectory, bundleDirectory, storageDirectory, FileSystemSessionType,
  readAsStringAsync, writeAsStringAsync, deleteAsync, getInfoAsync, makeDirectoryAsync,
  moveAsync, getFreeDiskStorageAsync, downloadAsync, StorageAccessFramework, __resetMockFs,
};
