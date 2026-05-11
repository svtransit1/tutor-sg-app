import { requireNativeModule } from 'expo-modules-core';
interface NativeDeviceInfo {
  totalRAM: number;
  chipset: string;
  npuAvailable: boolean;
}
interface DeviceTierInfoModule {
  getDeviceInfo(): Promise<NativeDeviceInfo>;
}
const NativeModule: DeviceTierInfoModule = requireNativeModule('TutorSgDeviceInfo');
export function getDeviceInfoNative(): Promise<NativeDeviceInfo> {
  return NativeModule.getDeviceInfo();
}
