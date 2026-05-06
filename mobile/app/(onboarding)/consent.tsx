import { View, Text, StyleSheet } from 'react-native';

/**
 * Consent screen — onboarding step 2/7.
 * Privacy & data consent with analytics opt-in toggle.
 * Full implementation in a follow-up issue.
 */
export default function ConsentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consent Screen</Text>
      <Text style={styles.subtitle}>Privacy & data consent — to be implemented</Text>
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
