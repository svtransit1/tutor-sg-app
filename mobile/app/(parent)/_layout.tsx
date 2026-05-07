import React, { useEffect } from 'react'
import { Stack, useSegments, useRouter } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { PinGateProvider, usePinGate } from '../../src/parent-auth/pin-context'

const AUTH_SCREENS = ['pin-setup', 'pin-verify']

function PinGateGuard({ children }: { children: React.ReactNode }) {
  const { status } = usePinGate()
  const segments = useSegments()
  const router = useRouter()

  const currentScreen = segments[segments.length - 1]
  const isAuthScreen = AUTH_SCREENS.includes(currentScreen)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'needs-setup' && !isAuthScreen) {
      router.replace('/(parent)/pin-setup')
    } else if (status === 'needs-verify' && !isAuthScreen) {
      router.replace('/(parent)/pin-verify')
    } else if (status === 'verified' && isAuthScreen) {
      router.replace('/(parent)/dashboard')
    }
  }, [status, isAuthScreen, router])

  if (status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    )
  }

  return <>{children}</>
}

export default function ParentLayout() {
  return (
    <PinGateProvider>
      <PinGateGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="pin-setup" />
          <Stack.Screen name="pin-verify" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="settings" />
        </Stack>
      </PinGateGuard>
    </PinGateProvider>
  )
}
