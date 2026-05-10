import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import type { KidProfile } from '@/storage/kidProfiles';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [selectedKid, setSelectedKid] = useState<KidProfile | null>(null);

  const bgColor = isDark ? '#121212' : '#F8F9FA';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{t('parent.dashboard.title')}</Text>
      </View>

      <View style={styles.content}>
        <ProfileSwitcher onProfileChange={setSelectedKid} />

        {selectedKid ? (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {selectedKid.name} · {selectedKid.level}
            </Text>
            <Text style={[styles.cardBody, { color: mutedColor }]}>
              {t('parent.dashboard.placeholder')}
            </Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardBody, { color: mutedColor }]}>
              {t('parent.dashboard.placeholder')}
            </Text>
          </View>
        )}

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/(parent)/change-pin')}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>{t('parent.changePin')}</Text>
        </Pressable>

        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={[styles.closeButtonText, { color: mutedColor }]}>
            {t('parent.backToKid')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  card: { borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  cardBody: { fontSize: 16, lineHeight: 22 },
  actionButton: { marginTop: 8, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  closeButton: { marginTop: 24, paddingVertical: 10, alignItems: 'center' },
  closeButtonText: { fontSize: 14, fontWeight: '500' },
});
