const mockStorage = new Map<string, string>();

export class MMKV {
  getString(key: string) {
    return mockStorage.get(key) ?? null;
  }
  set(key: string, value: string) {
    mockStorage.set(key, value);
  }
  delete(key: string) {
    mockStorage.delete(key);
  }
  clearAll() {
    mockStorage.clear();
  }
  getAllKeys() {
    return Array.from(mockStorage.keys());
  }
}

export default { MMKV };
