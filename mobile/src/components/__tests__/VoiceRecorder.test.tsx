import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react-native'
import VoiceRecorder from '../VoiceRecorder'

describe('VoiceRecorder', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders mic button', () => {
    render(<VoiceRecorder />)
    expect(screen.getByText('🎤')).toBeTruthy()
  })

  it('does not call onStateChange on mount', () => {
    const onStateChange = jest.fn()
    render(<VoiceRecorder onStateChange={onStateChange} />)
    expect(onStateChange).not.toHaveBeenCalled()
  })

  it('calls onStateChange for each state transition', () => {
    const onStateChange = jest.fn()
    render(
      <VoiceRecorder
        onStateChange={onStateChange}
        recordingDuration={3000}
        processingDuration={100}
      />,
    )
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('🎤'))
    expect(onStateChange).toHaveBeenCalledWith('recording')
    expect(onStateChange).toHaveBeenCalledTimes(1)

    fireEvent.press(screen.getByText('⏹'))
    expect(onStateChange).toHaveBeenCalledWith('processing')
    expect(onStateChange).toHaveBeenCalledTimes(2)

    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(onStateChange).toHaveBeenCalledWith('error')
    expect(onStateChange).toHaveBeenCalledTimes(3)
  })

  it('auto-stops recording after recordingDuration', () => {
    const onStateChange = jest.fn()
    render(
      <VoiceRecorder
        onStateChange={onStateChange}
        recordingDuration={3000}
        processingDuration={100}
      />,
    )
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('🎤'))
    expect(onStateChange).toHaveBeenCalledWith('recording')
    expect(onStateChange).toHaveBeenCalledTimes(1)
    onStateChange.mockClear()

    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(onStateChange).toHaveBeenCalledWith('processing')
    expect(onStateChange).toHaveBeenCalledTimes(1)
  })

  it('shows processing state when recording stops', () => {
    render(<VoiceRecorder />)

    fireEvent.press(screen.getByText('🎤'))
    expect(screen.getByText('⏹')).toBeTruthy()

    fireEvent.press(screen.getByText('⏹'))
    expect(screen.getByText('⏳')).toBeTruthy()
  })

  it('shows error state after processing timeout', () => {
    render(<VoiceRecorder processingDuration={1500} />)

    fireEvent.press(screen.getByText('🎤'))
    fireEvent.press(screen.getByText('⏹'))

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(screen.getByText('Retry')).toBeTruthy()
  })

  it('calls onError when processing times out', () => {
    const onError = jest.fn()
    render(<VoiceRecorder onError={onError} processingDuration={1500} />)

    fireEvent.press(screen.getByText('🎤'))
    fireEvent.press(screen.getByText('⏹'))

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('processing'),
      }),
    )
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('returns to recording state on retry after error', () => {
    render(<VoiceRecorder processingDuration={100} />)

    fireEvent.press(screen.getByText('🎤'))
    fireEvent.press(screen.getByText('⏹'))

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(screen.getByText('Retry')).toBeTruthy()

    fireEvent.press(screen.getByText('Retry'))
    expect(screen.getByText('⏹')).toBeTruthy()
  })

  it('does not double-fire onStateChange("processing") after manual stop', () => {
    const onStateChange = jest.fn()
    render(
      <VoiceRecorder
        onStateChange={onStateChange}
        recordingDuration={3000}
        processingDuration={100}
      />,
    )
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('🎤'))
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('⏹'))
    const processingCalls = onStateChange.mock.calls.filter(
      ([state]) => state === 'processing',
    )
    expect(processingCalls).toHaveLength(1)
  })

  it('does not double-fire onStateChange("processing") after auto-stop', () => {
    const onStateChange = jest.fn()
    render(
      <VoiceRecorder
        onStateChange={onStateChange}
        recordingDuration={3000}
        processingDuration={100}
      />,
    )
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('🎤'))
    onStateChange.mockClear()

    act(() => {
      jest.advanceTimersByTime(3000)
    })
    const processingCalls = onStateChange.mock.calls.filter(
      ([state]) => state === 'processing',
    )
    expect(processingCalls).toHaveLength(1)
  })

  it('disables mic button during processing', () => {
    render(<VoiceRecorder />)

    fireEvent.press(screen.getByText('🎤'))
    fireEvent.press(screen.getByText('⏹'))

    const micButton = screen.getByText('🎤')
    expect(micButton).toBeTruthy()
  })

  it('has accessibility labels', () => {
    render(<VoiceRecorder />)

    expect(
      screen.getByLabelText('Record a voice question'),
    ).toBeTruthy()
  })

  it('shows stop button accessibility label during recording', () => {
    render(<VoiceRecorder />)

    fireEvent.press(screen.getByText('🎤'))

    expect(
      screen.getByLabelText('homeworkFeedback.accessibility.stopRecording'),
    ).toBeTruthy()
  })

  it('calls onStateChange on retry after error', () => {
    const onStateChange = jest.fn()
    render(
      <VoiceRecorder
        onStateChange={onStateChange}
        processingDuration={100}
      />,
    )
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('🎤'))
    fireEvent.press(screen.getByText('⏹'))

    act(() => {
      jest.advanceTimersByTime(100)
    })
    onStateChange.mockClear()

    fireEvent.press(screen.getByText('Retry'))
    expect(onStateChange).toHaveBeenCalledWith('recording')
    expect(onStateChange).toHaveBeenCalledTimes(1)
  })
})
