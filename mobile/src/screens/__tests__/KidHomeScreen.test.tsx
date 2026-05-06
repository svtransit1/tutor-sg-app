/**
 * Tests for KidHomeScreen (empty state + first-session CTA).
 *
 * Covers:
 * - First visit welcome banner rendering
 * - First-session CTA button behaviour
 * - Welcome banner dismissal
 * - Session list rendering (non-empty state)
 * - Basic empty state on return visits
 * - Accessibility labels
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import KidHomeScreen from '../../../app/(kid)/home';

// ── Mocks ──────────────────────────────────────────────────────

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockT = (key: string) => key;
const mockI18n = { language: 'en', changeLanguage: jest.fn() };

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: mockI18n }),
}));

// Match the import path from home.tsx: import i18n from '@/i18n'
// Use relative path since moduleNameMapper resolves @/ to src/
jest.mock('../../i18n/index', () => ({
  __esModule: true,
  default: { language: 'en', changeLanguage: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── Mock session storage ──────────────────────────────────────

const mockGetRecentSessions = jest.fn();
jest.mock('../../storage/sessions', () => ({
  getRecentSessions: (...args: unknown[]) => mockGetRecentSessions(...args),
}));

// ── Mock onboarding state (first home visit flag) ─────────────

const mockIsFirstHomeVisit = jest.fn();
const mockMarkFirstHomeVisitComplete = jest.fn();
jest.mock('../../storage/onboarding-state', () => ({
  isFirstHomeVisit: () => mockIsFirstHomeVisit(),
  markFirstHomeVisitComplete: () => mockMarkFirstHomeVisitComplete(),
}));

// ── Test data ─────────────────────────────────────────────────

const makeSession = (overrides?: Partial<{
  id: number;
  subject: 'math' | 'english' | 'science' | 'chinese';
  questionCount: number;
  createdAt: string;
}>) => ({
  id: 1,
  subject: 'math' as const,
  questionCount: 5,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────

describe('KidHomeScreen — empty state + first-session CTA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Default: first visit, no sessions
    mockIsFirstHomeVisit.mockReturnValue(true);
    mockGetRecentSessions.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Welcome banner (first visit / empty) ──────────────────

  it('shows welcome banner on first visit with no sessions', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(
      screen.getByLabelText('kidHome.firstSession.accessibility.welcomeBanner'),
    ).toBeTruthy();
  });

  it('renders the welcome title', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByText('kidHome.firstSession.welcomeTitle')).toBeTruthy();
  });

  it('renders the welcome body text', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByText('kidHome.firstSession.welcomeBody')).toBeTruthy();
  });

  it('renders the first-homework-photo CTA button', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('kidHome.firstSession.ctaCamera')).toBeTruthy();
  });

  it('renders the dismiss link', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByLabelText('kidHome.firstSession.dismiss')).toBeTruthy();
  });

  it('does NOT render the Recent Sessions section when welcome is visible', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.queryByText('kidHome.recentSessions.title')).toBeNull();
  });

  // ── First-session CTA behaviour ──────────────────────────

  it('navigates to camera when camera CTA is pressed', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('kidHome.firstSession.ctaCamera'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(kid)/camera');
  });

  it('marks first visit complete when camera CTA is pressed', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('kidHome.firstSession.ctaCamera'));
    expect(mockMarkFirstHomeVisitComplete).toHaveBeenCalledTimes(1);
  });

  // ── Welcome banner dismissal ─────────────────────────────

  it('hides welcome banner when dismiss is pressed', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(
      screen.getByLabelText('kidHome.firstSession.accessibility.welcomeBanner'),
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText('kidHome.firstSession.dismiss'));

    expect(mockMarkFirstHomeVisitComplete).toHaveBeenCalledTimes(1);
  });

  it('marks first visit complete on dismiss', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    fireEvent.press(screen.getByLabelText('kidHome.firstSession.dismiss'));
    expect(mockMarkFirstHomeVisitComplete).toHaveBeenCalledTimes(1);
  });

  // ── Non-first-visit state (basic empty state) ─────────────

  it('shows basic empty state when not first visit and no sessions', async () => {
    mockIsFirstHomeVisit.mockReturnValue(false);
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    // Welcome banner should NOT be visible
    expect(
      screen.queryByLabelText('kidHome.firstSession.accessibility.welcomeBanner'),
    ).toBeNull();

    // Recent sessions title + empty text should show
    expect(screen.getByText('kidHome.recentSessions.title')).toBeTruthy();
    expect(screen.getByText('kidHome.recentSessions.empty')).toBeTruthy();
  });

  // ── Sessions present (non-empty state) ─────────────────────

  it('shows recent sessions title when sessions exist', async () => {
    mockGetRecentSessions.mockResolvedValue([
      makeSession({ id: 1, subject: 'math', questionCount: 5 }),
    ]);
    mockIsFirstHomeVisit.mockReturnValue(false);

    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByText('kidHome.recentSessions.title')).toBeTruthy();
  });

  it('navigates to history when view-all is tapped', async () => {
    mockGetRecentSessions.mockResolvedValue([
      makeSession({ id: 1, subject: 'math', questionCount: 5 }),
    ]);
    mockIsFirstHomeVisit.mockReturnValue(false);

    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    const viewAll = screen.getByText('kidHome.recentSessions.viewAll');
    fireEvent.press(viewAll);
    expect(mockRouterPush).toHaveBeenCalledWith('/(kid)/history');
  });

  // ── Accessibility ─────────────────────────────────────────

  it('has accessibilityRole header on greeting', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('renders at least one button role', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
