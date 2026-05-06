/**
 * Kid tab navigator layout — bottom tabs for kid area + parent gate.
 *
 * 4 tabs:
 * 1. Home — subject tiles, camera quick-entry, recent sessions
 * 2. Camera — direct camera launch (hero feature)
 * 3. History — past sessions
 * 4. Parent — lock icon, PIN-gated access to parent dashboard
 *
 * Per ADD §4.2: parent tab triggers PIN entry overlay, then navigates to /parent/.
 * Parent area is a modal (defined in app/parent/).
 * Camera-result is a root-level route (no tabs).
 *
 * Bilingual EN + zh-Hans. VoiceOver/TalkBack labels.
 * Kid-safe: no analytics SDKs.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

/** Simple emoji tab icon — replace with proper icons in M3. */
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {emoji}
    </Text>
  );
}

export default function KidTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* Home tab — subject tiles, camera quick-entry */}
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('navigation.tabs.homeA11y'),
        }}
      />

      {/* Camera tab — direct camera launch */}
      <Tabs.Screen
        name="camera"
        options={{
          title: t('navigation.tabs.camera'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📷" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('navigation.tabs.cameraA11y'),
        }}
      />

      {/* History tab — past sessions */}
      <Tabs.Screen
        name="history"
        options={{
          title: t('navigation.tabs.history'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('navigation.tabs.historyA11y'),
        }}
      />

      {/* Parent tab — lock icon, PIN-gated */}
      <Tabs.Screen
        name="parent"
        options={{
          title: t('navigation.tabs.parent'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔒" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('navigation.tabs.parentA11y'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
