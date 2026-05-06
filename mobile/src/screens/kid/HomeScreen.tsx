/**
 * HomeScreen — Kid home screen with subject tiles and camera quick-entry.
 *
 * Per ADD §4.2: main kid landing page after onboarding.
 * Bilingual EN + zh-Hans. Kid-safe: no analytics SDKs.
 * VoiceOver/TalkBack accessible.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
  onCameraPress?: () => void;
  onSubjectPress?: (subject: string) => void;
}

const SUBJECTS = ['math', 'english', 'science', 'chinese'] as const;

const SUBJECT_ICONS: Record<string, string> = {
  math: '🔢',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

export default function HomeScreen({ onCameraPress, onSubjectPress }: HomeScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            {t('kidHome.header.greeting', { name: '' })}
          </Text>
        </View>

        {/* Subject tiles */}
        <View style={styles.subjectsGrid}>
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={styles.subjectTile}
              onPress={() => onSubjectPress?.(subject)}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.accessibility.subjectTile', {
                subject: t(`kidHome.subjects.${subject}`),
              })}
            >
              <Text style={styles.subjectIcon}>
                {SUBJECT_ICONS[subject] || '📚'}
              </Text>
              <Text style={styles.subjectName}>
                {t(`kidHome.subjects.${subject}`)}
              </Text>
              <Text style={styles.subjectDesc} numberOfLines={2}>
                {t(`kidHome.subjectsDescriptions.${subject}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Camera quick-entry */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.camera.accessibility')}
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <View style={styles.cameraTextWrap}>
            <Text style={styles.cameraTitle}>{t('kidHome.camera.title')}</Text>
            <Text style={styles.cameraSubtitle}>{t('kidHome.camera.subtitle')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  subjectTile: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subjectDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  cameraIcon: {
    fontSize: 32,
  },
  cameraTextWrap: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
  },
});
