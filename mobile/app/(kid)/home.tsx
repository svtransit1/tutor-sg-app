import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function KidHomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>tutor-sg</Text>
      <Text style={styles.subtitle}>{t('kidHome.firstSession.ctaCamera')}</Text>

      <Pressable
        style={styles.cameraTile}
        onPress={() => router.push('/(kid)/camera-permission')}
        accessibilityRole="button"
        accessibilityLabel={t('kidHome.camera.accessibility')}
      >
        <Text style={styles.cameraTileIcon}>{'\uD83D\uDCF7'}</Text>
        <View style={styles.cameraTileTextWrap}>
          <Text style={styles.cameraTileTitle}>{t('kidHome.camera.title')}</Text>
          <Text style={styles.cameraTileSubtitle}>{t('kidHome.camera.subtitle')}</Text>
        </View>
      </Pressable>

      <Pressable style={styles.parentButton} onPress={() => router.push('/(parent)')} accessibilityRole="button">
        <Text style={styles.parentButtonText}>{t('onboarding.done.parentArea')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  cameraTile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 20, width: '100%', marginBottom: 32,
  },
  cameraTileIcon: { fontSize: 32, marginRight: 16 },
  cameraTileTextWrap: { flex: 1 },
  cameraTileTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  cameraTileSubtitle: { fontSize: 14, color: '#6B7280' },
  parentButton: { paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#F3F4F6', borderRadius: 12 },
  parentButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});
