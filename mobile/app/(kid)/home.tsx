import { View, Text, StyleSheet } from 'react-native';

/**
 * Kid home screen — placeholder.
 * Will render subject tiles (Math, English, Science, Chinese MT) + camera CTA.
 */
export default function KidHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kid — Home</Text>
      <Text style={styles.subtitle}>Placeholder — subject tiles + camera CTA</Text>
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
