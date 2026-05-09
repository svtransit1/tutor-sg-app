import { renderHook, act } from '@testing-library/react-native'
import { useSessionResume } from '../../hooks/useSessionResume'
import { ParentSessionRepository } from '../../storage/parentSessions'

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  })),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useSessionResume', () => {
  it('sets hasInterruptedSession to false when no snapshot found', async () => {
    jest.spyOn(ParentSessionRepository, 'getActiveSnapshot').mockResolvedValue(null)

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.hasInterruptedSession).toBe(false)
    expect(result.current.resumeData).toBeNull()
  })

  it('sets hasInterruptedSession to true when snapshot found', async () => {
    const mockSnapshot = {
      sessionId: 'sess-1',
      screen: 'homework_feedback' as const,
      snapshotData: '{}',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    jest.spyOn(ParentSessionRepository, 'getActiveSnapshot').mockResolvedValue(mockSnapshot)

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.hasInterruptedSession).toBe(true)
    expect(result.current.resumeData).toEqual(mockSnapshot)
  })

  it('dismissResume clears snapshot without ending session', async () => {
    const mockSnapshot = {
      sessionId: 'sess-1',
      screen: 'homework_feedback' as const,
      snapshotData: '{}',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    jest.spyOn(ParentSessionRepository, 'getActiveSnapshot').mockResolvedValue(mockSnapshot)
    jest.spyOn(ParentSessionRepository, 'clearSessionSnapshot').mockResolvedValue()
    jest.spyOn(ParentSessionRepository, 'endSession').mockResolvedValue()

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.dismissResume()
    })

    expect(ParentSessionRepository.clearSessionSnapshot).toHaveBeenCalledWith('sess-1')
    expect(ParentSessionRepository.endSession).not.toHaveBeenCalled()
    expect(result.current.hasInterruptedSession).toBe(false)
  })

  it('endAndDismissResume clears snapshot AND ends session', async () => {
    const mockSnapshot = {
      sessionId: 'sess-1',
      screen: 'homework_feedback' as const,
      snapshotData: '{}',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    jest.spyOn(ParentSessionRepository, 'getActiveSnapshot').mockResolvedValue(mockSnapshot)
    jest.spyOn(ParentSessionRepository, 'clearSessionSnapshot').mockResolvedValue()
    jest.spyOn(ParentSessionRepository, 'endSession').mockResolvedValue()

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.endAndDismissResume()
    })

    expect(ParentSessionRepository.clearSessionSnapshot).toHaveBeenCalledWith('sess-1')
    expect(ParentSessionRepository.endSession).toHaveBeenCalledWith('sess-1', '', false)
    expect(result.current.hasInterruptedSession).toBe(false)
  })

  it('saveSnapshot delegates to repository', async () => {
    jest.spyOn(ParentSessionRepository, 'saveSessionSnapshot').mockResolvedValue()

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await result.current.saveSnapshot('sess-2', 'camera', '{"mock":true}')
    })

    expect(ParentSessionRepository.saveSessionSnapshot).toHaveBeenCalledWith('sess-2', 'camera', '{"mock":true}')
  })

  it('clearSnapshot delegates to repository', async () => {
    jest.spyOn(ParentSessionRepository, 'clearSessionSnapshot').mockResolvedValue()

    const { result } = renderHook(() => useSessionResume())

    await act(async () => {
      await result.current.clearSnapshot('sess-3')
    })

    expect(ParentSessionRepository.clearSessionSnapshot).toHaveBeenCalledWith('sess-3')
  })
})
