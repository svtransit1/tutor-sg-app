/**
 * Device-tier types and pure classification logic.
 *
 * Shared between mobile (provider implementations) and any consumer
 * that needs to know the current device tier (onboarding, model downloader,
 * subject router).
 *
 * ## Tiers (per decisions-locked.md / ARCHITECTURE.md §3.4)
 *
 * | Tier   | RAM      | NPU                          | Models              |
 * |--------|----------|------------------------------|---------------------|
 * | `high` | ≥ 6 GB   | Modern (A14+/SD8Gen1+/T G2+) | Gemma E4B / Qwen 4B |
 * | `mid`  | ≥ 4 GB   | Any (or ≥6GB w/o modern NPU) | Gemma E2B / Qwen 2B |
 * | `low`  | < 4 GB   | —                            | Below floor         |
 */

import type { DeviceTier } from './schema/registry';

// Re-export for convenience
export type { DeviceTier };

/** Raw capabilities used to classify a device. */
export interface DeviceCapabilities {
  /** Total physical RAM in bytes. */
  ramBytes: number;
  /** Human-readable chipset / SoC identifier (e.g. "A16", "SD8Gen2"). */
  chipset: string;
  /** Whether the device has a modern NPU / Neural Engine capable of efficient INT8/FP16 inference. */
  hasModernNpu: boolean;
  /** Estimated thermal headroom for sustained LLM inference. */
  thermalHeadroom: 'good' | 'moderate' | 'poor';
  /** Free storage in bytes (for model download). */
  freeStorageBytes: number;
}

/** Tier result including metadata for display / diagnostics. */
export interface DeviceTierResult {
  tier: DeviceTier;
  capabilities: DeviceCapabilities;
  /** Human-readable tier label (en). */
  labelEn: string;
  /** Human-readable tier label (zh-Hans). */
  labelZh: string;
}

/** Platform-agnostic interface for fetching device capabilities. */
export interface DeviceCapabilityProvider {
  /** Resolve device capabilities. May be async (native module reads). */
  getCapabilities(): Promise<DeviceCapabilities>;
}

// ── Constants ──────────────────────────────────────────────────────

/** Minimum RAM for the mid tier (bytes). */
export const MID_TIER_RAM_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB

/** Minimum RAM for the high tier (bytes). */
export const HIGH_TIER_RAM_BYTES = 6 * 1024 * 1024 * 1024; // 6 GB

/** Minimum free storage for any tier beyond low (bytes). */
export const MIN_FREE_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB headroom for models

/** Chipset prefixes that indicate a modern NPU. */
export const MODERN_NPU_CHIPSETS = new Set([
  // Apple
  'A14', 'A15', 'A16', 'A17', 'A18', 'A19',
  'M1', 'M2', 'M3', 'M4',
  // Qualcomm
  'SD8Gen1', 'SD8+Gen1', 'SD8Gen2', 'SD8Gen3', 'SD8Gen4', 'SD8Elite',
  'SD7+Gen2', 'SD7+Gen3',
  // MediaTek
  'Dimensity9000', 'Dimensity9200', 'Dimensity9300', 'Dimensity9400',
  'Dimensity8300', 'Dimensity8400',
  // Google
  'TensorG2', 'TensorG3', 'TensorG4', 'TensorG5',
  // Samsung
  'Exynos2200', 'Exynos2300', 'Exynos2400',
]);

// ── Tier labels ────────────────────────────────────────────────────

const TIER_LABELS: Record<DeviceTier, { labelEn: string; labelZh: string }> = {
  high: { labelEn: 'High Performance', labelZh: '高性能' },
  mid: { labelEn: 'Standard', labelZh: '标准' },
  low: { labelEn: 'Basic', labelZh: '基础' },
};

// ── Pure classification ────────────────────────────────────────────

/**
 * Pure function: classify a device into a tier based on capabilities.
 * Zero side effects — suitable for unit testing.
 *
 * Rules (priority order):
 * 1. < 4 GB RAM → low
 * 2. ≥ 6 GB RAM + modern NPU + ≥ 5 GB free storage → high
 * 3. Otherwise → mid
 * 4. Thermal headroom = poor + high → downgrade to mid
 * 5. Free storage < 5 GB → downgrade one tier
 */
export function classifyDeviceTier(capabilities: DeviceCapabilities): DeviceTierResult {
  const { ramBytes, hasModernNpu, thermalHeadroom, freeStorageBytes } = capabilities;

  let tier: DeviceTier;

  if (ramBytes < MID_TIER_RAM_BYTES) {
    tier = 'low';
  } else if (ramBytes >= HIGH_TIER_RAM_BYTES && hasModernNpu) {
    tier = 'high';
  } else {
    tier = 'mid';
  }

  // Thermal downgrade: poor thermal → high cannot sustain E4B
  if (tier === 'high' && thermalHeadroom === 'poor') {
    tier = 'mid';
  }

  // Storage gate: not enough free space for models → downgrade
  if (freeStorageBytes < MIN_FREE_STORAGE_BYTES) {
    if (tier === 'high') {
      tier = 'mid';
    } else if (tier === 'mid') {
      tier = 'low';
    }
    // low stays low
  }

  return {
    tier,
    capabilities,
    labelEn: TIER_LABELS[tier].labelEn,
    labelZh: TIER_LABELS[tier].labelZh,
  };
}
