const g = globalThis as Record<string, unknown>;
if (!g.__fbBatchedBridgeConfig) {
  g.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}
