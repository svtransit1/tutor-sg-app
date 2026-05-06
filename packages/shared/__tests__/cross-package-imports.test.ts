/**
 * Cross-package import verification — M0 integration gate.
 *
 * Proves that:
 * 1. @tutor-sg/shared exports schema types from its index
 * 2. @tutor-sg/device-tier exports tier detection types and constants
 * 3. @tutor-sg/features exports feature gate definitions
 * 4. @tutor-sg/llm exports model routing table and resolveModel
 * 5. Cross-package resolution works via npm workspaces
 */

// --- Shared package imports ---
import { type ModelRegistryEntry } from '../src/schema/registry';

// --- Device-tier imports ---
import {
  TIER_THRESHOLDS,
  HIGH_TIER_CHIPSETS,
  MODEL_MAP,
  type DeviceTier,
  type DeviceCapabilities,
  type NativeDeviceInfo,
  type HighTierChipset,
} from '@tutor-sg/device-tier';

// --- Features imports ---
import {
  FEATURE_GATES,
  type EntitlementTier,
  type FeatureId,
  type FeatureGate,
} from '@tutor-sg/features';

// --- LLM imports ---
import {
  MODEL_ROUTING,
  CAPABILITY_BUDGETS,
  resolveModel,
  type Subject,
  type ModelId,
  type InferenceTier,
  type ModelRoutingTable,
  type CapabilityBudget,
} from '@tutor-sg/llm';

// ---------------------------------------------------------------------------
// Shared package
// ---------------------------------------------------------------------------

describe('@tutor-sg/shared — cross-package import gate', () => {
  it('exports ModelRegistryEntry type (self-import)', () => {
    const entry: ModelRegistryEntry = {
      modelFamily: 'gemma-2',
      paramCount: 2,
      quant: 'q4_0',
      format: 'gguf',
      sizeBytes: 1000,
      sha256: '00'.repeat(32),
      cdnUrls: ['https://cdn.example.com/model.gguf'],
      minDeviceTier: 'low',
    };
    expect(entry.modelFamily).toBe('gemma-2');
    expect(entry.minDeviceTier).toBe('low');
  });
});

// ---------------------------------------------------------------------------
// Device-tier cross-package imports
// ---------------------------------------------------------------------------

describe('@tutor-sg/device-tier — cross-package import gate', () => {
  it('exports TIER_THRESHOLDS constants', () => {
    expect(TIER_THRESHOLDS.HIGH_RAM_GB).toBe(6);
    expect(TIER_THRESHOLDS.MID_RAM_GB).toBe(4);
    expect(TIER_THRESHOLDS.FLOOR_RAM_GB).toBe(3);
  });

  it('exports HIGH_TIER_CHIPSETS as readonly array', () => {
    expect(HIGH_TIER_CHIPSETS.length).toBeGreaterThan(0);
    expect(HIGH_TIER_CHIPSETS).toContain('A14');
  });

  it('exports MODEL_MAP mapping all tiers', () => {
    const tiers: DeviceTier[] = ['high', 'mid', 'low'];
    for (const tier of tiers) {
      expect(MODEL_MAP[tier]).toBeDefined();
      expect(typeof MODEL_MAP[tier].llm).toBe('string');
      expect(typeof MODEL_MAP[tier].mt).toBe('string');
    }
    expect(MODEL_MAP.low.llm).toBe('none');
  });

  it('DeviceCapabilities type is structurally valid', () => {
    const cap: DeviceCapabilities = {
      tier: 'mid',
      ramGB: 4,
      chipset: 'A14',
      npuAvailable: true,
      belowFloor: false,
    };
    expect(cap.tier).toBe('mid');
  });
});

// ---------------------------------------------------------------------------
// Features cross-package imports
// ---------------------------------------------------------------------------

describe('@tutor-sg/features — cross-package import gate', () => {
  it('exports FEATURE_GATES array', () => {
    expect(FEATURE_GATES.length).toBe(5);
  });

  it('photo_solve is free-tier', () => {
    const gate = FEATURE_GATES.find((g) => g.feature === 'photo_solve');
    expect(gate).toBeDefined();
    expect(gate!.minimumTier).toBe('free');
  });

  it('study_programme is paid-tier', () => {
    const gate = FEATURE_GATES.find((g) => g.feature === 'study_programme');
    expect(gate).toBeDefined();
    expect(gate!.minimumTier).toBe('paid');
  });

  it('every feature has a valid minimumTier', () => {
    const validTiers: EntitlementTier[] = ['free', 'trial', 'paid'];
    for (const gate of FEATURE_GATES) {
      expect(validTiers).toContain(gate.minimumTier);
      expect(typeof gate.feature).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// LLM cross-package imports
// ---------------------------------------------------------------------------

describe('@tutor-sg/llm — cross-package import gate', () => {
  it('exports MODEL_ROUTING table covering all 4 subjects', () => {
    const subjects: Subject[] = ['english', 'math', 'science', 'chinese_mt'];
    for (const subject of subjects) {
      expect(MODEL_ROUTING[subject]).toBeDefined();
    }
  });

  it('route: English/Math/Science → Gemma on both tiers', () => {
    const stemModels: ModelId[] = ['gemma-e4b', 'gemma-e2b'];
    expect(stemModels).toContain(MODEL_ROUTING.english.high);
    expect(stemModels).toContain(MODEL_ROUTING.english.mid);
    expect(stemModels).toContain(MODEL_ROUTING.math.high);
    expect(stemModels).toContain(MODEL_ROUTING.math.mid);
    expect(stemModels).toContain(MODEL_ROUTING.science.high);
    expect(stemModels).toContain(MODEL_ROUTING.science.mid);
  });

  it('route: Chinese MT → Qwen on both tiers', () => {
    expect(MODEL_ROUTING.chinese_mt.high).toBe('qwen-4b');
    expect(MODEL_ROUTING.chinese_mt.mid).toBe('qwen-2b');
  });

  it('resolveModel returns correct model per subject+tier', () => {
    expect(resolveModel('english', 'high')).toBe('gemma-e4b');
    expect(resolveModel('english', 'mid')).toBe('gemma-e2b');
    expect(resolveModel('chinese_mt', 'high')).toBe('qwen-4b');
    expect(resolveModel('chinese_mt', 'mid')).toBe('qwen-2b');
  });

  it('exports CAPABILITY_BUDGETS with 3 entries', () => {
    expect(CAPABILITY_BUDGETS.length).toBe(3);
  });

  it('photo_solve prefers high tier', () => {
    const cap = CAPABILITY_BUDGETS.find((c) => c.capability === 'photo_solve');
    expect(cap).toBeDefined();
    expect(cap!.preferredTier).toBe('high');
  });

  it('quick_chat prefers mid tier', () => {
    const cap = CAPABILITY_BUDGETS.find((c) => c.capability === 'quick_chat');
    expect(cap).toBeDefined();
    expect(cap!.preferredTier).toBe('mid');
  });
});
