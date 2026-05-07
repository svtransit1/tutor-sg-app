import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
export default function AgeGatePlaceholder() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>Age Gate — coming soon</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  text: { marginTop: 16, fontSize: 16, color: '#6B7280' },
});
