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

/**
 * Placeholder entries for development. Replace sha256 and cdnUrls
 * with real values once model artifacts are uploaded to CDN.
 */
export const SAMPLE_REGISTRY: ModelRegistry = [
  {
    modelFamily: 'gemma-3',
    paramCount: 2,
    quant: 'q4_k_m',
    format: 'gguf',
    sizeBytes: 1_300_000_000,
    sha256: '0'.repeat(64), // placeholder — replace with real hash
    cdnUrls: ['https://cdn.example.com/models/gemma-3-2b-q4_k_m.gguf'],
    minDeviceTier: 'low',
    recommended: true,
    notes: 'Default mid-tier model — best quality/size tradeoff for 4 GB RAM devices',
  },
  {
    modelFamily: 'gemma-3',
    paramCount: 4,
    quant: 'q4_k_m',
    format: 'gguf',
    sizeBytes: 2_500_000_000,
    sha256: '0'.repeat(64), // placeholder — replace with real hash
    cdnUrls: ['https://cdn.example.com/models/gemma-3-4b-q4_k_m.gguf'],
    minDeviceTier: 'mid',
    recommended: true,
    notes: 'Default high-tier model — requires ≥6 GB RAM + modern NPU',
  },
];
