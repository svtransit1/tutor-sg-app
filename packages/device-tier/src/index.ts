/**
 * @tutor-sg/device-tier — Device capability detection and tier assignment.
 *
 * Per ADD §3.4: Runtime detection at first launch.
 * Per locked decisions: below floor → "device too old" message.
 *
 * Exports:
 * - Types: DeviceTier, DeviceCapabilities, NativeDeviceInfo, etc.
 * - Constants: TIER_THRESHOLDS, HIGH_TIER_CHIPSETS, MODEL_MAP, etc.
 * - Functions: assignTier(), buildCapabilities()
 * - Components: BelowFloorModal
 * - Provider: DeviceTierProvider, useDeviceTier
 */

// ── Type exports ───────────────────────────────────────────────────

export type {
  DeviceTier,
  DeviceCapabilities,
  NativeDeviceInfo,
  DeviceTierNativeModule,
  HighTierChipset,
} from './types';

export {
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
  MODEL_MAP,
  SETTINGS_KEY,
  BELOW_FLOOR_MESSAGES,
} from './types';

// ── Detection logic ────────────────────────────────────────────────

export { assignTier, buildCapabilities } from './detect';

// ── Component exports ──────────────────────────────────────────────

export { BelowFloorModal } from './components/BelowFloorModal';

// ── Provider exports ───────────────────────────────────────────────

export { DeviceTierProvider, useDeviceTier } from './DeviceTierProvider';
