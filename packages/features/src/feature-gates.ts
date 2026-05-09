export type EntitlementTier = 'free' | 'trial' | 'paid';

export type FeatureId =
  | 'photo_solve'
  | 'photo_solve_unlimited'
  | 'parent_report'
  | 'chinese_stroke_check'
  | 'study_programme';

export interface FeatureGate {
  feature: FeatureId;
  minimumTier: EntitlementTier;
}

/**
 * Feature gate table — ADD §4.3.
 * Each feature declares the minimum entitlement tier required.
 */
export const FEATURE_GATES: FeatureGate[] = [
  { feature: 'photo_solve',              minimumTier: 'free' },
  { feature: 'photo_solve_unlimited',    minimumTier: 'trial' },
  { feature: 'parent_report',            minimumTier: 'trial' },
  { feature: 'chinese_stroke_check',     minimumTier: 'trial' },
  { feature: 'study_programme',          minimumTier: 'paid' },
] as const;
