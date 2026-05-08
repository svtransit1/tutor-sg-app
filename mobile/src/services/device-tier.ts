import { Platform } from "react-native";

export type DeviceTier = "high" | "mid" | "unsupported";

export interface ModelEntry {
  id: string;
  fileName: string;
  cdnUrl: string;
  sizeBytes: number;
  sha256: string;
}

const MODEL_MANIFEST: Record<DeviceTier, ModelEntry[]> = {
  high: [
    {
      id: "gemma-e4b",
      fileName: "gemma-4-e4b-q4_k_m.gguf",
      cdnUrl: "https://cdn.example.com/models/gemma-4-e4b-q4_k_m.gguf",
      sizeBytes: 2684354560,
      sha256: "0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
      id: "qwen-4b",
      fileName: "qwen-3.5-4b-nvfp4.gguf",
      cdnUrl: "https://cdn.example.com/models/qwen-3.5-4b-nvfp4.gguf",
      sizeBytes: 2576980378,
      sha256: "0000000000000000000000000000000000000000000000000000000000000000",
    },
  ],
  mid: [
    {
      id: "gemma-e2b",
      fileName: "gemma-4-e2b-q4_0.gguf",
      cdnUrl: "https://cdn.example.com/models/gemma-4-e2b-q4_0.gguf",
      sizeBytes: 1395864371,
      sha256: "0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
      id: "qwen-2b",
      fileName: "qwen-3.5-2b-q4_0.gguf",
      cdnUrl: "https://cdn.example.com/models/qwen-3.5-2b-q4_0.gguf",
      sizeBytes: 1288490189,
      sha256: "0000000000000000000000000000000000000000000000000000000000000000",
    },
  ],
  unsupported: [],
};

function totalDownloadSize(models: ModelEntry[]): number {
  return models.reduce((sum, m) => sum + m.sizeBytes, 0);
}

function formatSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  return `${(bytes / 1048576).toFixed(0)} MB`;
}

function modelNames(models: ModelEntry[]): string {
  return models.map((m) => m.id).join(", ");
}

function detectRamGb(): number {
  if (Platform.OS === "ios") return 6;
  if (Platform.OS === "android") return 4;
  return 4;
}

export function detectDeviceTier(): {
  tier: DeviceTier;
  models: ModelEntry[];
  downloadSizeLabel: string;
  modelNamesLabel: string;
} {
  const ramGb = detectRamGb();
  let tier: DeviceTier;
  if (ramGb >= 6) tier = "high";
  else if (ramGb >= 3) tier = "mid";
  else tier = "unsupported";

  const models = MODEL_MANIFEST[tier];
  return {
    tier,
    models,
    downloadSizeLabel: formatSize(totalDownloadSize(models)),
    modelNamesLabel: modelNames(models),
  };
}

export { totalDownloadSize, formatSize, modelNames, MODEL_MANIFEST };
