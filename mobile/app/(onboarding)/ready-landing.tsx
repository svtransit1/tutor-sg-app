/**
 * Ready Landing route — Onboarding step 10/10 (final screen).
 * Route: /onboarding/ready-landing
 *
 * Per Article 12 §3.10: First-AHA moment. Kid sees the homework camera
 * CTA front and center. "Complete onboarding" when CTA is tapped.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';

export default function ReadyLandingRoute() {
  const { t, i18n } = useTranslation();
  const { complete, state } = useOnboarding();

  const name = state.name || t('onboarding.done.greetingNameFallback');
  const grade = state.grade ?? 'P1';
  const subjects = state.subjects;

  const handleCameraCTA = useCallback(() => {
    complete();
  }, [complete]);

  const handlePracticeQuestion = useCallback((subject: string) => {
    complete();
  }, [complete]);

  const locale = i18n.language;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            {t('onboarding.done.greeting', { name })}
          </Text>
          <Text style={styles.greetingSub}>
            {locale === 'zh-Hans'
              ? `为你选择了 ${grade} 的课程`
              : `We've set up ${grade} questions for you`}
          </Text>
        </View>

        {/* Primary CTA — Camera */}
        <TouchableOpacity
          style={styles.cameraCTA}
          onPress={handleCameraCTA}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.done.cameraCta')}
          activeOpacity={0.8}
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <View style={styles.cameraCTAText}>
            <Text style={styles.cameraCTATitle}>
              {t('onboarding.done.cameraCta')}
            </Text>
            <Text style={styles.cameraCTASub}>
              {t('onboarding.done.cameraSubtitle')}
            </Text>
          </View>
          <Text style={styles.cameraArrow}>→</Text>
        </TouchableOpacity>

        {/* Subject practice tiles */}
        <View style={styles.subjectsSection}>
          <Text style={styles.subjectsTitle}>
            {t('onboarding.done.practicePrompt')}
          </Text>
          <View style={styles.subjectsRow}>
            {subjects.map((subject) => {
              const labels: Record<string, string> = {
                math: t('kidHome.subjects.math'),
                english: t('kidHome.subjects.english'),
                chinese: locale === 'zh-Hans' ? '华文' : t('kidHome.subjects.chinese'),
                science: t('kidHome.subjects.science'),
              };
              const icons: Record<string, string> = {
                math: '🔢',
                english: '📖',
                chinese: '🀄',
                science: '🔬',
              };
              return (
                <TouchableOpacity
                  key={subject}
                  style={styles.subjectTile}
                  onPress={() => handlePracticeQuestion(subject)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subjectIcon}>{icons[subject] ?? '📚'}</Text>
                  <Text style={styles.subjectLabel}>
                    {labels[subject] ?? subject}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Parent area link */}
        <TouchableOpacity
          style={styles.parentLink}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={styles.parentLinkText}>
            {t('onboarding.done.parentArea')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  greetingSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  greetingSub: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Camera CTA
  cameraCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 24,
    marginBottom: 36,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  cameraCTAText: {
    flex: 1,
  },
  cameraCTATitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cameraCTASub: {
    fontSize: 14,
    color: '#B3D9F2',
  },
  cameraArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Subject tiles
  subjectsSection: {
    marginBottom: 'auto',
  },
  subjectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  subjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectTile: {
    width: '46%',
    aspectRatio: 1.5,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  subjectIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  subjectLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  // Parent area
  parentLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  parentLinkText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
} as TextStyle);
