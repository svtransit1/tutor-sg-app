export interface DeviceTierNativeModule {
  getTotalMemory(): Promise<number>;
  getChipset(): Promise<string>;
  isNPUAvailable(): Promise<boolean>;
}

export interface DeviceTierNativeModuleEvents {
  onMemoryLow(data: { ramGB: number }): void;
}
