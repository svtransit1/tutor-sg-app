/**
 * @tutor-sg/i18n — Internationalization infrastructure for Tutor SG.
 *
 * ## Architecture
 * - Namespace strategy: common, onboarding, homework, parent, settings
 * - Flat keys within each namespace (keySeparator: false — dots are literal)
 * - Default namespace is `common` — common keys used directly
 * - Other namespaces use `ns:key` syntax or `{ ns }` option
 *
 * ## Quick start (in App.tsx or root layout)
 *
 * ```ts
 * import { initializeI18n, TutorSGProvider } from '@tutor-sg/i18n';
 *
 * export default function App() {
 *   const [ready, setReady] = useState(false);
 *
 *   useEffect(() => {
 *     initializeI18n().then(() => setReady(true));
 *   }, []);
 *
 *   if (!ready) return <SplashScreen />;
 *   return <TutorSGProvider><RootNavigator /></TutorSGProvider>;
 * }
 * ```
 *
 * ## Usage in components
 *
 * ```tsx
 * import { useI18n } from '@tutor-sg/i18n';
 *
 * function SaveButton() {
 *   const { t } = useI18n();
 *   return <Text>{t('save')}</Text>;          // common namespace (default)
 * }
 *
 * function WelcomeScreen() {
 *   const { t } = useI18n();
 *   return <Text>{t('onboarding:welcome_title')}</Text>;  // onboarding namespace
 * }
 * ```
 */

// Core config
export { initializeI18n, detectDeviceLocale, setLocale, detectIsGregorianCalendar } from './config';
export type { I18nConfig } from './config';

// Namespace exports
export { NAMESPACES, DEFAULT_NS } from './types';
export type { I18nNamespace } from './types';

// Type-safe translation
export type {
  TranslationKey,
  SupportedLocale,
  TranslationInterpolationMap,
  InterpolationParams,
  CommonKey,
  OnboardingKey,
  HomeworkKey,
  ParentKey,
  SettingsKey,
} from './types';

// Hook + Provider
export { useI18n, TutorSGProvider } from './useI18n';
