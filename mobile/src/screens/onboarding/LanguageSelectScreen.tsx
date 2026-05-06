/**
 * LanguageSelectScreen — Onboarding step 2/7.
 *
 * Per Article 12 (§3.2 LANG_PICK):
 * - Purpose: language is needed before any other copy renders.
 * - No "system default" — explicit pick to surface our SG-bilingual posture.
 * - Two large tiles, equal weight. No "next" button — tap = commit.
 * - Persisted to prefs.locale immediately on tap.
 *
 * Edge: if accessibility large-text is on, tiles reflow to vertical stack,
 * no copy clipping.
 *
 * @module LanguageSelectScreen
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Animated,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import i18n from '../../i18n';
import { persistLocale } from '../../storage/onboarding-state';

/** Locale code used in language selection. */
export type OnboardingLocale = 'en' | 'zh-Hans';
import OnboardingProgressIndicator from '../../components/OnboardingProgressIndicator';

// ── Props ──────────────────────────────────────────────────────────

interface LanguageSelectScreenProps {
  /** Override for tests — in production, uses expo-router. */
  onLanguageSelected?: (locale: OnboardingLocale) => void;
}

// ── Tile data ──────────────────────────────────────────────────────

interface LanguageTile {
  code: OnboardingLocale;
  /** Label shown in English mode. */
  labelEn: string;
  /** Label shown in zh-Hans mode. */
  labelNative: string;
}

const LANGUAGE_TILES: LanguageTile[] = [
  { code: 'en', labelEn: 'English', labelNative: '英文' },
  { code: 'zh-Hans', labelEn: '中文 (简体)', labelNative: '中文（简体）' },
];

// ── Component ──────────────────────────────────────────────────────

export default function LanguageSelectScreen({
  onLanguageSelected,
}: LanguageSelectScreenProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [selected, setSelected] = useState<OnboardingLocale | null>(null);
  const [committing, setCommitting] = useState(false);

  // ── Detect large text / narrow screen → vertical stack ──────
  // Per spec: if accessibility large-text is on, tiles reflow to vertical.
  const isVertical = screenWidth < 400;

  // ── Mounted ref to guard against async navigation after unmount ──
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Tap handler — select AND commit (no "Next" button) ──────

  const handleSelect = useCallback(
    (locale: OnboardingLocale) => {
      if (committing) return; // prevent double-tap
      setSelected(locale);
      setCommitting(true);

      // Persist immediately per Article 12 §3.2
      persistLocale(locale);

      // Switch i18n locale so subsequent screens render in chosen language
      i18n.changeLanguage(locale);

      // Navigate immediately — visual feedback comes from tile
      // highlight/checkmark, not a timeout delay
      if (isMounted.current) {
        if (onLanguageSelected) {
          onLanguageSelected(locale);
        } else {
          router.replace('/(onboarding)/consent');
        }
      }
    },
    [committing, onLanguageSelected],
  );

  // ── Render ───────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <OnboardingProgressIndicator currentStep={2} totalSteps={7} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>
              {t('onboarding.langPick.title')}
            </Text>
            <Text style={styles.subtitle}>
              {t('onboarding.langPick.subtitle')}
            </Text>
          </View>

          {/* Language tiles */}
          <View
            style={[
              styles.tilesContainer,
              isVertical ? styles.tilesVertical : styles.tilesHorizontal,
            ]}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('onboarding.langPick.title')}
          >
            {LANGUAGE_TILES.map((tile) => {
              const isSelected = selected === tile.code;
              return (
                <TouchableOpacity
                  key={tile.code}
                  style={[
                    styles.tile,
                    isVertical ? styles.tileVertical : styles.tileHorizontal,
                    isSelected && styles.tileSelected,
                  ]}
                  onPress={() => handleSelect(tile.code)}
                  disabled={committing}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${tile.labelEn}${isSelected ? ', selected' : ''}`}
                  activeOpacity={0.8}
                >
                  {/* Checkmark overlay when selected */}
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}

                  {/* Language label — shows label matching current locale */}
                  <Text
                    style={[
                      styles.tileLabel,
                      isSelected && styles.tileLabelSelected,
                    ]}
                  >
                    {tile.labelEn}
                  </Text>

                  {/* Native label — always shown smaller below */}
                  <Text
                    style={[
                      styles.tileSubLabel,
                      isSelected && styles.tileSubLabelSelected,
                    ]}
                  >
                    {tile.labelNative}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { letterSpacing: -0.3 },
      android: { letterSpacing: 0 },
    }),
  } as TextStyle,
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 16,
  } as TextStyle,

  // ── Tiles ─────────────────────────────────────────────────────
  tilesContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  tilesHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tilesVertical: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  tile: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    minHeight: 140,
  },
  tileHorizontal: {
    flex: 1,
    maxWidth: 220,
  },
  tileVertical: {
    width: '100%',
    maxWidth: 320,
  },
  tileSelected: {
    borderColor: '#4A90D9',
    backgroundColor: '#EBF2FF',
  },

  // ── Checkmark badge ───────────────────────────────────────────
  checkmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Tile labels ───────────────────────────────────────────────
  tileLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  } as TextStyle,
  tileLabelSelected: {
    color: '#4A90D9',
  },
  tileSubLabel: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  } as TextStyle,
  tileSubLabelSelected: {
    color: '#6B8FC9',
  },
});
