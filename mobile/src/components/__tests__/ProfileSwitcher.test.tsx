import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ProfileSwitcher from '../ProfileSwitcher';
import { KidProfileRepository } from '@/storage/kidProfiles';
import type { KidProfile } from '@/storage/kidProfiles';

jest.mock('@/storage/kidProfiles');

const MOCK_PROFILES: KidProfile[] = [
  { id: '1', name: 'Alice', level: 'P5', avatarKey: 'cat', createdAt: '2026-01-01', isActive: false },
  { id: '2', name: 'Bob', level: 'P3', avatarKey: 'dog', createdAt: '2026-01-02', isActive: true },
];

const MOCK_ACTIVE: KidProfile = {
  id: '2', name: 'Bob', level: 'P3', avatarKey: 'dog', createdAt: '2026-01-02', isActive: true,
};

async function waitForLoading() {
  await act(async () => {});
  await act(async () => {});
}

describe('ProfileSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (KidProfileRepository.getProfiles as jest.Mock).mockResolvedValue(MOCK_PROFILES);
    (KidProfileRepository.getActiveKid as jest.Mock).mockResolvedValue(MOCK_ACTIVE);
    (KidProfileRepository.setActiveKid as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders loading state initially', () => {
    (KidProfileRepository.getProfiles as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );
    render(<ProfileSwitcher />);
    expect(screen.getByText('parent.profileSwitcher.loading')).toBeTruthy();
  });

  it('renders active profile after loading', async () => {
    render(<ProfileSwitcher />);
    await waitForLoading();
    expect(screen.getByText('parent.profileSwitcher.label')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('P3')).toBeTruthy();
  });

  it('renders nothing when no profiles exist', async () => {
    (KidProfileRepository.getProfiles as jest.Mock).mockResolvedValue([]);
    (KidProfileRepository.getActiveKid as jest.Mock).mockResolvedValue(null);
    const { UNSAFE_root } = render(<ProfileSwitcher />);
    await waitForLoading();
    expect(UNSAFE_root.children.length).toBe(0);
  });

  it('renders error state on failure and retries', async () => {
    (KidProfileRepository.getProfiles as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );
    render(<ProfileSwitcher />);
    await waitForLoading();
    expect(screen.getByText('parent.profileSwitcher.error')).toBeTruthy();
    expect(screen.getByText('common.retry')).toBeTruthy();

    (KidProfileRepository.getProfiles as jest.Mock).mockResolvedValue(MOCK_PROFILES);
    (KidProfileRepository.getActiveKid as jest.Mock).mockResolvedValue(MOCK_ACTIVE);
    fireEvent.press(screen.getByText('common.retry'));
    await waitForLoading();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('expands dropdown on trigger press', async () => {
    render(<ProfileSwitcher />);
    await waitForLoading();

    act(() => {
      fireEvent.press(screen.getByText('▼'));
    });

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('P5')).toBeTruthy();
  });

  it('switches profile when a different kid is tapped', async () => {
    const onChange = jest.fn();
    render(<ProfileSwitcher onProfileChange={onChange} />);
    await waitForLoading();

    act(() => {
      fireEvent.press(screen.getByText('▼'));
    });

    await act(async () => {});
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('sets active kid when switching', async () => {
    render(<ProfileSwitcher />);
    await waitForLoading();

    act(() => { fireEvent.press(screen.getByText('▼')); });
    await act(async () => {});

    act(() => { fireEvent.press(screen.getByText('Alice')); });
    await act(async () => {});
    await act(async () => {});

    expect(KidProfileRepository.setActiveKid).toHaveBeenCalledWith('1');
  });

  it('calls onProfileChange when switching', async () => {
    const onChange = jest.fn();
    render(<ProfileSwitcher onProfileChange={onChange} />);
    await waitForLoading();

    act(() => { fireEvent.press(screen.getByText('▼')); });
    await act(async () => {});

    act(() => { fireEvent.press(screen.getByText('Alice')); });
    await act(async () => {});
    await act(async () => {});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(MOCK_PROFILES[0]);
  });
});
