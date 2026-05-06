export type ModelFamily = 'gemma-2' | 'gemma-3';
export type QuantLevel = 'q4_0' | 'q4_k_m' | 'q8_0' | 'fp16';
export type ModelFormat = 'gguf' | 'mlx';
export type DeviceTier = 'low' | 'mid' | 'high';

export interface ModelRegistryEntry {
  modelFamily: ModelFamily;
  paramCount: number;
  quant: QuantLevel;
  format: ModelFormat;
  sizeBytes: number;
  sha256: string;
  cdnUrls: string[];
  minDeviceTier: DeviceTier;
  iosOnly?: boolean;
  androidOnly?: boolean;
  recommended?: boolean;
  notes?: string;
}

export type ModelRegistry = ModelRegistryEntry[];
