import { View, Text, StyleSheet } from 'react-native';

/**
 * Parent settings — placeholder.
 * Will host language switch, quality slider, model management, privacy, IAP.
 */
export default function ParentSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent — Settings</Text>
      <Text style={styles.subtitle}>Placeholder — language, quality, model, privacy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
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
