import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { MockLlmService } from '../../src/services/llm';
import { saveSession } from '../../src/db/sessions';
import type { FeedbackBlock, HomeworkSession, OcrResult } from '../../src/types/homework';
import { v4 as uuidv4 } from 'uuid';

const llmService = new MockLlmService();

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';

  const [isLoading, setIsLoading] = useState(true);
  const [blocks, setBlocks] = useState<FeedbackBlock[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionId = uuidv4();
  const sessionRef = useCallback(
    (updatedBlocks: FeedbackBlock[], rawResponse: string, status: HomeworkSession['status']) => {
      const ocrJson = params.ocrJson ? JSON.parse(params.ocrJson as string) : null;
      const session: HomeworkSession = {
        id: sessionId,
        ocrResult: ocrJson as OcrResult | null,
        subject,
        level,
        feedbackBlocks: updatedBlocks,
        rawLlmResponse: rawResponse,
        startedAt: Date.now() - 5000,
        completedAt: Date.now(),
        status,
      };
      saveSession(session);
    },
    [sessionId, subject, level, params.ocrJson],
  );

  useEffect(() => {
    const runFeedback = async () => {
      const ocrJson = params.ocrJson ? JSON.parse(params.ocrJson as string) : null;
      const ocrText = ocrJson?.blocks?.map((b: { text: string }) => b.text).join('\n') ?? '';

      try {
        const { blocks: resultBlocks, rawResponse } = await llmService.generateFeedback(
          subject as any,
          ocrText,
          (token: string) => {
            setStreamingText((prev) => prev + token);
          },
        );

        setBlocks(resultBlocks);
        setStreamingText('');
        sessionRef(resultBlocks, rawResponse, 'feedback');
      } catch {
        setError(t('onboarding.feedback.errorDetail'));
        sessionRef([], '', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    runFeedback();
  }, [params.ocrJson, subject, sessionRef]);

  const labelForType = (type: string) => {
    const key = `onboarding.feedback.${type}`;
    const translated = t(key);
    return translated === key ? type : translated;
  };

  const handleNewHomework = () => {
    router.replace({
      pathname: '/(app)/camera',
      params: { subject, level },
    });
  };

  const handleHome = () => {
    router.replace('/(app)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>
          {t('onboarding.feedback.loading')}
        </Text>
        {streamingText.length > 0 && (
          <View style={styles.streamingBox}>
            <Text style={styles.streamingText}>{streamingText}</Text>
          </View>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleNewHomework}>
            <Text style={styles.retryButtonText}>
              {t('onboarding.camera.retake')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('onboarding.feedback.title')}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {blocks.map((block, index) => (
          <View
            key={block.id}
            style={[
              styles.feedbackCard,
              block.type === 'hint' && styles.hintCard,
              block.type === 'step' && styles.stepCard,
              block.type === 'solution' && styles.solutionCard,
              block.type === 'error' && styles.errorCard,
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTypeBadge}>
                {labelForType(block.type)}
              </Text>
              <Text style={styles.feedbackNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.feedbackTitle}>{block.title}</Text>
            <Text style={styles.feedbackContent}>{block.content}</Text>
          </View>
        ))}

        <Pressable style={styles.hintButton}>
          <Text style={styles.hintButtonText}>
            {t('onboarding.feedback.askHint')}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={handleHome}>
          <Text style={styles.secondaryButtonText}>
            {t('onboarding.feedback.newHomework')}
          </Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={handleNewHomework}>
          <Text style={styles.primaryButtonText}>
            {t('onboarding.feedback.sessionSaved')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  hintCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
  },
  stepCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90D9',
  },
  solutionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF5350',
    backgroundColor: '#FFEBEE',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackTypeBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90D9',
    textTransform: 'uppercase',
  },
  feedbackNumber: {
    fontSize: 12,
    color: '#999',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  feedbackContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  hintButton: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  primaryButton: {
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  streamingBox: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxWidth: '90%',
  },
  streamingText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF5350',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
