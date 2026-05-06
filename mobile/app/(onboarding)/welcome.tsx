import { View, Text, StyleSheet } from 'react-native';

/**
 * Onboarding welcome screen — placeholder.
 * Full onboarding flow (parent registration, device check, model download,
 * kid profile setup) will be built in M2.
 */
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding — Welcome</Text>
      <Text style={styles.subtitle}>Placeholder — M2 implementation pending</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
});
