import { Stack } from 'expo-router';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import {
  lightColors as lightC,
  darkColors as darkC,
  scaledFontSize,
  scaledTouchTarget,
} from '@tutor-sg/theme';
import HomeworkErrorBoundary from '@/components/ErrorBoundary';

function KidScreenHeader({ title }: { title: string }) {
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? darkC : lightC;

  return (
    <View
      style={[styles.screenHeader, { minHeight: scaledTouchTarget() }]}
      accessibilityRole="header"
      accessibilityLabel={title}
    >
      <Text style={[styles.screenTitle, { color: C.textPrimary, fontSize: scaledFontSize('h3') }]}>
        {title}
      </Text>
    </View>
  );
}

export default function KidLayout() {
  return (
    <HomeworkErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="home"
          options={{ header: () => <KidScreenHeader title="Home" /> }}
        />
        <Stack.Screen
          name="camera"
          options={{ header: () => <KidScreenHeader title="Camera" /> }}
        />
        <Stack.Screen
          name="camera-result"
          options={{ header: () => <KidScreenHeader title="Result" /> }}
        />
      </Stack>
    </HomeworkErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  screenTitle: {
    fontWeight: '700',
  },
});
