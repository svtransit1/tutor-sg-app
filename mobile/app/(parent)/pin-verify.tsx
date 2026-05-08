import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { usePinGate } from '../../src/parent-auth/pin-context'

export default function PinVerifyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    handleVerifyPin,
    handleResetPin,
    error,
    attemptsRemaining,
    cooldownRemaining,
    status,
  } = usePinGate()

  const [pin, setPin] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [cooldownDisplay, setCooldownDisplay] = useState(0)

  useEffect(() => {
    if (status === 'verified') {
      router.replace('/(parent)/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      setCooldownDisplay(Math.ceil(cooldownRemaining / 1000))
      const interval = setInterval(() => {
        setCooldownDisplay((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [cooldownRemaining])

  const displayError = localError ?? error

  function handleDigitPress(digit: string) {
    if (cooldownDisplay > 0) return
    setLocalError(null)
    if (pin.length < 4) {
      const next = pin + digit
      setPin(next)
      if (next.length === 4) {
        submitPin(next)
      }
    }
  }

  function handleDelete() {
    if (cooldownDisplay > 0) return
    setLocalError(null)
    setPin(pin.slice(0, -1))
  }

  async function submitPin(value: string) {
    const ok = await handleVerifyPin(value)
    if (!ok) {
      setPin('')
    }
  }

  const isLocked = cooldownDisplay > 0

  async function handleForgotPin() {
    await handleResetPin()
    router.replace('/(parent)/pin-setup')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>{t('parentAuth.title')}</Text>
        <Text style={styles.subtitle}>{t('parentAuth.enterPin')}</Text>

        <View style={styles.dotsRow}>
          {Array.from({ length: 4 }, (_, i) => (
            <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
          ))}
        </View>

        {isLocked ? (
          <View style={styles.cooldownContainer}>
            <Text style={styles.cooldownTitle}>{t('parentAuth.cooldown')}</Text>
            <Text style={styles.cooldownTimer}>
              {t('parentAuth.cooldownTimer', { seconds: cooldownDisplay })}
            </Text>
          </View>
        ) : displayError ? (
          <Text style={styles.errorText}>{displayError}</Text>
        ) : (
          attemptsRemaining < 5 &&
          attemptsRemaining > 0 && (
            <Text style={styles.attemptsText}>
              {t('parentAuth.attemptsRemaining', { count: attemptsRemaining })}
            </Text>
          )
        )}

        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => {
            if (key === '') {
              return <View key="empty" style={styles.keypadKey} />
            }
            if (key === 'del') {
              return (
                <TouchableOpacity
                  key="del"
                  style={[styles.keypadKey, isLocked && styles.keypadKeyDisabled]}
                  onPress={handleDelete}
                  disabled={isLocked || pin.length === 0}
                  accessibilityRole="button"
                  accessibilityLabel={t('parentAuth.delete')}
                >
                  <Text
                    style={[styles.keypadKeyText, isLocked && styles.keypadKeyTextDisabled]}
                  >
                    ⌫
                  </Text>
                </TouchableOpacity>
              )
            }
            return (
              <TouchableOpacity
                key={key}
                style={[styles.keypadKey, isLocked && styles.keypadKeyDisabled]}
                onPress={() => handleDigitPress(key)}
                disabled={isLocked}
                accessibilityRole="button"
                accessibilityLabel={key}
              >
                <Text
                  style={[styles.keypadKeyText, isLocked && styles.keypadKeyTextDisabled]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity
          onPress={handleForgotPin}
          style={styles.forgotLink}
          accessibilityRole="button"
          accessibilityLabel={t('parentAuth.forgotPin')}
        >
          <Text style={styles.forgotLinkText}>{t('parentAuth.forgotPin')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  dotFilled: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  errorText: {
    fontSize: 14,
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  attemptsText: {
    fontSize: 14,
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  cooldownContainer: { alignItems: 'center', marginBottom: 16 },
  cooldownTitle: { fontSize: 14, color: '#E53E3E', textAlign: 'center' },
  cooldownTimer: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E53E3E',
    textAlign: 'center',
    marginTop: 4,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 240,
    gap: 8,
  },
  keypadKey: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#F5F7FA',
  },
  keypadKeyDisabled: { backgroundColor: '#F0F0F0', opacity: 0.5 },
  keypadKeyText: { fontSize: 28, fontWeight: '600', color: '#1A1A1A' },
  keypadKeyTextDisabled: { color: '#CCC' },
  forgotLink: { paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  forgotLinkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
})
