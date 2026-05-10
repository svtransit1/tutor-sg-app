import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

const SUBJECTS = ['math', 'english', 'science', 'chinese'] as const;

export default function ManualInputScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#121212' : '#F9FAFB';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const inputBorder = isDark ? '#374151' : '#D1D5DB';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [homeworkText, setHomeworkText] = useState('');

  const handleContinue = useCallback(() => {
    const subject = selectedSubject ?? 'math';
    const trimmed = homeworkText.trim();
    if (!trimmed) return;

    const questions = JSON.stringify([
      {
        questionNumber: 1,
        subject,
        questionText: trimmed,
        scaffoldedHelp: {
          hint: t('homeworkFeedback.hint.body'),
          guidedSteps: [],
          workedSolution: '',
        },
      },
    ]);

    router.replace(`/(kid)/photo-review?questions=${encodeURIComponent(questions)}`);
  }, [selectedSubject, homeworkText, t]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(kid)/home');
  }, []);

  const isContinueDisabled = !homeworkText.trim();

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <Text style={[styles.backArrow, { color: isDark ? '#90CAF9' : '#2563EB' }]}>←</Text>
          <Text style={[styles.backLabel, { color: isDark ? '#90CAF9' : '#2563EB' }]}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, { color: textColor }]}>{t('manualInputFallback.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionLabel, { color: isDark ? '#B0B0B0' : '#6B7280' }]}>
          {t('manualInputFallback.subjectPrompt')}
        </Text>

        <View style={styles.subjectRow}>
          {SUBJECTS.map((subject) => {
            const isSelected = selectedSubject === subject;
            return (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: isSelected
                      ? (isDark ? '#2563EB' : '#2563EB')
                      : (isDark ? '#2A2A2A' : '#F3F4F6'),
                    borderColor: isSelected
                      ? (isDark ? '#60A5FA' : '#2563EB')
                      : (isDark ? '#374151' : '#D1D5DB'),
                  },
                ]}
                onPress={() => setSelectedSubject(subject)}
                accessibilityRole="button"
                accessibilityLabel={t(`kidHome.subjects.${subject}`)}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    { color: isSelected ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151') },
                  ]}
                >
                  {t(`kidHome.subjects.${subject}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: isDark ? '#B0B0B0' : '#6B7280' }]}>
          {t('manualInputFallback.description')}
        </Text>

        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
          ]}
          value={homeworkText}
          onChangeText={setHomeworkText}
          placeholder={t('manualInputFallback.typePlaceholder')}
          placeholderTextColor={placeholderColor}
          multiline
          textAlignVertical="top"
          accessibilityLabel={t('manualInputFallback.accessibility.typeInput', { number: 1 })}
        />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: bgColor }]}>
        <TouchableOpacity
          style={[styles.continueBtn, isContinueDisabled && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={isContinueDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('manualInputFallback.accessibility.submit')}
        >
          <Text style={styles.continueBtnText}>{t('manualInputFallback.submit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backArrow: { fontSize: 20, fontWeight: '600' },
  backLabel: { fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '700', textAlign: 'center', flex: 1 },
  spacer: { minWidth: 60 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 100 },
  sectionLabel: { fontSize: 16, fontWeight: '600' },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  subjectChip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1.5 },
  subjectChipText: { fontSize: 16, fontWeight: '600' },
  textInput: { minHeight: 180, borderWidth: 1.5, borderRadius: 12, padding: 16, fontSize: 17, lineHeight: 24 },
  bottomBar: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  continueBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: '#9CA3AF' },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
