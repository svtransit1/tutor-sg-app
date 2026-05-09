import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useColorScheme, type ViewStyle, type TextStyle } from 'react-native';
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import HomeworkFeedbackCard from '@/components/HomeworkFeedbackCard';
import { ParentSessionRepository } from '@/storage/parentSessions';
import type { QuestionFeedback } from '@/models/homework-feedback';
import { useSessionResume } from '@/hooks/useSessionResume';

const MOCK_QUESTIONS: QuestionFeedback[] = [
  {
    questionNumber: 1,
    subject: 'math',
    topic: 'Addition',
    questionText: 'John has 15 apples. He buys 27 more. How many apples does he have now?',
    scaffoldedHelp: {
      hint: 'Try adding the two numbers together. What is 15 + 27? Break it into tens and ones if that helps.',
      guidedSteps: [
        'Identify the operation. The problem asks "how many apples does he have now?" which means we need to add.',
        'Add the ones: 5 + 7 = 12. Write down 2 and carry the 1.',
        'Add the tens: 1 + 2 + 1 (carried) = 4.',
        'Combine: 4 tens and 2 ones = 42 apples.',
      ],
      workedSolution: 'John starts with 15 apples and buys 27 more. 15 + 27 = 42. John has 42 apples in total.',
    },
  },
  {
    questionNumber: 2,
    subject: 'math',
    topic: 'Subtraction',
    questionText: 'Sarah has 64 stickers. She gives away 28 to her friend. How many stickers does Sarah have left?',
    scaffoldedHelp: {
      hint: 'This is a subtraction problem. You start with 64 and take away 28. Think about regrouping.',
      guidedSteps: [
        'Identify the operation. "Gives away" means we subtract.',
        'Set up: 64 - 28.',
        'Subtract the ones: 4 - 8. We need to regroup. Borrow 1 ten: 14 - 8 = 6.',
        'Subtract the tens: 5 - 2 = 3.',
        'Combine: 3 tens and 6 ones = 36 stickers.',
      ],
      workedSolution: 'Sarah has 64 stickers and gives away 28. 64 - 28 = 36. Sarah has 36 stickers left.',
    },
  },
];

const DARK_HEADER_BG = '#1C1C1E';
const LIGHT_HEADER_BG = '#FFFFFF';
const DARK_BG = '#000000';
const LIGHT_BG = '#F2F2F7';

export default function HomeworkFeedbackScreen() {
  const { t } = useTranslation();
  const { sessionId, resumed } = useLocalSearchParams<{ sessionId: string; resumed?: string }>();
  const navigation = useNavigation();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? DARK_BG : LIGHT_BG;
  const headerBg = isDark ? DARK_HEADER_BG : LIGHT_HEADER_BG;
  const textColor = isDark ? '#F5F5F7' : '#1C1C1E';
  const endedRef = useRef(false);

  const { saveSnapshot, clearSnapshot } = useSessionResume();

  const questions = MOCK_QUESTIONS;

  useEffect(() => {
    if (!sessionId || resumed) return;
    MOCK_QUESTIONS.forEach((q, i) => {
      ParentSessionRepository.logQuestionAttempt(sessionId, `mock-q-${i + 1}`, true, 0, 30, false).catch(() => {});
    });
  }, [sessionId, resumed]);

  useEffect(() => {
    if (!sessionId) return;
    saveSnapshot(sessionId, 'homework_feedback');
  }, [sessionId, saveSnapshot]);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = navigation.addListener('beforeRemove', () => {
      if (endedRef.current) return;
      endedRef.current = true;
      clearSnapshot(sessionId).catch(() => {});
      ParentSessionRepository.endSession(sessionId, `mock preview: ${MOCK_QUESTIONS.length} questions`, false).catch(() => {});
    });
    return unsub;
  }, [sessionId, navigation, clearSnapshot]);

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('homeworkFeedback.title'),
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: textColor,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('common.goBack')}
              hitSlop={8}
            >
              <Text style={[styles.backBtn, { color: textColor }]}>
                {'\u2190'} {t('common.back')}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {questions.map((q) => (
          <HomeworkFeedbackCard
            key={q.questionNumber}
            help={q.scaffoldedHelp}
            questionNumber={q.questionNumber}
            questionText={q.questionText}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 } satisfies ViewStyle,
  backBtn: { fontSize: 16, fontWeight: '500', paddingHorizontal: 4 } satisfies TextStyle,
  scrollView: { flex: 1 } satisfies ViewStyle,
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 } satisfies ViewStyle,
});
