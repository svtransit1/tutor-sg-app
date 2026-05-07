/**
 * Tutor SG — Mobile App Entry Point
 *
 * Boot sequence:
 * 1. Initialize i18n (locale detection, resource loading)
 * 2. Render splash while loading
 * 3. Wrap app tree in TutorSGProvider for typed useI18n()
 *
 * This file is the standard Expo entry point (App.tsx).
 * In a full Expo Router setup, this would delegate to an app/_layout.tsx.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { initializeI18n, TutorSGProvider, useI18n } from '@tutor-sg/i18n';
import type { SupportedLocale } from '@tutor-sg/i18n';

// ---------------------------------------------------------------------------
// Splash screen shown while i18n initializes
// ---------------------------------------------------------------------------

function SplashScreen() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={splashStyles.container}>
      <StatusBar barStyle="dark-content" />
      <ActivityIndicator size="large" color="#4A90D9" />
      <Text style={splashStyles.text}>Loading{dots}</Text>
    </SafeAreaView>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

// ---------------------------------------------------------------------------
// Demo screen — shows translations working across all namespaces
// ---------------------------------------------------------------------------

function DemoContent() {
  const { t, locale, setLocale } = useI18n();
  const isEn = locale === 'en';

  return (
    <ScrollView style={demoStyles.scroll} contentContainerStyle={demoStyles.content}>
      {/* App header */}
      <Text style={demoStyles.title}>{t('app.name')}</Text>
      <Text style={demoStyles.tagline}>{t('app.tagline')}</Text>

      {/* Locale switcher */}
      <View style={demoStyles.switcherRow}>
        <TouchableOpacity
          style={[demoStyles.langButton, isEn && demoStyles.langButtonActive]}
          onPress={() => setLocale('en')}
          accessibilityLabel="Switch to English"
        >
          <Text style={[demoStyles.langText, isEn && demoStyles.langTextActive]}>
            {t('english')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[demoStyles.langButton, !isEn && demoStyles.langButtonActive]}
          onPress={() => setLocale('zh-Hans')}
          accessibilityLabel="Switch to Simplified Chinese"
        >
          <Text style={[demoStyles.langText, !isEn && demoStyles.langTextActive]}>
            {t('chinese')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={demoStyles.badge}>Current locale: {locale}</Text>

      {/* Common namespace */}
      <Section title="common namespace">
        <DemoRow label={t('save')} note="t('save')" />
        <DemoRow label={t('cancel')} note="t('cancel')" />
        <DemoRow label={t('continue')} note="t('continue')" />
        <DemoRow label={t('loading')} note="t('loading')" />
        <DemoRow label={t('settings')} note="t('settings')" />
        <DemoRow label={t('app.name')} note="t('app.name')" />
        <DemoRow label={t('math')} note="t('math')" />
        <DemoRow label={t('english_subject')} note="t('english_subject')" />
        <DemoRow label={t('subject_select')} note="t('subject_select')" />
      </Section>

      {/* Onboarding namespace */}
      <Section title="onboarding namespace">
        <DemoRow label={t('onboarding:welcome_title')} note="t('onboarding:welcome_title')" />
        <DemoRow label={t('onboarding:get_started')} note="t('onboarding:get_started')" />
        <DemoRow label={t('onboarding:download_model')} note="t('onboarding:download_model')" />
        <DemoRow label={t('onboarding:setup_complete')} note="t('onboarding:setup_complete')" />
      </Section>

      {/* Homework namespace */}
      <Section title="homework namespace">
        <DemoRow label={t('homework:title')} note="t('homework:title')" />
        <DemoRow label={t('homework:capture')} note="t('homework:capture')" />
        <DemoRow label={t('homework:chat_hint')} note="t('homework:chat_hint')" />
        <DemoRow label={t('homework:worksheet_title')} note="t('homework:worksheet_title')" />
        <DemoRow
          label={t('homework:worksheet_score', {
            correct: 3,
            total: 5,
          })}
          note="t('homework:worksheet_score', { correct: 3, total: 5 })"
        />
      </Section>

      {/* Parent namespace */}
      <Section title="parent namespace">
        <DemoRow label={t('parent:pin_title')} note="t('parent:pin_title')" />
        <DemoRow label={t('parent:dashboard_title')} note="t('parent:dashboard_title')" />
        <DemoRow label={t('parent:log_empty')} note="t('parent:log_empty')" />
      </Section>

      {/* Settings namespace */}
      <Section title="settings namespace">
        <DemoRow label={t('settings:subscription_title')} note="t('settings:subscription_title')" />
        <DemoRow
          label={t('settings:subscription_free_tier')}
          note="t('settings:subscription_free_tier')"
        />
        <DemoRow
          label={t('settings:subscription_restore')}
          note="t('settings:subscription_restore')"
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={demoStyles.section}>
      <Text style={demoStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DemoRow({ label, note }: { label: string; note: string }) {
  return (
    <View style={demoStyles.row}>
      <Text style={demoStyles.rowLabel}>{label}</Text>
      <Text style={demoStyles.rowNote}>{note}</Text>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', color: '#1A1A2E' },
  tagline: { fontSize: 14, textAlign: 'center', color: '#666', marginTop: 4, marginBottom: 20 },
  switcherRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  langButtonActive: { backgroundColor: '#4A90D9' },
  langText: { fontSize: 14, fontWeight: '600', color: '#333' },
  langTextActive: { color: '#FFF' },
  badge: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90D9',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: { marginBottom: 8, paddingVertical: 4 },
  rowLabel: { fontSize: 16, color: '#1A1A2E' },
  rowNote: { fontSize: 11, color: '#AAA', fontFamily: 'monospace', marginTop: 2 },
});

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeI18n()
      .then(() => setReady(true))
      .catch((err: Error) => {
        console.error('[tutor-sg] i18n initialization failed:', err);
        setError(err.message ?? 'Failed to initialize');
      });
  }, []);

  // Splash while loading
  if (!ready) {
    return <SplashScreen />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={splashStyles.container}>
        <Text style={[splashStyles.text, { color: '#D32F2F' }]}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  // App ready — wrap in i18n provider
  return (
    <TutorSGProvider>
      <SafeAreaView style={demoStyles.scroll}>
        <DemoContent />
      </SafeAreaView>
    </TutorSGProvider>
  );
}
