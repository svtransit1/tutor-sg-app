import { useState, useEffect, useCallback, useRef } from 'react'
import { AppState } from 'react-native'
import { ParentSessionRepository, type SessionSnapshot, type SessionScreen } from '../storage/parentSessions'

export interface UseSessionResumeReturn {
  hasInterruptedSession: boolean
  checking: boolean
  resumeData: SessionSnapshot | null
  dismissResume: () => Promise<void>
  endAndDismissResume: () => Promise<void>
  saveSnapshot: (sessionId: string, screen: SessionScreen, snapshotData?: string) => Promise<void>
  clearSnapshot: (sessionId: string) => Promise<void>
  refreshSession: () => Promise<void>
}

export function useSessionResume(): UseSessionResumeReturn {
  const [pendingResume, setPendingResume] = useState<SessionSnapshot | null>(null)
  const [checking, setChecking] = useState(true)
  const foregroundCallbackRef = useRef<(() => void) | null>(null)

  const checkForInterruptedSession = useCallback(async () => {
    try {
      const snapshot = await ParentSessionRepository.getActiveSnapshot()
      setPendingResume(snapshot)
    } catch {
      setPendingResume(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkForInterruptedSession()
  }, [checkForInterruptedSession])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && foregroundCallbackRef.current) {
        foregroundCallbackRef.current()
      }
    })
    return () => sub.remove()
  }, [])

  foregroundCallbackRef.current = () => {
    checkForInterruptedSession()
  }

  const dismissResume = useCallback(async () => {
    if (!pendingResume) return
    await ParentSessionRepository.clearSessionSnapshot(pendingResume.sessionId)
    setPendingResume(null)
  }, [pendingResume])

  const endAndDismissResume = useCallback(async () => {
    if (!pendingResume) return
    await ParentSessionRepository.clearSessionSnapshot(pendingResume.sessionId)
    await ParentSessionRepository.endSession(pendingResume.sessionId, '', false)
    setPendingResume(null)
  }, [pendingResume])

  const saveSnapshot = useCallback(async (sessionId: string, screen: SessionScreen, snapshotData = '{}') => {
    await ParentSessionRepository.saveSessionSnapshot(sessionId, screen, snapshotData)
  }, [])

  const clearSnapshot = useCallback(async (sessionId: string) => {
    await ParentSessionRepository.clearSessionSnapshot(sessionId)
  }, [])

  const refreshSession = useCallback(async () => {
    await checkForInterruptedSession()
  }, [checkForInterruptedSession])

  return {
    hasInterruptedSession: pendingResume !== null,
    checking,
    resumeData: pendingResume,
    dismissResume,
    endAndDismissResume,
    saveSnapshot,
    clearSnapshot,
    refreshSession,
  }
}
