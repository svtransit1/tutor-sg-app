/**
 * DashboardScreen — Parent dashboard (daily/weekly session log view).
 *
 * Per ADD §4.2: parent-facing dashboard for session logs, progress summaries.
 * This is a stub for the navigation shell — actual data rendering is tracked
 * in a separate issue.
 * VoiceOver/TalkBack accessible.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.title} accessibilityRole="header">
          {t('parent.dashboard.title')}
        </Text>
        <Text style={styles.placeholder}>
          {t('parent.dashboard.placeholder')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
