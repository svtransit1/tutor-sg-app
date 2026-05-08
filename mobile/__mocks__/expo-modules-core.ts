const registry = new Map<string, Record<string, unknown>>();
export function __registerMock(n: string, m: Record<string, unknown>) { registry.set(n, m); }
export function requireNativeModule(n: string) {
  if (registry.has(n)) return registry.get(n)!;
  return new Proxy({}, { get: (_, p) => (p === 'then' ? undefined : jest.fn()) });
}
export function requireOptionalNativeModule(n: string) {
  try { return requireNativeModule(n); } catch { return null; }
}
export class EventEmitter {
  listeners = new Map<string, Array<(...a: unknown[])=>void>>();
  addListener<T>(e: string, l: (e: T)=>void) {
    const list = this.listeners.get(e) || [];
    list.push(l as any); this.listeners.set(e, list);
  }
  removeAllListeners(e: string) { this.listeners.delete(e); }
  emit(e: string, ...a: unknown[]) { this.listeners.get(e)?.forEach(f => f(...a)); }
}
