/**
 * Language Select screen — Onboarding step 2/7.
 *
 * Route: /onboarding/language-select
 *
 * Per Article 12 (§3.2): two large tiles, tap = commit, no "Next" button.
 * Language choice is persisted to MMKV via onboarding-state and i18n locale
 * is switched immediately so subsequent screens render in chosen language.
 */
import LanguageSelectScreen from '../../src/screens/onboarding/LanguageSelectScreen';

export default function LanguageSelectRoute() {
  return <LanguageSelectScreen />;
}
