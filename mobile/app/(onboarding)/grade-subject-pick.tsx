import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../../src/onboarding';
import { persistGrade, persistKidName } from '../../src/storage/onboarding-state';

type Grade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
type SubjectId = 'math' | 'english' | 'chinese' | 'science';

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const ALL_SUBJECTS: SubjectId[] = ['math', 'english', 'chinese', 'science'];
const MAX_NAME_LENGTH = 30;

export default function GradeSubjectPickRoute() {
  const { t } = useTranslation();
  const { goNext, updateState } = useOnboarding();

  const [kidName, setKidName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>(ALL_SUBJECTS);

  const handleNameChange = useCallback((text: string) => {
    setKidName(text);
    if (nameError && text.trim().length > 0 && text.trim().length <= MAX_NAME_LENGTH) {
      setNameError('');
    }
  }, [nameError]);

  const handleNameBlur = useCallback(() => {
    const trimmed = kidName.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      setNameError(t('onboarding.kidProfile.nameError'));
    } else {
      setNameError('');
    }
  }, [kidName, t]);

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
  }, []);

  const handleSubjectToggle = useCallback((subject: SubjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== subject);
      }
      return [...prev, subject];
    });
  }, []);

  const handleContinue = useCallback(() => {
    const trimmed = kidName.trim();
    if (!selectedGrade) return;
    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      setNameError(t('onboarding.kidProfile.nameError'));
      return;
    }

    persistGrade(selectedGrade);
    persistKidName(trimmed);

    updateState({
      name: trimmed,
      grade: selectedGrade,
      subjects: selectedSubjects,
    });

    goNext();
  }, [selectedGrade, selectedSubjects, kidName, goNext, updateState, t]);

  const canContinue = selectedGrade !== null && kidName.trim().length > 0 && kidName.trim().length <= MAX_NAME_LENGTH;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>
        {t('onboarding.kidProfile.title')}
      </Text>
      <Text style={styles.sectionHint}>
        {t('onboarding.kidProfile.subtitle')}
      </Text>

      <Text style={styles.inputLabel}>
        {t('onboarding.kidProfile.nameLabel')}
      </Text>
      <TextInput
        style={[styles.textInput, nameError ? styles.textInputError : null]}
        value={kidName}
        onChangeText={handleNameChange}
        onBlur={handleNameBlur}
        placeholder={t('onboarding.kidProfile.namePlaceholder')}
        placeholderTextColor="#9CA3AF"
        maxLength={MAX_NAME_LENGTH}
        autoComplete="name"
        autoCorrect={false}
        accessibilityLabel={t('onboarding.kidProfile.nameLabel')}
        accessibilityState={{ invalid: nameError.length > 0 }}
      />
      {nameError ? (
        <Text style={styles.errorText}>{nameError}</Text>
      ) : null}

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

      <TouchableOpacity
        style={[
          styles.continueBtn,
          !canContinue && styles.continueBtnDisabled,
        ]}
        onPress={handleContinue}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.gradePick.continue')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.continueBtnText,
            !canContinue && styles.continueBtnTextDisabled,
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
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    height: 52,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    marginBottom: 4,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 32,
    marginTop: 4,
  },

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
});
