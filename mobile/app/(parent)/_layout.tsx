import React, { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { Stack, useSegments, useRouter } from 'expo-router'
import { View } from 'react-native'
import { PinGateProvider, usePinGate } from '../../src/parent-auth/pin-context'
import { Skeleton } from '@/components/Skeleton'

const AUTH_SCREENS = ['pin-setup', 'pin-verify']

function PinGateGuard({ children }: { children: React.ReactNode }) {
  const { status } = usePinGate()
  const segments = useSegments()
  const router = useRouter()
  const isDark = useColorScheme() === 'dark'

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
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          paddingHorizontal: 48,
          gap: 16,
        }}
      >
        <Skeleton.Circle size={64} isDark={isDark} />
        <Skeleton width={200} height={22} borderRadius={4} isDark={isDark} />
        <Skeleton width={140} height={14} borderRadius={4} isDark={isDark} />
        <Skeleton width="100%" height={52} borderRadius={12} isDark={isDark} style={{ marginTop: 8 }} />
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
