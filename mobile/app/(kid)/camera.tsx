import { View, Text, StyleSheet } from 'react-native';

/**
 * Kid camera screen — placeholder.
 * Will integrate expo-camera for homework photo capture.
 */
export default function KidCameraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kid — Camera</Text>
      <Text style={styles.subtitle}>Placeholder — expo-camera integration</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
  },
});
