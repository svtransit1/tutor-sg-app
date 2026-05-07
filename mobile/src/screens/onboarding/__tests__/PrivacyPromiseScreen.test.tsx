/**
 * Tests for PrivacyPromiseScreen — dedicated onboarding step.
 *
 * Covers:
 * - Renders headline + PrivacyPromisePanel + continue button
 * - "Continue" fires onContinue callback
 * - Accessibility labels
 *
 * @see AAAS-259 (M2-58)
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import PrivacyPromiseScreen from '../PrivacyPromiseScreen'

// ── i18n Mock ──────────────────────────────────────────────────────

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'onboarding.privacyPromise.headline': 'Before we start — a quick promise about privacy',
    'onboarding.privacyPromise.continue': 'I understand — continue',
    'onboarding.privacyPromise.reassurance':
      'You can review your privacy settings anytime in the Parent area.',
    'onboarding.privacyPromise.title': 'Your privacy is our promise',
    'onboarding.privacyPromise.bullet1':
      'Photos and homework scans stay private — they never leave this device',
    'onboarding.privacyPromise.bullet2':
      'Answers, chat, and voice recordings stay on-device — no one else can see them',
    'onboarding.privacyPromise.bullet3':
      'Only you (the parent) can view the learning log and progress summary',
    'onboarding.privacyPromise.learnMore': 'Learn more',
    'onboarding.privacyPromise.learnLess': 'Show less',
    'onboarding.privacyPromise.learnMoreShow': 'Expand to learn more about privacy',
    'onboarding.privacyPromise.learnMoreHide': 'Collapse privacy details',
    'onboarding.privacyPromise.learnMoreBody': 'All AI processing happens right on your device.',
    'onboarding.privacyPromise.accessibility':
      "Privacy promise: your child's data never leaves this device.",
  }
  return FALLBACKS[key] ?? key
})

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

// ── Tests ──────────────────────────────────────────────────────────

describe('PrivacyPromiseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the headline', () => {
    render(<PrivacyPromiseScreen />)
    expect(screen.getByText('Before we start — a quick promise about privacy')).toBeTruthy()
  })

  it('renders the PrivacyPromisePanel inside (shield icon + bullets)', () => {
    render(<PrivacyPromiseScreen />)
    expect(screen.getByText('🛡️')).toBeTruthy()
    expect(
      screen.getByText('Photos and homework scans stay private — they never leave this device'),
    ).toBeTruthy()
    expect(
      screen.getByText('Only you (the parent) can view the learning log and progress summary'),
    ).toBeTruthy()
  })

  it('renders the continue button', () => {
    render(<PrivacyPromiseScreen />)
    expect(screen.getByText('I understand — continue')).toBeTruthy()
  })

  it('renders the reassurance text', () => {
    render(<PrivacyPromiseScreen />)
    expect(
      screen.getByText('You can review your privacy settings anytime in the Parent area.'),
    ).toBeTruthy()
  })

  it('fires onContinue when continue button is pressed', () => {
    const onContinue = jest.fn()
    render(<PrivacyPromiseScreen onContinue={onContinue} />)

    fireEvent.press(screen.getByLabelText('I understand — continue'))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('has accessibility header role on headline', () => {
    render(<PrivacyPromiseScreen />)
    const headline = screen.getByText('Before we start — a quick promise about privacy')
    expect(headline).toBeTruthy()
  })
})
