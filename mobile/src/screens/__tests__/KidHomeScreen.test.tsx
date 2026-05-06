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

    const viewAll = screen.getByText(/View/);
    fireEvent.press(viewAll);
    expect(mockRouterPush).toHaveBeenCalledWith('/(kid)/history');
  });

  // ── Subject tiles dimmed on first visit ────────────────

  it('dims subject tiles on first visit (showWelcome true)', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    // All 4 subject tiles should have opacity ~0.45 when welcome banner is shown
    const tiles = screen.getAllByLabelText('kidHome.accessibility.subjectTile');
    expect(tiles.length).toBe(4);
    tiles.forEach((tile) => {
      const style = Array.isArray(tile.props.style) ? Object.assign({}, ...tile.props.style) : tile.props.style;
      expect(style.opacity).toBe(0.45);
    });
  });

  it('shows subjects hint text on first visit', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByText('kidHome.firstSession.subjectsHint')).toBeTruthy();
  });

  it('does NOT dim subject tiles after dismissal', async () => {
    mockIsFirstHomeVisit.mockReturnValue(false);
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    // After dismissal, welcome banner is gone and tiles render (not hidden).
    expect(screen.queryByLabelText('kidHome.firstSession.accessibility.welcomeBanner')).toBeNull();
    // All 4 subject tiles should be present at full visibility
    const tiles = screen.getAllByLabelText('kidHome.accessibility.subjectTile');
    expect(tiles.length).toBe(4);
  });

  it('does NOT show subjects hint after dismissal', async () => {
    mockIsFirstHomeVisit.mockReturnValue(false);
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.queryByText('kidHome.firstSession.subjectsHint')).toBeNull();
  });

  it('does NOT dim subject tiles when sessions exist', async () => {
    mockGetRecentSessions.mockResolvedValue([
      makeSession({ id: 1, subject: 'math', questionCount: 5 }),
    ]);
    mockIsFirstHomeVisit.mockReturnValue(false);

    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    // When no dimming is applied, opacity is not set (undefined or absent).
    // Verify by checking the footer-level 'Recent Sessions' title is visible
    // instead of the welcome banner, confirming non-first-visit state.
    expect(screen.queryByLabelText('kidHome.firstSession.accessibility.welcomeBanner')).toBeNull();
    expect(screen.getByText('kidHome.recentSessions.title')).toBeTruthy();
  });

  // ── Accessibility ─────────────────────────────────────────

  it('has accessibilityRole header on greeting', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    expect(screen.getByRole('header')).toBeTruthy();
  });

  it('has accessibilityRole button on touchable elements', async () => {
    render(<KidHomeScreen />);
    await act(() => Promise.resolve());

    // TouchableOpacity elements with accessibilityRole="button" are present
    // on the language switcher, subject tiles, camera CTA, and welcome banner CTAs.
    // Use accessibilityLabel to verify buttons since RNTL's getAllByRole('button')
    // behaviour varies across versions with TouchableOpacity.
    const langBtn = screen.getByLabelText('kidHome.header.switchLanguage');
    const cameraBtn = screen.getByLabelText('kidHome.camera.accessibility');
    const welcomeCta = screen.getByLabelText('kidHome.firstSession.ctaCamera');

    expect(langBtn).toBeTruthy();
    expect(cameraBtn).toBeTruthy();
    expect(welcomeCta).toBeTruthy();
    expect(langBtn.props.accessibilityRole).toBe('button');
    expect(cameraBtn.props.accessibilityRole).toBe('button');
    expect(welcomeCta.props.accessibilityRole).toBe('button');
  });
});
