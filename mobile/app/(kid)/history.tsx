import { View, Text, StyleSheet } from 'react-native';

/**
 * Kid history screen — placeholder.
 * Will show past homework sessions and practice worksheets.
 */
export default function KidHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kid — History</Text>
      <Text style={styles.subtitle}>Placeholder — session history list</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
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
