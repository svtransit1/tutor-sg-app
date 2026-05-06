/**
 * CameraScreen — Placeholder camera tab for kid area.
 *
 * Per ADD §4.1: Camera homework check (hero feature).
 * This is a stub for the navigation shell — actual camera implementation
 * is tracked in a separate issue.
 * Kid-safe: no analytics SDKs.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>{t('kidHome.camera.title')}</Text>
        <Text style={styles.subtitle}>
          {t('kidHome.camera.subtitle')}
        </Text>
        <Text style={styles.placeholder}>
          Camera capture screen — coming in M3
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  placeholder: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
