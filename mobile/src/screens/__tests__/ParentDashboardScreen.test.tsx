import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
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
const mockRouterPush = router.push as jest.Mock;

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
      expect(screen.getByText('parent.dashboard.empty.title')).toBeTruthy();
    });
    expect(screen.getByText('parent.dashboard.empty.description')).toBeTruthy();
    expect(screen.getByText('parent.dashboard.empty.cta')).toBeTruthy();
  });

  it('renders empty state when kid profile exists but no sessions', async () => {
    mockGetProfiles.mockResolvedValue([{ id: 'kid-1', name: 'Test', level: 'P3', avatarKey: 'a', createdAt: 'now', isActive: true }]);
    mockGetSessionsForKid.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('parent.dashboard.empty.title')).toBeTruthy();
    });
  });

  it('renders empty state when children exist but DB throws', async () => {
    mockGetProfiles.mockRejectedValue(new Error('DB error'));
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('parent.dashboard.empty.title')).toBeTruthy();
    });
  });

  it('renders secondary navigation buttons in empty state', async () => {
    mockGetProfiles.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('parent.dashboard.empty.cta')).toBeTruthy();
    });
    expect(screen.getByText('parent.changePin')).toBeTruthy();
    expect(screen.getByText('parent.backToKid')).toBeTruthy();
  });

  it('CTA button navigates back to kid area', async () => {
    mockGetProfiles.mockResolvedValue([]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      screen.getByText('parent.dashboard.empty.cta').props.onPress();
    });
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });
});

describe('ParentDashboardScreen — has sessions', () => {
  it('renders dashboard title when sessions exist', async () => {
    mockGetProfiles.mockResolvedValue([{ id: 'kid-1', name: 'Test', level: 'P3', avatarKey: 'a', createdAt: 'now', isActive: true }]);
    mockGetSessionsForKid.mockResolvedValue([{ id: 'sess-1' }]);
    render(<ParentDashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('parent.dashboard.title')).toBeTruthy();
    });
  });
});
