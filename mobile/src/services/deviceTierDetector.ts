import { getTotalMemory, getChipset, isNPUAvailable } from '@tutor-sg/device-tier-native';
import { assignTier, buildCapabilities, saveDeviceTier, openDatabase, ensureSettingsTable } from '@tutor-sg/device-tier';
import type { DeviceCapabilities } from '@tutor-sg/device-tier';

export async function detectDeviceTier(): Promise<DeviceCapabilities> {
  const [totalRAM, chipset, npuAvailable] = await Promise.all([
    getTotalMemory(),
    getChipset(),
    isNPUAvailable(),
  ]);

  const info = { totalRAM, chipset, npuAvailable };
  const capabilities = buildCapabilities(info);

  const db = await openDatabase();
  await ensureSettingsTable(db);
  await saveDeviceTier(db, capabilities.tier);

  return capabilities;
}
