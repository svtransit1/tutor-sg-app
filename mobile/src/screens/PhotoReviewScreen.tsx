import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import HomeworkFeedbackCard from '@/components/HomeworkFeedbackCard';
import type { QuestionFeedback, HomeworkFeedbackResult } from '@/models/homework-feedback';
import { useParentSession } from '@/hooks/useParentSession';
import type { ParentSubject } from '@/storage/parentSessions';

type Phase = 'processing' | 'ready' | 'error' | 'empty';

const SUBJECT_MAP: Record<string, ParentSubject> = {
  math: 'math',
  english: 'english',
  chinese_mt: 'chinese',
  science: 'science',
};

function pickSubject(questions: QuestionFeedback[]): ParentSubject {
  for (const q of questions) {
    const mapped = SUBJECT_MAP[q.subject];
    if (mapped) return mapped;
  }
  return 'english';
}

function pickTopic(questions: QuestionFeedback[]): string {
  for (const q of questions) {
    if (q.topic) return q.topic;
  }
  return '';
}

export function parseQuestions(raw: string | string[] | undefined): QuestionFeedback[] | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(Array.isArray(raw) ? raw[0] : raw);
    return Array.isArray(p) ? (p as QuestionFeedback[]) : null;
  } catch {
    return null;
  }
}

function mockQuestions(): QuestionFeedback[] {
  return [
    {
      questionNumber: 1,
      subject: 'math',
      topic: 'Addition',
      questionText: 'John has 15 apples. He buys 7 more. How many apples does he have now?',
      scaffoldedHelp: {
        hint: 'Think about what the problem is asking.',
        guidedSteps: [
          'Step 1: John starts with 15 apples.',
          'Step 2: He buys 7 more, so add.',
          'Step 3: 15 + 7 = ?',
        ],
        workedSolution: '15 + 7 = 22. John has 22 apples.',
      },
    },
    {
      questionNumber: 2,
      subject: 'math',
      topic: 'Subtraction',
      questionText: 'Sarah had 30 stickers. She gave 12 away. How many left?',
      scaffoldedHelp: {
        hint: 'When someone gives away items, subtract.',
        guidedSteps: ['Step 1: Starts with 30.', 'Step 2: Gives 12 away.', 'Step 3: 30 - 12 = ?'],
        workedSolution: '30 - 12 = 18.',
      },
    },
  ];
}

export default function PhotoReviewScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ questions?: string }>();
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#121212' : '#F9FAFB';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const [phase, setPhase] = useState<Phase>('processing');
  const [result, setResult] = useState<HomeworkFeedbackResult | null>(null);

  const { startParentSession, logQuestionAttempt, endParentSession } = useParentSession();
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    const parsed = parseQuestions(params.questions);
    if (parsed !== null && parsed.length === 0) {
      setPhase('empty');
      return;
    }
    const timer = setTimeout(() => {
      if (parsed && parsed.length > 0) {
        setResult({ sessionId: 'session-' + Date.now(), questions: parsed });
        setPhase('ready');
      } else {
        setResult({ sessionId: 'mock-session', questions: mockQuestions() });
        setPhase('ready');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [params.questions]);

  useEffect(() => {
    if (phase !== 'ready' || !result || result.questions.length === 0) return;
    const subject = pickSubject(result.questions);
    const topic = pickTopic(result.questions);
    startParentSession(subject, topic).catch(() => {});
    for (const q of result.questions) {
      logQuestionAttempt(String(q.questionNumber), false, 0, 0, false).catch(() => {});
    }
  }, [phase, result, startParentSession, logQuestionAttempt]);

  useEffect(() => {
    return () => {
      if (sessionEndedRef.current) return;
      sessionEndedRef.current = true;
      endParentSession('', false).catch(() => {});
    };
  }, [endParentSession]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(kid)/home');
  }, []);
  const goHome = useCallback(() => router.replace('/(kid)/home'), []);

  return (
    <View style={[st.root, { backgroundColor: bgColor }]}>
      <View style={st.topBar}>
        <TouchableOpacity
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={st.backBtn}
        >
          <Text style={[st.backArrow, { color: isDark ? '#90CAF9' : '#2563EB' }]}>←</Text>
          <Text style={[st.backLabel, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Text style={[st.heading, { color: textColor }]}>{t('photoReview.title')}</Text>
        <View style={st.spacer} />
      </View>
      {phase === 'processing' && (
        <View style={st.skelList}>
          {[1, 2].map((i) => (
            <HomeworkFeedbackCard key={i} variant="loading" questionNumber={i} />
          ))}
        </View>
      )}
      {phase === 'empty' && (
        <View style={st.center}>
          <Text style={st.bigIcon}>📝</Text>
          <Text style={[st.emptTitle, { color: textColor }]}>{t('photoReview.empty.title')}</Text>
          <Text style={[st.emptBody, { color: isDark ? '#B0B0B0' : '#6B7280' }]}>
            {t('photoReview.empty.body')}
          </Text>
          <TouchableOpacity style={st.hBtn} onPress={goHome} accessibilityRole="button">
            <Text style={st.hBtnTxt}>{t('photoReview.actions.goHome')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {phase === 'ready' && result && (
        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.scrollCont}
          accessibilityRole="list"
          accessibilityLabel={t('photoReview.accessibility.questionList')}
        >
          {result.questions.map((q) => (
            <HomeworkFeedbackCard
              key={q.questionNumber}
              help={q.scaffoldedHelp}
              questionNumber={q.questionNumber}
              questionText={q.questionText}
              title={t('homeworkFeedback.title')}
              style={{ marginBottom: 16 }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backArrow: { fontSize: 20, fontWeight: '600' } as TextStyle,
  backLabel: { fontSize: 15, fontWeight: '600' } as TextStyle,
  heading: { fontSize: 17, fontWeight: '700', textAlign: 'center', flex: 1 } as TextStyle,
  spacer: { minWidth: 60 },
  scroll: { flex: 1 },
  scrollCont: { padding: 16, paddingTop: 4 },
  skelList: { padding: 16, gap: 16 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  bigIcon: { fontSize: 48, marginBottom: 8 } as TextStyle,
  emptTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' } as TextStyle,
  emptBody: { fontSize: 15, lineHeight: 22, textAlign: 'center' } as TextStyle,
  hBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  hBtnTxt: { color: '#6B7280', fontSize: 15, fontWeight: '600' } as TextStyle,
} as Record<string, ViewStyle | TextStyle>);
