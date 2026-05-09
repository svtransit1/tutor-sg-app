import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FpsMetrics } from '@/hooks/useFpsMonitor';

interface CameraFpsOverlayProps { metrics: FpsMetrics; }

export function CameraFpsOverlay({ metrics }: CameraFpsOverlayProps) {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return null;
  const a11yLabel = metrics.currentFps + ' frames per second' + (metrics.isLowFps ? ', low frame rate warning' : '');
  return (
    <View style={styles.container}>
      <View style={[styles.badge, metrics.isLowFps && styles.badgeWarning]} accessibilityLabel={a11yLabel} accessibilityRole="text">
        <Text style={[styles.text, metrics.isLowFps && styles.textWarning]} accessibilityElementsHidden>{metrics.currentFps + ' FPS'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, right: 0, zIndex: 999 },
  badge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, margin: 8 },
  badgeWarning: { backgroundColor: 'rgba(255,204,0,0.85)' },
  text: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  textWarning: { color: '#1A1A1A' },
});
