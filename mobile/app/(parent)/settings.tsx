import React, { useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'

export default function ParentSettingsScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const handleLanguageChange = useCallback(
    (locale: string) => {
      i18n.changeLanguage(locale)
    },
    [i18n],
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('parent.settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('parent.settings.sectionLanguage')}
          </Text>
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
                style={[styles.pillText, i18n.language === 'zh-Hans' && styles.pillTextSelected]}
              >
                {t('parent.settings.languageZh')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('parent.settings.sectionPrivacy')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('parent.settings.privacyDescription')}
          </Text>
          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>
              {t('parent.settings.privacyBody')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#2563EB' },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  section: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 },
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
  optionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  langPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  pillSelected: { borderColor: '#2563EB', backgroundColor: '#EBF2FF' },
  pillText: { fontSize: 15, fontWeight: '600', color: '#555' },
  pillTextSelected: { color: '#2563EB' },
  privacyBox: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
  },
  privacyText: { fontSize: 14, lineHeight: 22, color: '#555' },
})
