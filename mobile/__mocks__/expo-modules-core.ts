const registeredMocks = new Map<string, Record<string, any>>();

export function __registerMock(name: string, mock: Record<string, any>) {
  registeredMocks.set(name, mock);
}

export function requireNativeModule(name: string) {
  return registeredMocks.get(name) ?? {};
}

export default { __registerMock, requireNativeModule };
