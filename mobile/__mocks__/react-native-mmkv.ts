export class MMKV {
  private store = new Map<string, string>();
  getString(key: string) { return this.store.get(key) ?? null; }
  set(key: string, value: string) { this.store.set(key, value); }
  delete(key: string) { this.store.delete(key); }
  getAllKeys() { return Array.from(this.store.keys()); }
  clearAll() { this.store.clear(); }
}
export default { MMKV };
