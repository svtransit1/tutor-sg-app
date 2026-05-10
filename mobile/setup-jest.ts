const g = globalThis as Record<string, unknown>;
if (!g.__fbBatchedBridgeConfig) {
  g.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}

if (typeof window === 'undefined') {
  (g as any).window = { dispatchEvent: () => {} };
}
