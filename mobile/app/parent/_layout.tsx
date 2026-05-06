/**
 * Parent area tab layout — bottom tabs for parent dashboard, settings, profiles.
 *
 * Presented as a modal after PIN verification.
 * Per ADD §4.2: parent-facing dashboard, settings, child profile management.
 * Bilingual EN + zh-Hans. VoiceOver/TalkBack accessible.
 * Kid-safe boundary: parent data is isolated from kid UI code.
 */
import React, { useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Simple tab icon — emoji. Replace with proper icons in M3.
 */
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {emoji}
    </Text>
  );
}

/**
 * Close button for modal dismiss.
 */
function CloseButton() {
  const router = useRouter();
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <TouchableOpacity
      style={styles.closeBtn}
      onPress={handleClose}
      accessibilityRole="button"
      accessibilityLabel="Close parent area"
    >
      <Text style={styles.closeText}>✕</Text>
    </TouchableOpacity>
  );
}

export default function ParentTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        headerRight: () => <CloseButton />,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('parent.dashboard.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('parent.dashboard.title'),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('parent.settings.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('parent.settings.title'),
        }}
      />

      <Tabs.Screen
        name="profiles"
        options={{
          title: t('parent.profiles.title', 'Profiles'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
          tabBarAccessibilityLabel: t('parent.profiles.title', 'Profiles'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
} as TextStyle);
