import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/Skeleton'
import type { SQLiteDatabase } from 'expo-sqlite'
import type { DeviceTier } from '@tutor-sg/device-tier'
import {
  openDatabase,
  ensureSettingsTable,
  loadDeviceTier,
  saveDeviceTier,
  clearDeviceTier,
  MODEL_MAP,
} from '@tutor-sg/device-tier'
import type { Locale } from '@tutor-sg/shared'
import { useRouter } from 'expo-router'

type QualityOption = DeviceTier | 'auto'

const QUALITY_OPTIONS: { value: QualityOption; labelKey: string }[] = [
  { value: 'auto', labelKey: 'parent.settings.qualityAuto' },
  { value: 'high', labelKey: 'parent.settings.qualityHigh' },
  { value: 'mid', labelKey: 'parent.settings.qualityStandard' },
  { value: 'low', labelKey: 'parent.settings.qualityLow' },
]

const TIER_DISPLAY: Record<DeviceTier, string> = {
  high: 'High Performance',
  mid: 'Standard',
  low: 'Low',
}

export default function ParentSettingsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'
  const [db, setDb] = useState<SQLiteDatabase | null>(null)
  const [overrideTier, setOverrideTier] = useState<QualityOption>('auto')
  const [loadingDb, setLoadingDb] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const database = await openDatabase()
        await ensureSettingsTable(database)
        setDb(database)
        const saved = await loadDeviceTier(database)
        if (saved) {
          setOverrideTier(saved)
        }
      } catch {
        // DB not available — show defaults
      } finally {
        setLoadingDb(false)
      }
    })()
  }, [])

  const handleQualityChange = useCallback(
    async (value: QualityOption) => {
      setOverrideTier(value)
      if (!db) return
      try {
        if (value === 'auto') {
          await clearDeviceTier(db)
        } else {
          await saveDeviceTier(db, value)
        }
      } catch {
        // persist failure — swallow; UI state is already updated optimistically
      }
    },
    [db],
  )

  const handleLanguageChange = useCallback(
    (locale: Locale) => {
      i18n.changeLanguage(locale)
    },
    [i18n],
  )

  const selectedTier: DeviceTier = overrideTier === 'auto' ? 'high' : overrideTier
  const displayLabel =
    overrideTier === 'auto'
      ? t('parent.settings.tierAuto', { tier: TIER_DISPLAY[selectedTier] })
      : t('parent.settings.tierOverride', { tier: TIER_DISPLAY[selectedTier] })

  const modelInfo = MODEL_MAP[selectedTier]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('parent.settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loadingDb ? (
          <View style={styles.loadingContainer}>
            <Skeleton.Card height={200} isDark={isDark} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('parent.settings.sectionQuality')}</Text>
              <Text style={styles.sectionDescription}>
                {t('parent.settings.qualityDescription')}
              </Text>

              <View style={styles.optionsRow}>
                {QUALITY_OPTIONS.map((opt) => {
                  const isSelected = overrideTier === opt.value
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => handleQualityChange(opt.value)}
                      accessibilityRole="button"
                      accessibilityLabel={t(opt.labelKey)}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {t(opt.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Text style={styles.statusText}>{displayLabel}</Text>

              <View style={styles.modelInfoBox}>
                <Text style={styles.modelInfoText}>
                  {t('parent.settings.modelInfo', {
                    llm: modelInfo.llm,
                    mt: modelInfo.mt,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('parent.settings.sectionLanguage')}</Text>
              <Text style={styles.sectionDescription}>
                {t('parent.settings.languageDescription')}
              </Text>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.langPill, i18n.language === 'en' && styles.pillSelected]}
                  onPress={() => handleLanguageChange('en')}
                  accessibilityRole="button"
                  accessibilityLabel={t('parent.settings.languageEn')}
                  accessibilityState={{ selected: i18n.language === 'en' }}
                >
                  <Text
                    style={[styles.pillText, i18n.language === 'en' && styles.pillTextSelected]}
                  >
                    {t('parent.settings.languageEn')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langPill, i18n.language === 'zh-Hans' && styles.pillSelected]}
                  onPress={() => handleLanguageChange('zh-Hans')}
                  accessibilityRole="button"
                  accessibilityLabel={t('parent.settings.languageZh')}
                  accessibilityState={{ selected: i18n.language === 'zh-Hans' }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      i18n.language === 'zh-Hans' && styles.pillTextSelected,
                    ]}
                  >
                    {t('parent.settings.languageZh')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footerInfo}>{t('parent.settings.footerInfo')}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#4A90D9',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    borderColor: '#4A90D9',
    backgroundColor: '#EBF2FF',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  pillTextSelected: {
    color: '#4A90D9',
  },
  langPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  modelInfoBox: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modelInfoText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'monospace',
  },
  footerInfo: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    lineHeight: 18,
  },
})
