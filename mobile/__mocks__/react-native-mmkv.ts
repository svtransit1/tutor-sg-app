const mockStorage = new Map<string, string>();

export class MMKV {
  constructor(_config: { id: string }) {}
  getString(key: string): string | null {
    return mockStorage.get(key) ?? null;
  }
  set(key: string, value: string): void {
    mockStorage.set(key, value);
  }
  delete(key: string): void {
    mockStorage.delete(key);
  }
  clearAll(): void {
    mockStorage.clear();
  }
  getAllKeys(): string[] {
    return Array.from(mockStorage.keys());
  }
}
