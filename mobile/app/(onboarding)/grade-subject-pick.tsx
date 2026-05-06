/**
 * Grade + Subject Pick route — Onboarding step 5/10.
 * Route: /onboarding/grade-subject-pick
 *
 * Per Article 12 §3.5: Single screen with grade segmented control
 * and subject toggle chips. Persists grade and subjects to state machine.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';
import { persistGrade } from '../../src/storage/onboarding-state';

type Grade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
type SubjectId = 'math' | 'english' | 'chinese' | 'science';

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const ALL_SUBJECTS: SubjectId[] = ['math', 'english', 'chinese', 'science'];

export default function GradeSubjectPickRoute() {
  const { t, i18n } = useTranslation();
  const { goNext, updateState } = useOnboarding();

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(ALL_SUBJECTS);

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
  }, []);

  const handleSubjectToggle = useCallback((subject: SubjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        // Don't allow all subjects to be deselected
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== subject);
      }
      return [...prev, subject];
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedGrade) return;

    // Persist through standard API
    persistGrade(selectedGrade);

    // Update state machine
    updateState({
      grade: selectedGrade,
      subjects: selectedSubjects,
    });

    goNext();
  }, [selectedGrade, selectedSubjects, goNext, updateState]);

  const isZh = i18n.language === 'zh-Hans';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Grade pick */}
      <Text style={styles.sectionTitle}>
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
                isSelected && styles.gradeChipSelected,
              ]}
              onPress={() => handleGradeSelect(grade)}
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
                  styles.gradeChipText,
                  isSelected && styles.gradeChipTextSelected,
                ]}
              >
                {t(`onboarding.gradePick.grade${grade}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subject pick */}
      <Text style={styles.sectionTitle}>
        {t('onboarding.gradePick.subjectTitle')}
      </Text>
      <Text style={styles.sectionHint}>
        {t('onboarding.gradePick.subjectHint')}
      </Text>
      <View style={styles.subjectRow}>
        {ALL_SUBJECTS.map((subject) => {
          const isSelected = selectedSubjects.includes(subject);
          const labelKey = `onboarding.gradePick.subject${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
          return (
            <TouchableOpacity
              key={subject}
              style={[
                styles.subjectChip,
                isSelected && styles.subjectChipSelected,
                subject === 'chinese' && styles.subjectChipChinese,
                subject === 'chinese' && isSelected && styles.subjectChipChineseSelected,
              ]}
              onPress={() => handleSubjectToggle(subject)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={
                t('onboarding.gradePick.accessibility.subjectToggle', {
                  subject: t(labelKey),
                  state: isSelected
                    ? t('onboarding.gradePick.accessibility.subjectOn')
                    : t('onboarding.gradePick.accessibility.subjectOff'),
                })
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  isSelected && styles.subjectChipTextSelected,
                ]}
              >
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue button */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          !selectedGrade && styles.continueBtnDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selectedGrade}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.gradePick.continue')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.continueBtnText,
            !selectedGrade && styles.continueBtnTextDisabled,
          ]}
        >
          {t('onboarding.gradePick.continue')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  sectionHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Grade chips
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 40,
    justifyContent: 'center',
  },
  gradeChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gradeChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  gradeChipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  gradeChipTextSelected: {
    color: '#2563EB',
  },

  // Subject chips
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 48,
  },
  subjectChip: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  subjectChipSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  subjectChipChinese: {
    minWidth: 100,
  },
  subjectChipChineseSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  subjectChipText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  subjectChipTextSelected: {
    color: '#16A34A',
  },

  // Continue
  continueBtn: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueBtnTextDisabled: {
    color: '#9CA3AF',
  },
} as TextStyle);
