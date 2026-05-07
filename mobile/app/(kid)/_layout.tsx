import { Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import HomeworkErrorBoundary from '@/components/ErrorBoundary';

function KidScreenHeader({ title }: { title: string }) {
  return (
    <View
      style={styles.screenHeader}
      accessibilityRole="header"
      accessibilityLabel={title}
    >
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
}

export default function KidLayout() {
  return (
    <HomeworkErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </HomeworkErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
