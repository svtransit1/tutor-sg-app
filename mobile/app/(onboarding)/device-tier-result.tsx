/**
 * Device Tier Result route — Onboarding step 3/7.
 *
 * Route: /onboarding/device-tier-result
 *
 * Detects device capabilities, shows model download info,
 * and offers download CTAs with cellular data warning.
 * Below-floor devices get a "device too old" message.
 *
 * Per ADD §3.3-3.4 and locked decisions:
 * - Device tier gating: runtime detection (RAM + NPU sniff)
 * - First-launch download of models (not bundled)
 * - Bilingual EN/zh-Hans throughout
 *
 * @module DeviceTierResultRoute
 */
import DeviceTierScreen from '../../src/screens/onboarding/DeviceTierScreen';
import { router } from 'expo-router';

export default function DeviceTierResultRoute() {
  const handleComplete = () => {
    // Navigate to the next onboarding step (step 4 — grade pick + subject multi-select)
    router.replace('/(onboarding)/grade-pick');
  };

  return <DeviceTierScreen onComplete={handleComplete} />;
}
