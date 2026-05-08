import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function KidCameraResultScreen() {
  const { t } = useTranslation();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
        {t('cameraResult.title')}
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
        {t('cameraResult.followUp.placeholder')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
