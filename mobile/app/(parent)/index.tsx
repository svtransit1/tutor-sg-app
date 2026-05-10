import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { KidProfileRepository } from '@/storage/kidProfiles';
import { ParentSessionRepository } from '@/storage/parentSessions';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [hasSessions, setHasSessions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await KidProfileRepository.getProfiles();
        let count = 0;
        for (const p of profiles) {
          const sessions = await ParentSessionRepository.getSessionsForKid(p.id);
          count += sessions.length;
        }
        setHasSessions(count > 0);
      } catch {
        setHasSessions(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" accessibilityLabel={t('app.loading')} />
      </View>
    );
  }

  if (!hasSessions) {
    return (
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon} accessibilityRole="image" accessibilityLabel="book icon">{'\uD83D\uDCDA'}</Text>
        </View>
        <Text style={styles.title}>{t('parent.dashboard.empty.title')}</Text>
        <Text style={styles.description}>{t('parent.dashboard.empty.description')}</Text>
        <Pressable style={styles.cta} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('parent.dashboard.empty.cta')}>
          <Text style={styles.ctaText}>{t('parent.dashboard.empty.cta')}</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.push('/(parent)/change-pin')} accessibilityRole="button" accessibilityLabel={t('parent.changePin')}>
          <Text style={styles.linkText}>{t('parent.changePin')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('parent.backToKid')}>
          <Text style={styles.secondaryBtnText}>{t('parent.backToKid')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('parent.dashboard.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  cta: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '500',
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
