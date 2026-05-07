/**
 * @tutor-sg/i18n — Internationalization infrastructure for Tutor SG.
 *
 * Provides:
 * - i18next + react-i18next initialization (flat key structure)
 * - Device locale detection via expo-localization
 * - Type-safe useTranslation hook
 * - Starter translation resources for EN and zh-Hans
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
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n();
 *   return <Text>{t('common.save')}</Text>;
 * }
 * ```
 */

// Re-export everything
export { initializeI18n, detectDeviceLocale, setLocale, detectIsGregorianCalendar } from './config';
export type { I18nConfig } from './config';

export type {
  TranslationKey,
  SupportedLocale,
  TranslationInterpolationMap,
  InterpolationParams,
} from './types';

// Hook + Provider
export { useI18n, TutorSGProvider } from './useI18n';
