const stores = new Map<string, Map<string, string>>();

export class MMKV {
  private data: Map<string, string>;
  constructor(options?: { id?: string }) {
    const id = options?.id ?? 'default';
    if (!stores.has(id)) stores.set(id, new Map());
    this.data = stores.get(id)!;
  }
  static __clearAllStores() { stores.clear(); }
  getString(key: string): string | undefined { return this.data.get(key) ?? undefined; }
  set(key: string, value: string | boolean | number): void { this.data.set(key, String(value)); }
  delete(key: string): void { this.data.delete(key); }
  clearAll(): void { this.data.clear(); }
  getAllKeys(): string[] { return Array.from(this.data.keys()); }
  contains(key: string): boolean { return this.data.has(key); }
}

export default { MMKV };
