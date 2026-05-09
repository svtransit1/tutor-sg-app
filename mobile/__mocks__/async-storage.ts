const ss = new Map<string,string>();
export default {
  getItem: jest.fn(async (k: string) => ss.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => { ss.set(k, v); }),
  removeItem: jest.fn(async (k: string) => { ss.delete(k); }),
  clear: jest.fn(async () => { ss.clear(); }),
  getAllKeys: jest.fn(async () => [...ss.keys()]),
  multiGet: jest.fn(async (ks: string[]) => ks.map(k => [k, ss.get(k) ?? null])),
  multiSet: jest.fn(async (kv: [string,string][]) => kv.forEach(([k,v]) => ss.set(k,v))),
  multiRemove: jest.fn(async (ks: string[]) => ks.forEach(k => ss.delete(k))),
};
