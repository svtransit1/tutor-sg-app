const s = new Map<string,string>();
export class MMKV {
  set(k: string, v: any) { s.set(k, String(v)); }
  getString(k: string) { return s.get(k); }
  getNumber(k: string) { const v = s.get(k); return v !== undefined ? Number(v) : undefined; }
  getBoolean(k: string) { const v = s.get(k); if (v==='true') return true; if (v==='false') return false; return undefined; }
  delete(k: string) { s.delete(k); }
  clearAll() { s.clear(); }
  getAllKeys() { return [...s.keys()]; }
  contains(k: string) { return s.has(k); }
}
