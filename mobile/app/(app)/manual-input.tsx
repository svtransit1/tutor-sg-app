import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import type { OcrResult, HomeworkSession } from '../../src/types/homework';
import { saveSession } from '../../src/db/sessions';
import { v4 as uuidv4 } from 'uuid';

export default function ManualInputScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const subject = (params.subject as string) ?? 'math';
  const level = (params.level as string) ?? 'P3';
  const isZh = i18n.language === 'zh-Hans';

  const ocrResult: OcrResult = params.ocrJson ? JSON.parse(params.ocrJson as string) : { blocks: [], lowConfidenceBlocks: [], imageUri: '', pageCount: 0, timestamp: 0 };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [correctedBlocks, setCorrectedBlocks] = useState(ocrResult.lowConfidenceBlocks);

  const currentItem = correctedBlocks[currentIndex];

  const handleSave = useCallback(() => {
    const updatedBlock = { ...currentItem, text: inputText, confidence: 0.9 };
    const newCorrected = [...correctedBlocks];
    newCorrected[currentIndex] = updatedBlock;
    setCorrectedBlocks(newCorrected);

    if (currentIndex < correctedBlocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText('');
    }
  }, [currentItem, currentIndex, correctedBlocks, inputText]);

  const handleContinue = useCallback(() => {
    const mergedOcr: OcrResult = {
      ...ocrResult,
      lowConfidenceBlocks: correctedBlocks.filter((b) => b.confidence < 0.6),
      blocks: [...ocrResult.blocks, ...correctedBlocks.map((b) => ({ ...b, confidence: Math.max(b.confidence, 0.7) }))],
    };

    const sessionId = uuidv4();
    const session: HomeworkSession = {
      id: sessionId,
      ocrResult: mergedOcr,
      subject,
      level,
      feedbackBlocks: [],
      rawLlmResponse: '',
      startedAt: Date.now(),
      completedAt: null,
      status: 'processing',
    };
    saveSession(session);

    router.replace({
      pathname: '/(app)/feedback',
      params: {
        subject,
        level,
        ocrJson: JSON.stringify(mergedOcr),
      },
    });
  }, [ocrResult, correctedBlocks, subject, level, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{isZh ? '返回' : 'Back'}</Text>
        </Pressable>
        <Text style={styles.counter}>
          {currentIndex + 1} / {correctedBlocks.length}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {isZh
            ? t('manualInput.titleZh', { number: currentIndex + 1 })
            : t('manualInput.title', { number: currentIndex + 1 })}
        </Text>
        <Text style={styles.instructions}>
          {isZh ? t('manualInput.instructionsZh') : t('manualInput.instructions')}
        </Text>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isZh ? t('manualInput.placeholderZh') : t('manualInput.placeholder')}
          placeholderTextColor="#999"
          multiline
          autoFocus
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {correctedBlocks.length > 1 && currentIndex < correctedBlocks.length - 1
                ? isZh ? t('onboarding.common.save') : 'Save'
                : isZh ? t('onboarding.common.done') : 'Done'}
            </Text>
          </Pressable>
        </View>

        {currentIndex >= correctedBlocks.length - 1 && inputText.length > 0 && (
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>
              {isZh ? t('manualInput.continueZh') : t('manualInput.continue')}
            </Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '500',
  },
  counter: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  buttonRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#66BB6A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
