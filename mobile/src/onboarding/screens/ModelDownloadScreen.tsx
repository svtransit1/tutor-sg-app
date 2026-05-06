import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';

export function ModelDownloadScreen() {
  const { t } = useTranslation();
  const { goNext } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual model download from CDN.
    // 1. Fetch index.json from Cloudflare R2
    // 2. Download model files with Range resume support
    // 3. Verify SHA-256 integrity
    // 4. Move to permanent storage
    // For now, simulate download progress.
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setTimeout(goNext, 500);
          return 100;
        }
        return p + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {downloading ? (
        <>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.title}>
            {t('onboarding.modelDownload.title', 'Setting up your tutor...')}
          </Text>
          <Text style={styles.subtitle}>
            {t('onboarding.modelDownload.downloading', 'Downloading AI model...')}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>
            {t('onboarding.modelDownload.ready', 'Ready!')}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  progressBar: { width: '80%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4A90D9', borderRadius: 4 },
  progressText: { fontSize: 14, marginTop: 8, color: '#666' },
});
