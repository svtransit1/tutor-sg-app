import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FAFAFA', paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('parent.dashboard.title')}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#888888' }]}>
          {t('parent.dashboard.placeholder')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
});
