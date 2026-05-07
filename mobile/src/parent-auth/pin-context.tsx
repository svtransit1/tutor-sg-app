import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  isPinSet as checkPinExists,
  verifyPin,
  getRemainingAttempts,
  getLockedUntil,
  MAX_FAILED_ATTEMPTS,
  COOLDOWN_SECONDS,
} from '../storage/pin-storage'

type PinStatus = 'loading' | 'needs-setup' | 'needs-verify' | 'verified'

interface PinState {
  status: PinStatus
  error: string | null
  attemptsRemaining: number
  cooldownRemaining: number
}

interface PinContextValue extends PinState {
  handleSetupPin: (pin: string, confirmPin: string) => Promise<boolean>
  handleVerifyPin: (pin: string) => Promise<boolean>
  resetVerification: () => void
}

const PinContext = createContext<PinContextValue | null>(null)

export function usePinGate(): PinContextValue {
  const ctx = useContext(PinContext)
  if (!ctx) {
    throw new Error('usePinGate must be used within a PinGateProvider')
  }
  return ctx
}

const COOLDOWN_POLL_MS = 1000

export function PinGateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PinState>({
    status: 'loading',
    error: null,
    attemptsRemaining: MAX_FAILED_ATTEMPTS,
    cooldownRemaining: 0,
  })

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopCooldownTimer = useCallback(() => {
    if (cooldownTimer.current) {
      clearInterval(cooldownTimer.current)
      cooldownTimer.current = null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const pinExists = await checkPinExists()
        const attempts = await getRemainingAttempts()
        const lockedUntil = await getLockedUntil()
        const now = Date.now()
        const cooldown = lockedUntil !== null && now < lockedUntil ? lockedUntil - now : 0

        setState((prev) => ({
          ...prev,
          status: pinExists ? 'needs-verify' : 'needs-setup',
          attemptsRemaining: attempts,
          cooldownRemaining: cooldown,
        }))

        if (cooldown > 0) {
          cooldownTimer.current = setInterval(async () => {
            const lu = await getLockedUntil()
            const cd = lu !== null && lu > Date.now() ? lu - Date.now() : 0
            setState((prev) => ({ ...prev, cooldownRemaining: cd }))
            if (cd <= 0) {
              stopCooldownTimer()
            }
          }, COOLDOWN_POLL_MS)
        }
      } catch {
        setState((prev) => ({
          ...prev,
          status: 'needs-setup',
          error: null,
        }))
      }
    })()

    return stopCooldownTimer
  }, [stopCooldownTimer])

  const handleSetupPin = useCallback(async (pin: string, confirmPin: string): Promise<boolean> => {
    if (pin !== confirmPin) {
      setState((prev) => ({ ...prev, error: 'parentAuth.pinsDontMatch' }))
      return false
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setState((prev) => ({ ...prev, error: 'parentAuth.setup.enterPin' }))
      return false
    }

    try {
      const { savePin } = await import('../storage/pin-storage')
      await savePin(pin)
      setState((prev) => ({
        ...prev,
        status: 'verified',
        error: null,
      }))
      return true
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'An error occurred. Please try again.',
      }))
      return false
    }
  }, [])

  const handleVerifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const { success, remainingAttempts, lockedUntil } = await verifyPin(pin)

      if (success) {
        setState((prev) => ({
          ...prev,
          status: 'verified',
          error: null,
          attemptsRemaining: MAX_FAILED_ATTEMPTS,
          cooldownRemaining: 0,
        }))
        stopCooldownTimer()
        return true
      }

      if (remainingAttempts <= 0 && lockedUntil !== null) {
        const now = Date.now()
        const cooldown = lockedUntil > now ? lockedUntil - now : 0
        setState((prev) => ({
          ...prev,
          error: null,
          attemptsRemaining: 0,
          cooldownRemaining: cooldown,
        }))
        cooldownTimer.current = setInterval(async () => {
          const lu = await getLockedUntil()
          const cd = lu !== null && lu > Date.now() ? lu - Date.now() : 0
          setState((prev) => ({ ...prev, cooldownRemaining: cd }))
          if (cd <= 0) {
            stopCooldownTimer()
          }
        }, COOLDOWN_POLL_MS)
      } else {
        setState((prev) => ({
          ...prev,
          error: 'parentAuth.wrongPin',
          attemptsRemaining: remainingAttempts,
        }))
      }

      return false
    },
    [stopCooldownTimer],
  )

  const resetVerification = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'needs-verify',
      error: null,
    }))
  }, [])

  const value: PinContextValue = {
    ...state,
    handleSetupPin,
    handleVerifyPin,
    resetVerification,
  }

  return <PinContext.Provider value={value}>{children}</PinContext.Provider>
}
