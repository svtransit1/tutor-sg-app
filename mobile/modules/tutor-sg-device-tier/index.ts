import { NativeModules, Platform } from 'react-native'

interface NativeDeviceInfo {
  totalRAM: number
  chipset: string
  npuAvailable: boolean
}

interface DeviceTierNativeInterface {
  getTotalMemory(): Promise<number>
  getChipset(): Promise<string>
  isNPUAvailable(): Promise<boolean>
  getDeviceInfo(): Promise<NativeDeviceInfo>
}

function getNativeModule(): DeviceTierNativeInterface | null {
  if (Platform.OS !== 'ios') return null
  const mod = NativeModules.TutorSgDeviceTier
  if (!mod) return null
  return mod as DeviceTierNativeInterface
}

export async function getTotalMemory(): Promise<number> {
  const mod = getNativeModule()
  if (!mod) throw new Error('TutorSgDeviceTier native module not available on this platform')
  return mod.getTotalMemory()
}

export async function getChipset(): Promise<string> {
  const mod = getNativeModule()
  if (!mod) throw new Error('TutorSgDeviceTier native module not available on this platform')
  return mod.getChipset()
}

export async function isNPUAvailable(): Promise<boolean> {
  const mod = getNativeModule()
  if (!mod) throw new Error('TutorSgDeviceTier native module not available on this platform')
  return mod.isNPUAvailable()
}

export async function getDeviceInfo(): Promise<NativeDeviceInfo> {
  const mod = getNativeModule()
  if (!mod) throw new Error('TutorSgDeviceTier native module not available on this platform')
  return mod.getDeviceInfo()
}

export type { NativeDeviceInfo }
