const registry = new Map<string, unknown>();
export function __registerMock(name: string, mock: unknown) { registry.set(name, mock); }
export function requireOptionalNativeModule(name: string) { return registry.get(name); }
export function requireNativeModule(name: string) { return registry.get(name) ?? {}; }
export default { __registerMock, requireOptionalNativeModule, requireNativeModule };
