/**
 * Device Tier Result screen — Onboarding step 3/7.
 *
 * Route: /onboarding/device-tier-result
 *
 * Shows the detected device tier and asks for consent to download
 * the AI models. Transitions to model download screen on proceed.
 */
import DeviceTierResultScreen from '../../src/screens/onboarding/DeviceTierResultScreen';
import { router } from 'expo-router';

export default function DeviceTierResultRoute() {
  const handleDownloadNow = () => {
    // Navigate to model download screen (AAAS-40)
    router.replace('/(onboarding)/model-download');
  };

  const handleDownloadLater = () => {
    // Skip download for now; user can trigger from settings later
    router.replace('/(onboarding)/parent-pin-setup');
  };

  return (
    <DeviceTierResultScreen
      onDownloadNow={handleDownloadNow}
      onDownloadLater={handleDownloadLater}
    />
  );
}
