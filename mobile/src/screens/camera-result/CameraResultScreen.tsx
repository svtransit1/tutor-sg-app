import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { HomeworkFeedbackResult, Subject } from '../../models/homework-feedback';

const SUBJECT_CONFIG: Record<Subject, { labelEn: string; color: string; bgColor: string }> = {
  math: { labelEn: 'Math', color: '#1D4ED8', bgColor: '#DBEAFE' },
  english: { labelEn: 'English', color: '#7C3AED', bgColor: '#EDE9FE' },
  chinese_mt: { labelEn: '中文', color: '#B45309', bgColor: '#FEF3C7' },
  science: { labelEn: 'Science', color: '#059669', bgColor: '#D1FAE5' },
};

function SubjectBadge({ subject }: { subject: Subject }) {
  const c = SUBJECT_CONFIG[subject];
  return <View style={[styles.badge, { backgroundColor: c.bgColor }]}><Text style={[styles.badgeText, { color: c.color }]}>{c.labelEn}</Text></View>;
}

export interface CameraResultScreenProps { feedbackResult?: HomeworkFeedbackResult }

export default function CameraResultScreen({ feedbackResult }: CameraResultScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [result] = useState<HomeworkFeedbackResult>(() => feedbackResult || {
    sessionId: 'mock-1',
    questions: [
      { questionNumber: 1, subject: 'math' as Subject, topic: 'Fractions', questionText: 'John ate 1/3 of a pizza and his sister ate 2/5. How much altogether?' },
      { questionNumber: 2, subject: 'math' as Subject, topic: 'Fractions', questionText: 'A ribbon is 3/4 m long. Mary cut off 1/3 m. How much left?' },
    ],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('cameraResult.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {result.questions.map((q) => (
          <View key={q.questionNumber} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.questionNumberBadge}><Text style={styles.questionNumberText}>{q.questionNumber}</Text></View>
                <View><Text style={styles.questionTitle}>{t('cameraResult.question', { number: q.questionNumber })}</Text>{q.topic ? <Text style={styles.topicLabel}>{q.topic}</Text> : null}</View>
              </View>
              <SubjectBadge subject={q.subject} />
            </View>
            {q.questionText ? (
              <View style={styles.questionTextCard}>
                <Text style={styles.questionTextLabel}>{t('cameraResult.questionLabel')}</Text>
                <Text style={styles.questionText}>{q.questionText}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  headerSpacer: { width: 40 },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  questionNumberBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  questionNumberText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  questionTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  topicLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  questionTextCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  questionTextLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  questionText: { fontSize: 16, lineHeight: 24, color: '#1A1A1A' },
});
