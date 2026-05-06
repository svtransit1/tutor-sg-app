import { View, Text, StyleSheet } from 'react-native';

/**
 * Parent dashboard — placeholder.
 * Will show parent log (daily/weekly session summaries, flagged items).
 */
export default function ParentDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent — Dashboard</Text>
      <Text style={styles.subtitle}>Placeholder — parent log + session summaries</Text>
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
