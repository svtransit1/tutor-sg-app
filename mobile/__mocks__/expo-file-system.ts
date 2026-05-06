export const documentDirectory = '/mock/document/';
export const cacheDirectory = '/mock/cache/';
export const bundleDirectory = '/mock/bundle/';

export const readAsStringAsync = jest.fn().mockResolvedValue('');
export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest
  .fn()
  .mockResolvedValue({ exists: true, size: 100, isDirectory: false });
export const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
export const downloadAsync = jest.fn().mockResolvedValue({ uri: '/mock/downloaded' });
export const StorageAccessFramework = {
  requestDirectoryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true, directoryUri: '/mock/dir' }),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
};

export default {
  documentDirectory,
  cacheDirectory,
  bundleDirectory,
  readAsStringAsync,
  writeAsStringAsync,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  StorageAccessFramework,
};
