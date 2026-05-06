/**
 * Tier display info — pure utility functions for rendering device tier information.
 *
 * These are separated from the hook to allow testing without loading
 * the @tutor-sg/device-tier native module package.
 */
import type { DeviceTier } from '@tutor-sg/device-tier';

export interface TierDisplayInfo {
  /** The translated display label: "High Performance" or "Standard" */
  label: string;
  /** Estimated download size in human-readable form */
  downloadSize: string;
  /** The model names for display */
  modelNames: string;
}

const TIER_LABELS: Record<DeviceTier, { en: string; zh: string }> = {
  high: { en: 'High Performance', zh: '高性能' },
  mid: { en: 'Standard', zh: '标准' },
  low: { en: 'Unsupported', zh: '不支持' },
};

const TIER_DOWNLOAD_SIZES: Record<Exclude<DeviceTier, 'low'>, { en: string; zh: string }> = {
  high: { en: '~2 GB', zh: '约 2 GB' },
  mid: { en: '~700 MB', zh: '约 700 MB' },
};

const TIER_MODEL_NAMES: Record<Exclude<DeviceTier, 'low'>, { en: string; zh: string }> = {
  high: { en: 'Gemma 4B + Qwen 3.5 4B', zh: 'Gemma 4B + Qwen 3.5 4B' },
  mid: { en: 'Gemma 2B + Qwen 3.5 2B', zh: 'Gemma 2B + Qwen 3.5 2B' },
};

export function getTierDisplayInfo(
  tier: Exclude<DeviceTier, 'low'>,
  locale: 'en' | 'zh-Hans',
): TierDisplayInfo {
  return {
    label: TIER_LABELS[tier][locale === 'zh-Hans' ? 'zh' : 'en'],
    downloadSize: TIER_DOWNLOAD_SIZES[tier][locale === 'zh-Hans' ? 'zh' : 'en'],
    modelNames: TIER_MODEL_NAMES[tier][locale === 'zh-Hans' ? 'zh' : 'en'],
  };
}
