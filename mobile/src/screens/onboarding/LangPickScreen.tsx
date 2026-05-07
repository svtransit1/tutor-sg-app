/**
 * LangPickScreen — onboarding step 1/7.
 *
 * Per Article 12 §3.2:
 * - Two large tiles, equal weight. No "next" button — tap = commit.
 * - Tap persists locale to MMKV and navigates to AGE_GATE.
 * - Bilingual labels adapt to the current device locale via i18n.
 * - Accessibility large-text: tiles reflow to vertical stack.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { persistLocale } from '../../storage/onboarding-state';

interface LangTile {
  locale: 'en' | 'zh-Hans';
  labelKey: string;
  subKey: string;
  flag: string;
}

const TILES: LangTile[] = [
  { locale: 'en', labelKey: 'onboarding.langPick.english', subKey: 'onboarding.langPick.englishSub', flag: '🇬🇧' },
  { locale: 'zh-Hans', labelKey: 'onboarding.langPick.chinese', subKey: 'onboarding.langPick.chineseSub', flag: '🇨🇳' },
];

function useVerticalLayout(): boolean {
  const { fontScale, width } = useWindowDimensions();
  const [vertical, setVertical] = useState(fontScale >= 1.3 || width < 360);
  useEffect(() => {
    setVertical(fontScale >= 1.3 || width < 360);
  }, [fontScale, width]);
  return vertical;
}

export default function LangPickScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const useVertical = useVerticalLayout();

  const handleTilePress = useCallback(
    (locale: 'en' | 'zh-Hans') => {
      persistLocale(locale);
      i18n.changeLanguage(locale);
      router.replace('/(onboarding)/age-gate');
    },
    [i18n, router],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title} accessibilityRole="header">
        {t('onboarding.langPick.title')}
      </Text>

      <View
        style={[
          styles.tilesContainer,
          useVertical && styles.tilesContainerVertical,
        ]}
      >
        {TILES.map((tile) => (
          <Pressable
            key={tile.locale}
            style={({ pressed }) => [
              styles.tile,
              useVertical && styles.tileVertical,
              pressed && styles.tilePressed,
            ]}
            onPress={() => handleTilePress(tile.locale)}
            accessibilityRole="button"
            accessibilityLabel={`${t(tile.labelKey)} — ${t(tile.subKey)}`}
            accessibilityHint={t('onboarding.langPick.title')}
          >
            <Text style={styles.tileFlag}>{tile.flag}</Text>
            <View style={styles.tileTextWrap}>
              <Text style={[styles.tileLabel, useVertical && styles.tileLabelVertical]}>
                {t(tile.labelKey)}
              </Text>
              <Text style={styles.tileSub}>
                {t(tile.subKey)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 40, letterSpacing: -0.3 },
  tilesContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  tilesContainerVertical: { flexDirection: 'column', justifyContent: 'center', gap: 20 },
  tile: { flex: 1, maxWidth: 156, aspectRatio: 0.85, borderRadius: 20, backgroundColor: '#F8F9FA', borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', paddingVertical: 24, paddingHorizontal: 12, gap: 8 },
  tileVertical: { flex: 0, width: '100%', maxWidth: 320, aspectRatio: 2.8, flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 16, paddingHorizontal: 24, gap: 12 },
  tilePressed: { backgroundColor: '#EFF6FF', borderColor: '#2563EB', opacity: 0.9 },
  tileFlag: { fontSize: 44 },
  tileTextWrap: { alignItems: 'center', gap: 4 },
  tileLabel: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.2 },
  tileLabelVertical: { fontSize: 18 },
  tileSub: { fontSize: 13, fontWeight: '500', color: '#9CA3AF', textAlign: 'center' },
});
