/**
 * Parent profile & kid management route — Onboarding step.
 * Route: /onboarding/parent-kid-management
 *
 * Per M2-26 / AAAS-165: Parent configures display name, language preference,
 * and manages child profiles (add/edit/remove, up to 4, each with name + grade + language).
 * Proceeds to device tier check + model download.
 */
import ParentKidManagementScreen from '../../src/screens/onboarding/ParentKidManagementScreen';

export default function ParentKidManagementRoute() {
  return <ParentKidManagementScreen />;
}
