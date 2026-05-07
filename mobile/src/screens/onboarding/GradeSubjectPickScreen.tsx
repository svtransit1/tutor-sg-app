import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Grade, SubjectId } from '../../storage/onboarding-state';

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const SUBJECTS: { id: SubjectId; icon: string; i18nKey: string }[] = [
  { id: 'math', icon: '\u{1F9EE}', i18nKey: 'onboarding.gradePick.subjectMath' },
  { id: 'english', icon: '\u{1F4D6}', i18nKey: 'onboarding.gradePick.subjectEnglish' },
  { id: 'science', icon: '\u{1F52C}', i18nKey: 'onboarding.gradePick.subjectScience' },
  { id: 'chinese', icon: '\u{1F004}', i18nKey: 'onboarding.gradePick.subjectChinese' },
];

const ALL_SUBJECT_IDS: SubjectId[] = SUBJECTS.map((s) => s.id);

interface GradeSubjectPickScreenProps {
  onComplete?: (grade: Grade, subjects: SubjectId[]) => void;
}

export default function GradeSubjectPickScreen({ onComplete }: GradeSubjectPickScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<SubjectId>>(
    new Set(ALL_SUBJECT_IDS),
  );

  const allSubjectsSelected = useMemo(
    () => ALL_SUBJECT_IDS.every((s) => selectedSubjects.has(s)),
    [selectedSubjects],
  );

  const canContinue = selectedGrade !== null && selectedSubjects.size > 0;

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
  }, []);

  const handleSubjectToggle = useCallback((subjectId: SubjectId) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  }, []);

  const handleAllSubjectsToggle = useCallback(() => {
    setSelectedSubjects((prev) => {
      if (ALL_SUBJECT_IDS.every((s) => prev.has(s))) return new Set();
      return new Set(ALL_SUBJECT_IDS);
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedGrade || selectedSubjects.size === 0) return;
    onComplete?.(selectedGrade, Array.from(selectedSubjects));
  }, [selectedGrade, selectedSubjects, onComplete]);

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const cardBg = isDark ? '#1E1E1E' : '#F3F4F6';
  const borderColor = isDark ? '#333333' : '#E5E7EB';
  const selectedBg = isDark ? '#1A365D' : '#EFF6FF';
  const selectedBorder = isDark ? '#63B3ED' : '#2563EB';
  const continueBg = canContinue ? '#2563EB' : '#D1D5DB';
  const continueTextColor = canContinue ? '#FFFFFF' : '#9CA3AF';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: textColor }]} accessibilityRole="header">
        {t('onboarding.gradePick.title')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gradeRow}
        accessibilityLabel={t('onboarding.gradePick.accessibility.gradePickerLabel')}
      >
        {GRADES.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <Pressable
              key={grade}
              style={[
                styles.gradeChip,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? selectedBorder : borderColor,
                },
              ]}
              onPress={() => handleGradeSelect(grade)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={
                isSelected
                  ? t('onboarding.gradePick.accessibility.gradeSelected', { grade })
                  : t('onboarding.gradePick.accessibility.gradeOption', { grade })
              }
            >
              <Text
                style={[
                  styles.gradeChipText,
                  {
                    color: isSelected ? '#2563EB' : textColor,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {t(`onboarding.gradePick.grade${grade}`)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text
        style={[styles.sectionTitle, { color: textColor, marginTop: 36 }]}
        accessibilityRole="header"
      >
        {t('onboarding.gradePick.subjectTitle')}
      </Text>

      <Pressable
        style={[styles.allSubjectsRow, { borderBottomColor: borderColor }]}
        onPress={handleAllSubjectsToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: allSubjectsSelected }}
        accessibilityLabel={t('onboarding.gradePick.allSubjects')}
      >
        <Text style={[styles.allSubjectsLabel, { color: textColor }]}>
          {t('onboarding.gradePick.allSubjects')}
        </Text>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: allSubjectsSelected ? '#2563EB' : 'transparent',
              borderColor: allSubjectsSelected ? '#2563EB' : borderColor,
            },
          ]}
        >
          {allSubjectsSelected && <Text style={styles.checkmark}>{'\u2713'}</Text>}
        </View>
      </Pressable>

      <View style={styles.subjectGrid}>
        {SUBJECTS.map((subject) => {
          const isSelected = selectedSubjects.has(subject.id);
          return (
            <Pressable
              key={subject.id}
              style={[
                styles.subjectChip,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? selectedBorder : borderColor,
                },
              ]}
              onPress={() => handleSubjectToggle(subject.id)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={t('onboarding.gradePick.accessibility.subjectToggle', {
                subject: t(subject.i18nKey),
                state: isSelected
                  ? t('onboarding.gradePick.accessibility.subjectOn')
                  : t('onboarding.gradePick.accessibility.subjectOff'),
              })}
            >
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <Text
                style={[
                  styles.subjectChipText,
                  {
                    color: isSelected ? '#2563EB' : textColor,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {t(subject.i18nKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: mutedColor }]}>
        {t('onboarding.gradePick.subjectHint')}
      </Text>

      <Pressable
        style={[styles.continueButton, { backgroundColor: continueBg }]}
        onPress={handleContinue}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityLabel={t('onboarding.gradePick.continue')}
      >
        <Text style={[styles.continueText, { color: continueTextColor }]}>
          {t('onboarding.gradePick.continue')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48 },
  sectionTitle: { fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 16 },
  gradeRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  gradeChip: {
    width: 76,
    height: 76,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeChipText: { fontSize: 18, fontWeight: '600' },
  allSubjectsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  allSubjectsLabel: { fontSize: 16, fontWeight: '600' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  subjectIcon: { fontSize: 20 },
  subjectChipText: { fontSize: 15, fontWeight: '500' },
  hint: { fontSize: 13, lineHeight: 18, marginTop: 16, marginBottom: 8 },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  continueText: { fontSize: 17, fontWeight: '700' },
});
