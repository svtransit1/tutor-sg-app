import { requireNativeModule } from 'expo-modules-core';
import type { DeviceTierNativeModule } from './DeviceTierModule.types';

let nativeModule: DeviceTierNativeModule | null = null;

try {
  nativeModule = requireNativeModule('DeviceTierModule');
} catch {
  nativeModule = null;
}

const FALLBACK_MEMORY_GB = 4;

const CHIPSET_BY_MODEL: Record<string, string> = {
  'iPhone14,2': 'A15',
  'iPhone14,3': 'A15',
  'iPhone14,4': 'A15',
  'iPhone14,5': 'A15',
  'iPhone14,6': 'A15',
  'iPhone14,7': 'A16',
  'iPhone14,8': 'A16',
  'iPhone15,2': 'A16',
  'iPhone15,3': 'A16',
  'iPhone15,4': 'A17',
  'iPhone15,5': 'A17',
  'iPhone16,1': 'A18',
  'iPhone16,2': 'A18',
  'iPhone17,1': 'A19',
  'iPhone17,2': 'A19',
};

const NPU_CHIPSETS = new Set([
  'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19',
  'M1', 'M2', 'M3', 'M4',
  'SDM8 Gen1', 'SDM8 Gen2', 'SDM8 Gen3',
  'Tensor', 'Tensor G2', 'Tensor G3', 'Tensor G4',
  'Exynos 2200', 'Exynos 2400',
]);

function hasNPUFromChipset(chipset: string): boolean {
  for (const npu of NPU_CHIPSETS) {
    if (chipset.includes(npu)) return true;
  }
  return false;
}

export function getTotalMemory(): Promise<number> {
  if (nativeModule) {
    return nativeModule.getTotalMemory();
  }
  const mem = (globalThis as any).performance?.memory;
  if (mem?.jsHeapSizeLimit) {
    return Promise.resolve(Math.round(mem.jsHeapSizeLimit / (1024 * 1024 * 1024)));
  }
  return Promise.resolve(FALLBACK_MEMORY_GB);
}

export async function getChipset(): Promise<string> {
  if (nativeModule) {
    return nativeModule.getChipset();
  }
  const { Platform } = await import('react-native');
  if (Platform.OS === 'ios') {
    const Device = await import('expo-device');
    const model = Device.default?.modelName ?? Device.modelName ?? '';
    return CHIPSET_BY_MODEL[model] || model || 'Unknown';
  }
  return 'Unknown';
}

export async function isNPUAvailable(): Promise<boolean> {
  if (nativeModule) {
    return nativeModule.isNPUAvailable();
  }
  const chipset = await getChipset();
  return hasNPUFromChipset(chipset);
}
