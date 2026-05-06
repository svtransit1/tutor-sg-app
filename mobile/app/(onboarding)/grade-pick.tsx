/**
 * Grade Pick + Subject Multi-select — Onboarding step 4/7.
 *
 * Route: /onboarding/grade-pick
 *
 * Layout (top to bottom):
 * 1. OnboardingProgressIndicator (step 4/7)
 * 2. Title: "What grade is your child in?"
 * 3. Horizontal segmented control: P1 / P2 / P3 / P4 / P5 / P6 (required)
 * 4. Subtitle: "Which subjects?"
 * 5. 4 toggle chips: Math · English · Chinese · Science (all ON by default)
 * 6. Inline hint about subject selection
 * 7. "Continue" CTA button (disabled until grade picked)
 *
 * Behaviour:
 * - Grade selection is required (single pick from P1–P6)
 * - Subject selection is multi-select, all ON by default
 * - "Continue" is disabled until a grade is selected
 * - On continue, persist to child profile and navigate to parent-sign-in (step 5/7)
 *
 * Bilingual: all strings via i18n (EN + zh-Hans).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 * Kid-safe: no analytics, no data-leaving-device paths.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingProgressIndicator from '@/components/OnboardingProgressIndicator';

// ── Constants ──────────────────────────────────────────────────────

type Grade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
type SubjectId = 'math' | 'english' | 'chinese' | 'science';

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

interface SubjectConfig {
  id: SubjectId;
  icon: string;
  i18nKey: string;
}

const SUBJECTS: SubjectConfig[] = [
  { id: 'math', icon: '🔢', i18nKey: 'onboarding.gradePick.subjectMath' },
  { id: 'english', icon: '📖', i18nKey: 'onboarding.gradePick.subjectEnglish' },
  { id: 'chinese', icon: '🀄', i18nKey: 'onboarding.gradePick.subjectChinese' },
  { id: 'science', icon: '🔬', i18nKey: 'onboarding.gradePick.subjectScience' },
];

// ── Screen ─────────────────────────────────────────────────────────

export default function GradePickScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<SubjectId>>(
    new Set(['math', 'english', 'chinese', 'science']),
  );

  const isContinueDisabled = selectedGrade === null;

  // ── Toggle grade ────────────────────────────────────────────

  const handleGradePress = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
  }, []);

  // ── Toggle subject ──────────────────────────────────────────

  const handleSubjectToggle = useCallback((subjectId: SubjectId) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }, []);

  // ── Continue ────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    if (!selectedGrade) return;

    // TODO: Persist to child_profile_0 via MMKV/state store
    //   { grade: selectedGrade, subjects: Array.from(selectedSubjects) }

    // Navigate to parent sign-in (step 5/7)
    router.replace('/(onboarding)/parent-sign-in');
  }, [selectedGrade, selectedSubjects, router]);

  // ── Dynamic theme colours ───────────────────────────────────

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const secondaryTextColor = isDark ? '#B0B0B0' : '#666666';
  const mutedTextColor = isDark ? '#888888' : '#9CA3AF';
  const borderColor = isDark ? '#333333' : '#E5E7EB';
  const gradeBg = isDark ? '#1E1E1E' : '#F3F4F6';
  const gradeSelectedBg = isDark ? '#2563EB' : '#4A90D9';
  const gradeSelectedText = '#FFFFFF';
  const subjectChipBg = isDark ? '#1E1E1E' : '#F3F4F6';
  const subjectChipSelectedBg = isDark ? '#1B3D1B' : '#E8F5E9';
  const subjectChipBorder = isDark ? '#333333' : '#D1D5DB';
  const subjectChipSelectedBorder = isDark ? '#4CAF50' : '#4CAF50';
  const buttonBg = isDark ? '#4A90D9' : '#2563EB';
  const buttonDisabledBg = isDark ? '#333333' : '#D1D5DB';
  const buttonDisabledText = isDark ? '#666666' : '#9CA3AF';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <OnboardingProgressIndicator currentStep={4} totalSteps={7} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Grade section ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: textColor }]}
            accessibilityRole="header"
          >
            {t('onboarding.gradePick.title')}
          </Text>

          <View style={styles.gradeRow}>
            {GRADES.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeChip,
                    {
                      backgroundColor: isSelected ? gradeSelectedBg : gradeBg,
                      borderColor: isSelected ? gradeSelectedBg : borderColor,
                    },
                  ]}
                  onPress={() => handleGradePress(grade)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={
                    isSelected
                      ? t('onboarding.gradePick.accessibility.gradeSelected', { grade })
                      : t('onboarding.gradePick.accessibility.gradeOption', { grade })
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.gradeText,
                      {
                        color: isSelected ? gradeSelectedText : (isDark ? '#E0E0E0' : '#374151'),
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {t(`onboarding.gradePick.grade${grade}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Subject section ────────────────────────────────── */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: textColor }]}
            accessibilityRole="header"
          >
            {t('onboarding.gradePick.subjectTitle')}
          </Text>

          <View style={styles.subjectGrid}>
            {SUBJECTS.map((subject) => {
              const isSelected = selectedSubjects.has(subject.id);
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectChip,
                    {
                      backgroundColor: isSelected ? subjectChipSelectedBg : subjectChipBg,
                      borderColor: isSelected ? subjectChipSelectedBorder : subjectChipBorder,
                    },
                  ]}
                  onPress={() => handleSubjectToggle(subject.id)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={t(
                    'onboarding.gradePick.accessibility.subjectToggle',
                    {
                      subject: t(subject.i18nKey),
                      state: isSelected
                        ? t('onboarding.gradePick.accessibility.subjectOn')
                        : t('onboarding.gradePick.accessibility.subjectOff'),
                    },
                  )}
                  activeOpacity={0.7}
                >
                  <Text style={styles.subjectIcon}>{subject.icon}</Text>
                  <Text
                    style={[
                      styles.subjectText,
                      {
                        color: isSelected ? (isDark ? '#E0E0E0' : '#1A1A1A') : secondaryTextColor,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                  >
                    {t(subject.i18nKey)}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Subject hint */}
          <Text
            style={[styles.subjectHint, { color: mutedTextColor }]}
            accessibilityRole="text"
          >
            {t('onboarding.gradePick.subjectHint')}
          </Text>
        </View>
      </ScrollView>

      {/* ── Continue button — fixed at bottom ─────────────────── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: isContinueDisabled ? buttonDisabledBg : buttonBg },
          ]}
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.gradePick.continue')}
          accessibilityState={{ disabled: isContinueDisabled }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              {
                color: isContinueDisabled ? buttonDisabledText : '#FFFFFF',
              },
            ]}
          >
            {t('onboarding.gradePick.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // ── Section ───────────────────────────────────────────────────
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
    ...Platform.select({
      ios: {},
      android: { letterSpacing: 0 },
    }),
  } as TextStyle,

  // ── Grade chips (horizontal row) ──────────────────────────────
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  gradeChip: {
    minWidth: 64,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  // ── Subject grid (2×2) ───────────────────────────────────────
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  subjectChip: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  subjectIcon: {
    fontSize: 22,
  },
  subjectText: {
    fontSize: 15,
    flex: 1,
  } as TextStyle,
  checkMark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },

  // ── Hint text ────────────────────────────────────────────────
  subjectHint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
  } as TextStyle,

  // ── Footer / Continue button ─────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  continueButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  } as TextStyle,
});
