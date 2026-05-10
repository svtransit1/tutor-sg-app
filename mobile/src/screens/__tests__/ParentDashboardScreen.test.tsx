import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import ParentDashboardScreen from '../../../app/(parent)/index';
import { KidProfileRepository } from '@/storage/kidProfiles';
import { ParentSessionRepository } from '@/storage/parentSessions';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock('@/storage/kidProfiles', () => ({
  KidProfileRepository: { getProfiles: jest.fn() },
}));

jest.mock('@/storage/parentSessions', () => ({
  ParentSessionRepository: { getSessionsForKid: jest.fn() },
}));

const mockGetProfiles = KidProfileRepository.getProfiles as jest.Mock;
const mockGetSessionsForKid = ParentSessionRepository.getSessionsForKid as jest.Mock;
const mockRouterBack = router.back as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ParentDashboardScreen — empty state', () => {
  it('shows spinner while loading', () => {
    mockGetProfiles.mockReturnValue(new Promise(() => {}));
    render(<ParentDashboardScreen />);
    expect(screen.getByLabelText('tutor-sg — loading...')).toBeTruthy();
  });

  it('renders empty state when no kid profiles exist', async () => {
    mockGetProfiles.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('No learning sessions yet')).toBeTruthy();
    });
    expect(screen.getByText("Your child's homework help sessions will appear here once they start using the app.")).toBeTruthy();
    expect(screen.getByText("Go to Kid's App")).toBeTruthy();
  });

  it('renders empty state when kid profile exists but no sessions', async () => {
    mockGetProfiles.mockResolvedValue([{ id: 'kid-1', name: 'Test', level: 'P3', avatarKey: 'a', createdAt: 'now', isActive: true }]);
    mockGetSessionsForKid.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('No learning sessions yet')).toBeTruthy();
    });
  });

  it('renders empty state when DB throws', async () => {
    mockGetProfiles.mockRejectedValue(new Error('DB error'));
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('No learning sessions yet')).toBeTruthy();
    });
  });

  it('renders secondary navigation buttons in empty state', async () => {
    mockGetProfiles.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText("Go to Kid's App")).toBeTruthy();
    });
    expect(screen.getByText('Change PIN')).toBeTruthy();
    expect(screen.getByText('Back to Kid Area')).toBeTruthy();
  });

  it('CTA button navigates back to kid area', async () => {
    mockGetProfiles.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText("Go to Kid's App")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("Go to Kid's App"));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});

describe('ParentDashboardScreen — has sessions', () => {
  it('renders dashboard title when sessions exist', async () => {
    mockGetProfiles.mockResolvedValue([{ id: 'kid-1', name: 'Test', level: 'P3', avatarKey: 'a', createdAt: 'now', isActive: true }]);
    mockGetSessionsForKid.mockResolvedValue([{ id: 'sess-1' }]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('Parent Dashboard')).toBeTruthy();
    });
  });
});
