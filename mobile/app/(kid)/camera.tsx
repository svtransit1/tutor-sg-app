import React, { useEffect, useRef, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Platform, Linking } from 'react-native'
import { Stack, router } from 'expo-router'
import { useParentSession } from '../../src/hooks/useParentSession'
import { ParentSubject } from '../../src/storage/parentSessions'
import { useTranslation } from 'react-i18next'
import CameraPermissionDeniedSheet from '../../src/components/CameraPermissionDeniedSheet'
import CameraDarkEnvironmentSheet from '../../src/components/CameraDarkEnvironmentSheet'
import CameraUnavailableSheet from '../../src/components/CameraUnavailableSheet'

type CameraState =
  | { type: 'checking' }
  | { type: 'camera_ready' }
  | { type: 'permission_denied' }
  | { type: 'no_camera' }
  | { type: 'dark_environment' }

export default function CameraScreen() {
  const { t } = useTranslation()
  const { startParentSession, endParentSession } = useParentSession()
  const sessionIdRef = useRef<string | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>({ type: 'checking' })

  useEffect(() => {
    const defaultSubject: ParentSubject = 'math'
    startParentSession(defaultSubject).then((id) => {
      if (id) sessionIdRef.current = id
    })

    // Detect camera hardware availability.
    // iOS Simulator has no camera; real iOS devices always do.
    // On Android, check via Platform — a real check would use expo-camera.
    const hasCameraHardware = Platform.OS === 'ios'
      ? !(__DEV__ && Platform.isPad)
      : Platform.OS === 'android'

    if (!hasCameraHardware) {
      setCameraState({ type: 'no_camera' })
    } else {
      setCameraState({ type: 'camera_ready' })
    }

    return () => {
      endParentSession('', false)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    router.back()
  }, [])

  const handleManualInput = useCallback(() => {
    router.back()
  }, [])

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    }
  }, [])

  const handleRequestPermission = useCallback(() => {
    setCameraState({ type: 'camera_ready' })
  }, [])

  const handleRetryCamera = useCallback(() => {
    setCameraState({ type: 'camera_ready' })
  }, [])

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {cameraState.type === 'checking' && (
        <View style={styles.placeholder}>
          <Text style={styles.icon}>{'\uD83D\uDCF7'}</Text>
          <Text style={styles.title}>{t('kid.camera.title')}</Text>
          <Text style={styles.subtitle}>{t('kid.camera.subtitle')}</Text>
        </View>
      )}

      {cameraState.type === 'camera_ready' && (
        <View style={styles.placeholder}>
          <Text style={styles.icon}>{'\uD83D\uDCF7'}</Text>
          <Text style={styles.title}>{t('kid.camera.title')}</Text>
          <Text style={styles.subtitle}>{t('kid.camera.subtitle')}</Text>
        </View>
      )}

      {cameraState.type === 'permission_denied' && (
        <CameraPermissionDeniedSheet
          onDismiss={handleDismiss}
          onManualInput={handleManualInput}
          onOpenSettings={handleOpenSettings}
          onRequestPermission={handleRequestPermission}
        />
      )}

      {cameraState.type === 'dark_environment' && (
        <CameraDarkEnvironmentSheet
          onDismiss={handleDismiss}
          onManualInput={handleManualInput}
          onRetry={handleRetryCamera}
        />
      )}

      {cameraState.type === 'no_camera' && (
        <CameraUnavailableSheet
          onDismiss={handleDismiss}
          onManualInput={handleManualInput}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666666', textAlign: 'center' },
})
