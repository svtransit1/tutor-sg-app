import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { isWelcomeDismissed, dismissWelcome } from '../../src/storage/onboarding';
import { KidProfileRepository } from '../../src/storage/kidProfiles';

type SubjectKey = 'math' | 'english' | 'chinese' | 'science';

const SUBJECTS: SubjectKey[] = ['math', 'english', 'chinese', 'science'];

const SUBJECT_ICONS: Record<SubjectKey, string> = {
  math: '\u{1F522}',
  english: '\u{1F4DA}',
  science: '\u{1F52C}',
  chinese: '\u{1F4D6}',
};

export default function KidHomeScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [kidName, setKidName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dismissed = await isWelcomeDismissed();
        const profiles = await KidProfileRepository.getProfiles();
        const active = profiles.find(p => p.isActive) || profiles[0] || null;
        if (active) setKidName(active.name);
        if (!dismissed && !active) setShowWelcome(true);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDismiss = useCallback(() => {
    setShowWelcome(false);
    dismissWelcome();
  }, []);

  const handleCamera = useCallback(() => {
    router.push('/(kid)/camera');
  }, []);

  const handleSubject = useCallback((_s: SubjectKey) => {
    router.push('/(kid)/camera');
  }, []);

  const handleSwitchLanguage = useCallback(() => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh-Hans' : 'en');
  }, [i18n]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{t('app.loading' as any)}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {showWelcome ? (
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>{t('kidHome.firstSession.welcomeTitle' as any)}</Text>
          <Text style={styles.welcomeBody}>{t('kidHome.firstSession.welcomeBody' as any)}</Text>
          <Pressable style={styles.cameraCta} onPress={handleCamera} accessibilityRole="button">
            <Text style={styles.cameraCtaIcon}>{'\u{1F4F7}'}</Text>
            <Text style={styles.cameraCtaText}>{t('kidHome.firstSession.ctaCamera' as any)}</Text>
          </Pressable>
          <Pressable onPress={handleDismiss} style={styles.dismissButton} accessibilityRole="button">
            <Text style={styles.dismissText}>{t('kidHome.firstSession.dismiss' as any)}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {kidName
              ? t('kidHome.header.greeting', { name: kidName })
              : (t('onboarding.done.greeting' as any, { name: '' }) as string).replace(/^\s+/, '')}
          </Text>
          <Pressable onPress={handleSwitchLanguage} style={styles.langSwitch} accessibilityRole="button">
            <Text style={styles.langText}>{t('kidHome.header.switchLanguage' as any)}</Text>
          </Pressable>
        </View>
      )}

      {!showWelcome && (
        <Pressable style={styles.cameraTile} onPress={handleCamera} accessibilityRole="button">
          <Text style={styles.cameraIcon}>{'\u{1F4F7}'}</Text>
          <Text style={styles.cameraTitle}>{t('kidHome.camera.title' as any)}</Text>
          <Text style={styles.cameraSubtitle}>{t('kidHome.camera.subtitle' as any)}</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>
        {showWelcome ? t('kidHome.firstSession.ctaPractice' as any) : (t('kidHome.subjects.title' as any) || t('onboarding.done.practicePrompt' as any))}
      </Text>

      <View style={styles.subjectsGrid}>
        {SUBJECTS.map(s => (
          <Pressable key={s} style={styles.subjectTile} onPress={() => handleSubject(s)} accessibilityRole="button">
            <Text style={styles.subjectIcon}>{SUBJECT_ICONS[s]}</Text>
            <Text style={styles.subjectName}>{t(('kidHome.subjects.' + s) as any)}</Text>
            <Text style={styles.subjectDesc}>{t(('kidHome.subjectsDescriptions.' + s) as any)}</Text>
          </Pressable>
        ))}
      </View>

      {!showWelcome && (
        <View style={styles.parentAreaRow}>
          <Pressable onPress={() => router.push('/(parent)')} style={styles.parentButton} accessibilityRole="button">
            <Text style={styles.parentButtonText}>{'\u{1F510}'} {t('onboarding.done.parentArea' as any)}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { fontSize: 16, color: '#6B7280' },

  welcomeBanner: { backgroundColor: '#EFF6FF', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' },
  welcomeTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  welcomeBody: { fontSize: 16, lineHeight: 24, color: '#4B5563', textAlign: 'center', marginBottom: 28 },
  cameraCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16, gap: 10 },
  cameraCtaIcon: { fontSize: 24 },
  cameraCtaText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  dismissButton: { marginTop: 20 },
  dismissText: { fontSize: 15, color: '#6B7280', textDecorationLine: 'underline' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  langSwitch: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#F3F4F6', borderRadius: 20 },
  langText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  cameraTile: { backgroundColor: '#2563EB', marginHorizontal: 24, marginTop: 20, paddingVertical: 28, borderRadius: 20, alignItems: 'center' },
  cameraIcon: { fontSize: 40, marginBottom: 8 },
  cameraTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  cameraSubtitle: { fontSize: 15, color: '#DBEAFE' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', paddingHorizontal: 24, marginTop: 28, marginBottom: 14 },

  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  subjectTile: { width: '47%', backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  subjectIcon: { fontSize: 28, marginBottom: 8 },
  subjectName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4, textAlign: 'center' },
  subjectDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },

  parentAreaRow: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  parentButton: { paddingVertical: 10, paddingHorizontal: 20 },
  parentButtonText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF' },
});
