// Mock expo-file-system for Jest (node environment)
const FileSystem = {
  getFreeDiskStorageAsync: () => Promise.resolve(50 * 1024 * 1024 * 1024),
  documentDirectory: '/mock/document',
  cacheDirectory: '/mock/cache',
};

export default FileSystem;
