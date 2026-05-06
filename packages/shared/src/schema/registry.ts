export type ModelFamily = 'gemma-4' | 'qwen-3.5';
export type QuantLevel = 'q4_0' | 'q4_k_m' | 'q8_0' | 'fp16';
export type ModelFormat = 'gguf' | 'mlx';
export type DeviceTier = 'low' | 'mid' | 'high';

/**
 * Canonical model IDs matching the LLM routing table (packages/llm/src/routing.ts).
 * Each ID maps to a specific model variant in the registry.
 */
export type ModelId = 'gemma-e4b' | 'gemma-e2b' | 'qwen-4b' | 'qwen-2b';

export interface ModelRegistryEntry {
  /** Canonical model ID used by the LLM routing table. */
  modelId: ModelId;
  /** Model family name (e.g., gemma-4, qwen-3.5). */
  modelFamily: ModelFamily;
  /** Parameter count in billions (e.g., 2, 4). */
  paramCount: number;
  /** Quantisation level. */
  quant: QuantLevel;
  /** Model file format. */
  format: ModelFormat;
  /** File size in bytes. */
  sizeBytes: number;
  /** SHA-256 hex digest of the model file. All-zero = placeholder (skip verification in dev). */
  sha256: string;
  /** CDN download URLs (primary first, fallbacks follow). */
  cdnUrls: string[];
  /** Minimum device tier required to run this model. */
  minDeviceTier: DeviceTier;
  /** If true, this model is only available on iOS. */
  iosOnly?: boolean;
  /** If true, this model is only available on Android. */
  androidOnly?: boolean;
  /** If true, this is the recommended model for its tier. */
  recommended?: boolean;
  /** Human-readable notes about this model variant. */
  notes?: string;
}

export type ModelRegistry = ModelRegistryEntry[];
