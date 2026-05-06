/**
 * Parent PIN Setup route — Onboarding step 3/7.
 * Route: /onboarding/parent-pin-setup
 *
 * Per First-90-Seconds Onboarding Dev Spec §3.4:
 * Two-step 4-digit PIN entry with confirmation.
 * PIN stored in OS keychain via expo-secure-store.
 */
import ParentPinSetupScreen from '../../src/screens/onboarding/ParentPinSetupScreen';

export default function ParentPinSetupRoute() {
  return <ParentPinSetupScreen />;
}
