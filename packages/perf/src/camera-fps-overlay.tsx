import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { FpsStats, fpsColor } from './fps-monitor'

interface CameraFpsOverlayProps {
  stats: FpsStats
  lowFpsWarning?: boolean
}

/** Dev-mode FPS overlay for camera preview. Renders nothing in production. */
export function CameraFpsOverlay({
  stats,
  lowFpsWarning = false,
}: CameraFpsOverlayProps): React.JSX.Element | null {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return null

  const color = fpsColor(stats.current)

  return (
    <View style={styles.container} pointerEvents="none">
      <Text
        style={[styles.label, { color }]}
        accessibilityLabel={`FPS: ${stats.current}`}
        accessibilityRole="text"
      >
        {stats.current} FPS
      </Text>
      {lowFpsWarning && <LowFpsWarningBanner />}
    </View>
  )
}

/** Flashing yellow indicator when FPS is sustained below 25. */
function LowFpsWarningBanner(): React.JSX.Element {
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View style={[styles.warningBanner, { opacity }]}>
      <Text style={styles.warningText}>⚠ Low FPS</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  warningBanner: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 152, 0, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'monospace',
  },
})
