declare const __fbBatchedBridgeConfig: object | undefined;
if (!__fbBatchedBridgeConfig) {
  (globalThis as Record<string, unknown>).__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}
