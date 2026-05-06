export type Subject = 'english' | 'math' | 'science' | 'chinese_mt';

export type ModelId = 'gemma-e4b' | 'gemma-e2b' | 'qwen-4b' | 'qwen-2b';

export type InferenceTier = 'high' | 'mid';

export interface ModelRoutingEntry {
  high: ModelId;
  mid: ModelId;
}

export type ModelRoutingTable = Record<Subject, ModelRoutingEntry>;

/**
 * Model routing table — ARCHITECTURE.md §3.2.
 * Maps subject → model per inference tier.
 * Never hardcode model IDs in conditionals; use this table.
 */
export const MODEL_ROUTING: ModelRoutingTable = {
  english:     { high: 'gemma-e4b', mid: 'gemma-e2b' },
  math:        { high: 'gemma-e4b', mid: 'gemma-e2b' },
  science:     { high: 'gemma-e4b', mid: 'gemma-e2b' },
  chinese_mt:  { high: 'qwen-4b',    mid: 'qwen-2b' },
} as const;

/**
 * Capability inference budget — ARCHITECTURE.md §3.3.
 */
export type CapabilityId =
  | 'photo_solve'
  | 'quick_chat'
  | 'chinese_stroke_check';

export interface CapabilityBudget {
  capability: CapabilityId;
  preferredTier: InferenceTier;
}

export const CAPABILITY_BUDGETS: CapabilityBudget[] = [
  { capability: 'photo_solve',           preferredTier: 'high' },
  { capability: 'quick_chat',            preferredTier: 'mid' },
  { capability: 'chinese_stroke_check',  preferredTier: 'high' },
] as const;

export function resolveModel(subject: Subject, tier: InferenceTier): ModelId {
  return MODEL_ROUTING[subject][tier];
}
