import { useState, useCallback, useRef } from 'react'
import { SessionRepository } from '@/storage/sessions'
import type { Subject, KidSession, SessionEvent } from '@/storage/sessions'

export interface HomeworkSessionState {
  sessionId: number | null
  isLoading: boolean
  error: Error | null
}

export interface UseHomeworkSessionReturn extends HomeworkSessionState {
  startSession: (subject: Subject) => Promise<number>
  addEvent: (type: SessionEvent['type'], payload: unknown) => Promise<number>
  incrementQuestionCount: () => Promise<void>
  closeSession: () => Promise<void>
  currentSession: KidSession | null
  reset: () => void
}

export function useHomeworkSession(): UseHomeworkSessionReturn {
  const [state, setState] = useState<HomeworkSessionState>({
    sessionId: null,
    isLoading: false,
    error: null,
  })
  const [currentSession, setCurrentSession] = useState<KidSession | null>(null)
  const sessionIdRef = useRef<number | null>(null)

  const startSession = useCallback(async (subject: Subject): Promise<number> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const id = await SessionRepository.createSession(subject)
      sessionIdRef.current = id
      setCurrentSession({
        id,
        subject,
        questionCount: 0,
        createdAt: new Date().toISOString(),
        closedAt: null,
      })
      setState({ sessionId: id, isLoading: false, error: null })
      return id
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start session')
      setState((prev) => ({ ...prev, isLoading: false, error }))
      throw error
    }
  }, [])

  const addEvent = useCallback(async (type: SessionEvent['type'], payload: unknown): Promise<number> => {
    const id = sessionIdRef.current
    if (id === null) throw new Error('No active session')

    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const eventId = await SessionRepository.addEvent(id, type, payload)
      setState((prev) => ({ ...prev, isLoading: false }))
      return eventId
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add event')
      setState((prev) => ({ ...prev, isLoading: false, error }))
      throw error
    }
  }, [])

  const handleIncrementQuestionCount = useCallback(async (): Promise<void> => {
    const id = sessionIdRef.current
    if (id === null) throw new Error('No active session')

    await SessionRepository.incrementQuestionCount(id)
    setCurrentSession((prev) =>
      prev ? { ...prev, questionCount: prev.questionCount + 1 } : prev,
    )
  }, [])

  const handleCloseSession = useCallback(async (): Promise<void> => {
    const id = sessionIdRef.current
    if (id === null) throw new Error('No active session')

    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await SessionRepository.closeSession(id)
      setCurrentSession((prev) =>
        prev ? { ...prev, closedAt: new Date().toISOString() } : prev,
      )
      setState({ sessionId: null, isLoading: false, error: null })
      sessionIdRef.current = null
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to close session')
      setState((prev) => ({ ...prev, isLoading: false, error }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    sessionIdRef.current = null
    setCurrentSession(null)
    setState({ sessionId: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    startSession,
    addEvent,
    incrementQuestionCount: handleIncrementQuestionCount,
    closeSession: handleCloseSession,
    currentSession,
    reset,
  }
}
