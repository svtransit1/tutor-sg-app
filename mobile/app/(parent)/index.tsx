import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container} accessibilityLabel={t('parent.accessibility.dashboardTitle')}>
      <Text style={styles.title} accessibilityRole="header">{t('parent.dashboard.title')}</Text>
      <Text style={styles.subtitle} accessibilityRole="text">{t('parent.dashboard.placeholder')}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/(parent)/change-pin')}
        accessibilityRole="button"
        accessibilityLabel={t('parent.accessibility.changePinButton')}
      >
        <Text style={styles.buttonText}>{t('parent.changePin')}</Text>
      </Pressable>
      <Pressable
        style={styles.closeButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('parent.accessibility.backToKidButton')}
      >
        <Text style={styles.closeButtonText}>{t('parent.backToKid')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 48 },
  button: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#2563EB', borderRadius: 12 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  closeButton: { marginTop: 24, paddingVertical: 10, paddingHorizontal: 20 },
  closeButtonText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
});
