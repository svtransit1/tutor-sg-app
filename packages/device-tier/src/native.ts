import { Platform, NativeModules } from 'react-native';
import type { NativeDeviceInfo } from './types';
const NATIVE_MODULE_NAME = 'TutorSgDeviceInfo';
function simulateDeviceInfo(): NativeDeviceInfo {
  if (Platform.OS === 'ios' || Platform.OS === 'android')
    return {
      totalRAM: 8,
      chipset: Platform.OS === 'ios' ? 'A17' : 'SDM8 Gen2',
      npuAvailable: true,
    };
  return { totalRAM: 4, chipset: 'unknown', npuAvailable: false };
}
async function getNativeDeviceInfo(): Promise<NativeDeviceInfo> {
  const mod = NativeModules[NATIVE_MODULE_NAME];
  if (!mod || typeof mod.getDeviceInfo !== 'function') return simulateDeviceInfo();
  try {
    return await mod.getDeviceInfo();
  } catch {
    return simulateDeviceInfo();
  }
}
export { getNativeDeviceInfo as getDeviceInfo };
