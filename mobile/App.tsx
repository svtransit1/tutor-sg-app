/**
 * Tutor SG — Mobile App Entry Point
 *
 * Boot sequence:
 * 1. Initialize i18n (locale detection, resource loading)
 * 2. Render splash while loading
 * 3. Wrap app tree in TutorSGProvider for typed useI18n()
 * 4. Main screen includes "Parent Area" button that opens PIN gate
 *
 * This file is the standard Expo entry point (App.tsx).
 * In a full Expo Router setup, this would delegate to an app/_layout.tsx.
 *
 * Parent PIN gate flow (AAAS-305):
 * - Tap "Parent Area" → check if PIN set
 *   - Not set → PinSetupScreen (create PIN)
 *   - Set → PinGateScreen (enter PIN)
 *   - Success → ParentDashboardScreen
 * - Each screen has dismiss to go back to main app
 * - 5 failed PIN attempts → 60-second lockout
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
import { isPinSet } from './src/parent/pin-storage';
import PinGateScreen from './src/parent/PinGateScreen';
import PinSetupScreen from './src/parent/PinSetupScreen';
import ParentDashboardScreen from './src/parent/ParentDashboardScreen';

// ── Types ──────────────────────────────────────────────────────────

type ParentView = null | 'loading' | 'setup' | 'gate' | 'dashboard';

// ── Splash screen shown while i18n initializes ────────────────────

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

// ── Demo / main content screen ────────────────────────────────────

function MainContent({ onOpenParentArea }: { onOpenParentArea: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const isEn = locale === 'en';

  return (
    <ScrollView style={mainStyles.scroll} contentContainerStyle={mainStyles.content}>
      {/* App header */}
      <Text style={mainStyles.title}>{t('app.name')}</Text>
      <Text style={mainStyles.tagline}>{t('app.tagline')}</Text>

      {/* Locale switcher */}
      <View style={mainStyles.switcherRow}>
        <TouchableOpacity
          style={[mainStyles.langButton, isEn && mainStyles.langButtonActive]}
          onPress={() => setLocale('en')}
          accessibilityLabel="Switch to English"
        >
          <Text style={[mainStyles.langText, isEn && mainStyles.langTextActive]}>
            {t('english')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[mainStyles.langButton, !isEn && mainStyles.langButtonActive]}
          onPress={() => setLocale('zh-Hans')}
          accessibilityLabel="Switch to Simplified Chinese"
        >
          <Text style={[mainStyles.langText, !isEn && mainStyles.langTextActive]}>
            {t('chinese')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={mainStyles.badge}>Current locale: {locale}</Text>

      {/* Parent Area button */}
      <TouchableOpacity
        style={mainStyles.parentButton}
        onPress={onOpenParentArea}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding:enter_parent_area')}
      >
        <Text style={mainStyles.parentButtonText}>{t('onboarding:enter_parent_area')}</Text>
      </TouchableOpacity>

      {/* Common namespace demo */}
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

      {/* Parent namespace demo */}
      <Section title="parent namespace">
        <DemoRow label={t('parent:pin_title')} note="t('parent:pin_title')" />
        <DemoRow label={t('parent:dashboard_title')} note="t('parent:dashboard_title')" />
        <DemoRow label={t('parent:log_empty')} note="t('parent:log_empty')" />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={mainStyles.section}>
      <Text style={mainStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DemoRow({ label, note }: { label: string; note: string }) {
  return (
    <View style={mainStyles.row}>
      <Text style={mainStyles.rowLabel}>{label}</Text>
      <Text style={mainStyles.rowNote}>{note}</Text>
    </View>
  );
}

const mainStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 20, paddingBottom: 60 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A2E',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
    marginBottom: 20,
  },
  switcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
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
  parentButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  parentButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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
  rowNote: {
    fontSize: 11,
    color: '#AAA',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

// ── App root ───────────────────────────────────────────────────────

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentView, setParentView] = useState<ParentView>(null);

  useEffect(() => {
    initializeI18n()
      .then(() => setReady(true))
      .catch((err: Error) => {
        console.error('[tutor-sg] i18n initialization failed:', err);
        setError(err.message ?? 'Failed to initialize');
      });
  }, []);

  // ── Handle "Parent Area" button press ─────────────────────
  const handleOpenParentArea = async () => {
    setParentView('loading');
    try {
      const pinAlreadySet = await isPinSet();
      setParentView(pinAlreadySet ? 'gate' : 'setup');
    } catch {
      // If storage fails, default to setup
      setParentView('setup');
    }
  };

  // ── Handle exit from parent area ──────────────────────────
  const handleDismissParent = () => {
    setParentView(null);
  };

  // ── Render ────────────────────────────────────────────────

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

  // App root
  return (
    <TutorSGProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {parentView === null && <MainContent onOpenParentArea={handleOpenParentArea} />}

        {parentView === 'loading' && (
          <View style={splashStyles.container}>
            <ActivityIndicator size="large" color="#4A90D9" />
          </View>
        )}

        {parentView === 'setup' && (
          <PinSetupScreen
            onComplete={() => setParentView('dashboard')}
            onSkip={() => setParentView(null)}
            onDismiss={handleDismissParent}
            skippable={true}
          />
        )}

        {parentView === 'gate' && (
          <PinGateScreen
            onAuthenticated={() => setParentView('dashboard')}
            onDismiss={handleDismissParent}
          />
        )}

        {parentView === 'dashboard' && <ParentDashboardScreen onDismiss={handleDismissParent} />}
      </SafeAreaView>
    </TutorSGProvider>
  );
}
