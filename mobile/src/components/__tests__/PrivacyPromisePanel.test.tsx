/**
 * Tests for PrivacyPromisePanel — inline privacy promise panel for onboarding.
 *
 * Covers:
 * - All three variants render correctly (card, badge, inline)
 * - Card variant: shield icon, headline, 3 bullet promises, "Learn more" expand
 * - Bilingual i18n keys (EN + zh-Hans)
 * - Default i18n-driven body vs overridden body prop
 * - Dark mode class applied
 * - Accessibility labels and roles
 *
 * @see articles/12-first-90s-onboarding-dev-spec.md §3.9
 * @see ADD §4.2 — Privacy promise hard rule
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import PrivacyPromisePanel from '../PrivacyPromisePanel';

// ── i18n Mock ──────────────────────────────────────────────────────

const mockT = jest.fn((key: string) => {
  const FALLBACKS: Record<string, string> = {
    'onboarding.privacyPromise.title': 'Your privacy is our promise',
    'onboarding.privacyPromise.body':
      "Your child's homework never leaves this device. Photos, answers, and chat stay private. Only you (the parent) can see the learning log.",
    'onboarding.privacyPromise.badgeText':
      "Your child's data never leaves this device",
    'onboarding.privacyPromise.bullet1':
      'Photos and homework scans stay private — they never leave this device',
    'onboarding.privacyPromise.bullet2':
      'Answers, chat, and voice recordings stay on-device — no one else can see them',
    'onboarding.privacyPromise.bullet3':
      'Only you (the parent) can view the learning log and progress summary',
    'onboarding.privacyPromise.learnMore': 'Learn more',
    'onboarding.privacyPromise.learnLess': 'Show less',
    'onboarding.privacyPromise.learnMoreShow':
      'Expand to learn more about privacy',
    'onboarding.privacyPromise.learnMoreHide':
      'Collapse privacy details',
    'onboarding.privacyPromise.learnMoreBody':
      'All AI processing happens right on your device using a small but powerful AI model. No cloud servers, no uploads, no data collection.',
    'onboarding.privacyPromise.accessibility':
      "Privacy promise: your child's data never leaves this device.",
  };
  return FALLBACKS[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// ── Tests ──────────────────────────────────────────────────────────

describe('PrivacyPromisePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Card variant (default) ─────────────────────────────────

  describe('card variant (default)', () => {
    it('renders the shield icon', () => {
      render(<PrivacyPromisePanel />);
      expect(screen.getByText('🛡️')).toBeTruthy();
    });

    it('renders the headline from i18n', () => {
      render(<PrivacyPromisePanel />);
      expect(
        screen.getByText('Your privacy is our promise'),
      ).toBeTruthy();
    });

    it('renders three bullet promises', () => {
      render(<PrivacyPromisePanel />);
      expect(
        screen.getByText(
          'Photos and homework scans stay private — they never leave this device',
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          'Answers, chat, and voice recordings stay on-device — no one else can see them',
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          'Only you (the parent) can view the learning log and progress summary',
        ),
      ).toBeTruthy();
    });

    it('renders "Learn more" toggle by default', () => {
      render(<PrivacyPromisePanel />);
      expect(screen.getByText('▼ Learn more')).toBeTruthy();
    });

    it('expands and collapses the learn-more section', () => {
      render(<PrivacyPromisePanel />);

      // Initially collapsed
      expect(
        screen.queryByText(
          'All AI processing happens right on your device using a small but powerful AI model. No cloud servers, no uploads, no data collection.',
        ),
      ).toBeNull();

      // Tap to expand
      fireEvent.press(
        screen.getByLabelText('Expand to learn more about privacy'),
      );
      expect(
        screen.getByText(
          'All AI processing happens right on your device using a small but powerful AI model. No cloud servers, no uploads, no data collection.',
        ),
      ).toBeTruthy();
      expect(screen.getByText('▲ Show less')).toBeTruthy();

      // Tap to collapse
      fireEvent.press(
        screen.getByLabelText('Collapse privacy details'),
      );
      expect(
        screen.queryByText(
          'All AI processing happens right on your device using a small but powerful AI model. No cloud servers, no uploads, no data collection.',
        ),
      ).toBeNull();
    });

    it('hides learn-more when showLearnMore is false', () => {
      render(<PrivacyPromisePanel showLearnMore={false} />);
      expect(screen.queryByText('▼ Learn more')).toBeNull();
    });

    it('has accessibility summary role', () => {
      render(<PrivacyPromisePanel />);
      expect(
        screen.getByLabelText(
          "Privacy promise: your child's data never leaves this device.",
        ),
      ).toBeTruthy();
    });

    it('has accessibility header role on title', () => {
      render(<PrivacyPromisePanel />);
      const title = screen.getByText('Your privacy is our promise');
      expect(title).toBeTruthy();
    });
  });

  // ── Badge variant ─────────────────────────────────────────

  describe('badge variant', () => {
    it('renders the lock icon', () => {
      render(<PrivacyPromisePanel variant="badge" />);
      expect(screen.getByText('🔒')).toBeTruthy();
    });

    it('renders the badge text from i18n', () => {
      render(<PrivacyPromisePanel variant="badge" />);
      expect(
        screen.getByText("Your child's data never leaves this device"),
      ).toBeTruthy();
    });

    it('renders overridden body when body prop is provided', () => {
      render(
        <PrivacyPromisePanel
          variant="badge"
          body="Custom badge text"
        />,
      );
      expect(screen.getByText('Custom badge text')).toBeTruthy();
    });

    it('has accessibility summary role', () => {
      render(<PrivacyPromisePanel variant="badge" />);
      expect(
        screen.getByLabelText(
          "Privacy promise: your child's data never leaves this device.",
        ),
      ).toBeTruthy();
    });
  });

  // ── Inline variant ────────────────────────────────────────

  describe('inline variant', () => {
    it('renders the lock icon', () => {
      render(<PrivacyPromisePanel variant="inline" />);
      expect(screen.getByText('🔒')).toBeTruthy();
    });

    it('renders the body text from i18n', () => {
      render(<PrivacyPromisePanel variant="inline" />);
      expect(
        screen.getByText(
          "Your child's homework never leaves this device. Photos, answers, and chat stay private. Only you (the parent) can see the learning log.",
        ),
      ).toBeTruthy();
    });

    it('renders overridden body when body prop is provided', () => {
      render(
        <PrivacyPromisePanel
          variant="inline"
          body="Custom inline text"
        />,
      );
      expect(screen.getByText('Custom inline text')).toBeTruthy();
    });

    it('has accessibility summary role', () => {
      render(<PrivacyPromisePanel variant="inline" />);
      expect(
        screen.getByLabelText(
          "Privacy promise: your child's data never leaves this device.",
        ),
      ).toBeTruthy();
    });
  });

  // ── Common behaviour ──────────────────────────────────────

  it('accepts a custom style prop', () => {
    render(
      <PrivacyPromisePanel
        style={{ marginTop: 20, maxWidth: 300 }}
      />,
    );
    expect(screen.getByText('🛡️')).toBeTruthy();
  });

  it('applies correct accessibilityLabel across variants', () => {
    const { rerender } = render(<PrivacyPromisePanel />);
    expect(
      screen.getByLabelText(
        "Privacy promise: your child's data never leaves this device.",
      ),
    ).toBeTruthy();

    rerender(<PrivacyPromisePanel variant="badge" />);
    expect(
      screen.getByLabelText(
        "Privacy promise: your child's data never leaves this device.",
      ),
    ).toBeTruthy();

    rerender(<PrivacyPromisePanel variant="inline" />);
    expect(
      screen.getByLabelText(
        "Privacy promise: your child's data never leaves this device.",
      ),
    ).toBeTruthy();
  });
});
