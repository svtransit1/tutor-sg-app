/**
 * LANG_PICK Screen — Onboarding Step 1/7
 *
 * Language selection screen shown at the very start of the onboarding flow.
 * User picks between English (en) and Simplified Chinese (zh-Hans).
 * The choice is persisted to MMKV and i18n is switched immediately.
 *
 * Layout (top to bottom):
 * 1. Progress indicator: "Step 1 of 7" + dot row
 * 2. Globe icon
 * 3. Title: "Choose your language" / "选择语言"
 * 4. Subtitle: "Your app will use this language."
 * 5. Two tappable language cards side by side
 * 6. Continue button (disabled until selection)
 *
 * Bilingual: title/subtitle shown in the app's current locale
 * (English by default since language hasn't been chosen yet).
 * Language card labels are shown in their own language:
 *   - English → "English 🇬🇧"
 *   - 中文 → "中文 🇨🇳"
 *
 * Accessibility: min 44pt touch targets, VoiceOver labels on all
 * interactive elements, high-contrast selected state.
 *
 * @module LANG_PICK
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { persistLocale } from '@/storage/onboarding-state';

// ── Constants ──────────────────────────────────────────────────────────

const ONBOARDING_TOTAL_STEPS = 7;
const ONBOARDING_CURRENT_STEP = 1;

interface LanguageOption {
  /** ISO language tag used in i18n and persistLocale */
  locale: 'en' | 'zh-Hans';
  /** Label shown inside the card — written in the target language itself */
  label: string;
  /** Emoji flag / icon */
  icon: string;
}

const LANGUAGES: LanguageOption[] = [
  { locale: 'en', label: 'English', icon: '🇬🇧' },
  { locale: 'zh-Hans', label: '中文', icon: '🇨🇳' },
];

// ── Dot Row Component ──────────────────────────────────────────────────

/** Renders a row of progress dots. Active dot is filled, rest are outlined. */
function ProgressDots({
  total,
  current,
  isDark,
}: {
  total: number;
  current: number;
  isDark: boolean;
}) {
  const dots = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <View style={styles.dotsRow} accessibilityRole="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
      {dots.map((step) => {
        const isActive = step <= current;
        return (
          <View
            key={step}
            style={[
              styles.dot,
              {
                backgroundColor: isActive
                  ? isDark
                    ? '#90CAF9'
                    : '#2563EB'
                  : isDark
                    ? '#333333'
                    : '#E5E7EB',
                width: step === current ? 24 : 8,
                borderRadius: 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ── Language Card Component ────────────────────────────────────────────

function LanguageCard({
  option,
  isSelected,
  isDark,
  onPress,
}: {
  option: LanguageOption;
  isSelected: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.langCard,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isSelected
            ? isDark
              ? '#90CAF9'
              : '#2563EB'
            : isDark
              ? '#333333'
              : '#E5E7EB',
          borderWidth: isSelected ? 2.5 : 1.5,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${option.label} — ${option.locale === 'en' ? 'English' : 'Simplified Chinese'}`}
      accessibilityState={{ selected: isSelected }}
      activeOpacity={0.7}
    >
      {/* Selection checkmark — top-right corner */}
      {isSelected && (
        <View
          style={[
            styles.checkBadge,
            { backgroundColor: isDark ? '#90CAF9' : '#2563EB' },
          ]}
          accessibilityElementsHidden
        >
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}

      {/* Language icon */}
      <Text style={styles.langIcon}>{option.icon}</Text>

      {/* Language label */}
      <Text
        style={[
          styles.langLabel,
          {
            color: isDark ? '#FFFFFF' : '#1A1A1A',
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
      >
        {option.label}
      </Text>

      {/* Helper text — language name in English for disambiguation */}
      <Text
        style={[
          styles.langSubtext,
          { color: isDark ? '#888888' : '#9CA3AF' },
        ]}
        numberOfLines={1}
      >
        {option.locale === 'en' ? 'English' : '简体中文'}
      </Text>
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────

export default function LangPickScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [selectedLocale, setSelectedLocale] = useState<'en' | 'zh-Hans' | null>(null);

  const handleSelect = (locale: 'en' | 'zh-Hans') => {
    setSelectedLocale(locale);
  };

  const handleContinue = () => {
    if (!selectedLocale) return;

    // 1. Persist locale to MMKV
    persistLocale(selectedLocale);

    // 2. Switch i18n language immediately so subsequent onboarding
    //    screens render in the chosen language
    i18n.changeLanguage(selectedLocale);

    // 3. Navigate to next onboarding step (welcome / step 2)
    //    Using replace so back navigation goes to app start, not lang-pick
    router.replace('/(onboarding)/welcome');
  };

  const canContinue = selectedLocale !== null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* ── Progress Indicator ── */}
      <View style={styles.progressSection}>
        <ProgressDots
          total={ONBOARDING_TOTAL_STEPS}
          current={ONBOARDING_CURRENT_STEP}
          isDark={isDark}
        />
        <Text
          style={[styles.stepText, { color: isDark ? '#888888' : '#9CA3AF' }]}
          accessibilityLabel={t('onboarding.progress.accessibility', {
            current: ONBOARDING_CURRENT_STEP,
            total: ONBOARDING_TOTAL_STEPS,
          })}
        >
          {t('onboarding.progress.step', {
            current: ONBOARDING_CURRENT_STEP,
            total: ONBOARDING_TOTAL_STEPS,
          })}
        </Text>
      </View>

      {/* ── Content Area ── */}
      <View style={styles.content}>
        {/* Globe icon */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' },
          ]}
        >
          <Text style={styles.globeIcon}>🌐</Text>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
          accessibilityRole="header"
        >
          {t('onboarding.langPick.title')}
        </Text>

        {/* Subtitle */}
        <Text
          style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#6B7280' }]}
        >
          {t('onboarding.langPick.subtitle')}
        </Text>

        {/* Language Cards */}
        <View style={styles.languageCardsRow}>
          {LANGUAGES.map((lang) => (
            <LanguageCard
              key={lang.locale}
              option={lang}
              isSelected={selectedLocale === lang.locale}
              isDark={isDark}
              onPress={() => handleSelect(lang.locale)}
            />
          ))}
        </View>
      </View>

      {/* ── Continue Button ── */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: canContinue
                ? isDark
                  ? '#2563EB'
                  : '#4A90D9'
                : isDark
                  ? '#333333'
                  : '#D1D5DB',
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel={
            canContinue
              ? `${t('onboarding.langPick.title')} — ${selectedLocale}`
              : 'Select a language first'
          }
          accessibilityState={{ disabled: !canContinue }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueText,
              { color: canContinue ? '#FFFFFF' : isDark ? '#666666' : '#9CA3AF' },
            ]}
          >
            {t('onboarding.langPick.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Progress ──
  progressSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Content ──
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },

  // Globe icon
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  globeIcon: { fontSize: 40 },

  // Title & subtitle
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // ── Language Cards ──
  languageCardsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  langCard: {
    flex: 1,
    maxWidth: 156,
    aspectRatio: 0.85,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  langIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  langLabel: {
    fontSize: 20,
    letterSpacing: -0.2,
  },
  langSubtext: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Bottom ──
  bottomSection: {
    paddingBottom: 16,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
