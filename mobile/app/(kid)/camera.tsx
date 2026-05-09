import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ParentSessionRepository } from '@/storage/parentSessions';
import { useSessionResume } from '@/hooks/useSessionResume';

const MOCK_KID_ID = 'mock-kid-1';

export default function CameraScreen() {
  const { t } = useTranslation();
  const { saveSnapshot, clearSnapshot } = useSessionResume();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    (async () => {
      const id = await ParentSessionRepository.startSession(MOCK_KID_ID, 'math', 'mock-preview');
      setSessionId(id);
      await saveSnapshot(id, 'camera');
      setStarting(false);
    })();
  }, [saveSnapshot]);

  const handleEndSession = useCallback(async () => {
    if (sessionId) {
      await clearSnapshot(sessionId);
      await ParentSessionRepository.endSession(sessionId, '', false);
    }
    router.back();
  }, [sessionId, clearSnapshot]);

  if (starting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A7CF7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.placeholder}>
        <Text style={styles.icon}>{'\uD83D\uDCF7'}</Text>
        <Text style={styles.title}>{t('kidHome.camera.title')}</Text>
        <Text style={styles.subtitle}>{t('kidHome.camera.subtitle')}</Text>

        <Pressable
          style={({ pressed }) => [styles.mockBtn, pressed && styles.mockBtnPressed]}
          onPress={() => {
            if (sessionId) {
              router.replace({ pathname: '/(kid)/homework-feedback', params: { sessionId } });
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="View homework feedback demo"
        >
          <Text style={styles.mockBtnText}>
            {'\uD83D\uDCDD'} {t('homeworkFeedback.title')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={handleEndSession}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Text style={styles.backBtnText}>{'\u2190'} {t('common.back')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#98989D', textAlign: 'center' },
  mockBtn: {
    marginTop: 24, paddingVertical: 14, paddingHorizontal: 32,
    backgroundColor: '#4A7CF7', borderRadius: 14,
  },
  mockBtnPressed: { backgroundColor: '#3A6AE0' },
  mockBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backBtn: {
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 24,
    backgroundColor: '#333333', borderRadius: 12,
  },
  backBtnPressed: { backgroundColor: '#444444' },
  backBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
