// @tutor-sg/features — Feature gates and entitlements

export type EntitlementTier = 'free' | 'basic' | 'premium'
export type FeatureId = string

export interface FeatureGate {
  id: FeatureId
  entitlement: EntitlementTier
  enabled: boolean
}

export const FEATURE_GATES: Record<string, FeatureGate> = {}
