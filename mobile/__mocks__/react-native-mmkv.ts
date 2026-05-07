export class MMKV {
  private store = new Map<string, string>();
  getString(key: string) { return this.store.get(key) ?? null; }
  getBoolean(key: string) {
    const v = this.store.get(key);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
  }
  set(key: string, value: string | boolean) {
    this.store.set(key, String(value));
  }
  delete(key: string) { this.store.delete(key); }
  getAllKeys() { return Array.from(this.store.keys()); }
  clearAll() { this.store.clear(); }
}
export default { MMKV };
