import {
  FEATURE_GATES,
  type EntitlementTier,
  type FeatureId,
  type FeatureGate,
} from '../index';

describe('@tutor-sg/features — smoke test', () => {
  it('exports FEATURE_GATES with 5 entries', () => {
    expect(FEATURE_GATES.length).toBe(5);
  });

  it('photo_solve is free, study_programme is paid', () => {
    const ps = FEATURE_GATES.find((g) => g.feature === 'photo_solve');
    expect(ps!.minimumTier).toBe('free');
    const sp = FEATURE_GATES.find((g) => g.feature === 'study_programme');
    expect(sp!.minimumTier).toBe('paid');
  });

  it('EntitlementTier type is valid', () => {
    const tiers: EntitlementTier[] = ['free', 'trial', 'paid'];
    expect(tiers.length).toBe(3);
  });

  it('FeatureGate interface is structurally sound', () => {
    const gate: FeatureGate = { feature: 'parent_report', minimumTier: 'trial' };
    expect(gate.feature).toBe('parent_report');
  });
});
