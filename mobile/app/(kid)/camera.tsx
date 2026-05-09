import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFpsMonitor } from '@/hooks/useFpsMonitor';
import { CameraFpsOverlay } from '@/components/CameraFpsOverlay';

export default function CameraScreen() {
  const { t } = useTranslation();
  const [starting, setStarting] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const fpsMetrics = useFpsMonitor({ isCapturing: capturing });

  useEffect(() => { const t = setTimeout(() => setStarting(false), 500); return () => clearTimeout(t); }, []);

  const handleCapture = useCallback(() => {
    setCapturing(true);
    setTimeout(() => { setCapturing(false); router.replace({ pathname: '/(kid)/homework-feedback', params: { sessionId: 'mock-session-1' } }); }, 2000);
  }, []);

  if (starting) return <View style={styles.centered}><ActivityIndicator size="large" color="#4A7CF7" /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.placeholder}>
        <Text style={styles.icon}>{'\uD83D\uDCF7'}</Text>
        <Text style={styles.title}>{t('kidHome.camera.title')}</Text>
        <Text style={styles.subtitle}>{t('kidHome.camera.subtitle')}</Text>
        <Pressable style={({ pressed }) => [styles.captureBtn, pressed && styles.captureBtnPressed]} onPress={handleCapture} accessibilityRole="button" accessibilityLabel={t('kidHome.camera.accessibility')}>
          <Text style={styles.captureBtnText}>{'\uD83D\uDCF8'} {t('kidHome.camera.title')}</Text>
        </Pressable>
        {capturing && <View style={styles.capturingBanner}><ActivityIndicator size="small" color="#4A7CF7" /><Text style={styles.capturingText}>{t('homeworkFeedback.title')}</Text></View>}
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('common.goBack')}>
          <Text style={styles.backBtnText}>{'\u2190'} {t('common.back')}</Text>
        </Pressable>
      </View>
      <CameraFpsOverlay metrics={fpsMetrics} />
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
  captureBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#4A7CF7', borderRadius: 14 },
  captureBtnPressed: { backgroundColor: '#3A6AE0' },
  captureBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  capturingBanner: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  capturingText: { color: '#4A7CF7', fontSize: 14 },
  backBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#333333', borderRadius: 12 },
  backBtnPressed: { backgroundColor: '#444444' },
  backBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
