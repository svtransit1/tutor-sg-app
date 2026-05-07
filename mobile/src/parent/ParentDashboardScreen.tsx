import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}><Text style={s.headerTitle}>{t('parent.dashboard.title')}</Text></View>
      <View style={s.body}>
        <View style={s.iconWrap}><Text style={s.icon}>📋</Text></View>
        <Text style={s.title}>{t('parent.dashboard.title')}</Text>
        <Text style={s.bodyText}>{t('parent.dashboard.placeholder')}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  icon: { fontSize: 36 }, title: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 20, color: '#6B7280', textAlign: 'center' },
});
