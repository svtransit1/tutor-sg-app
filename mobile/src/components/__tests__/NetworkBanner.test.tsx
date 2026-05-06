import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NetworkBanner } from '@/components/NetworkBanner';
import { mockNetInfo } from '@react-native-community/netinfo';

// Mock the i18next useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
    ready: true,
  }),
}));

describe('NetworkBanner', () => {
  beforeEach(() => {
    mockNetInfo.reset();
    jest.clearAllMocks();
  });

  it('renders nothing when on Wi-Fi', async () => {
    mockNetInfo.setNetworkState({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });

    const { queryByText } = render(<NetworkBanner />);

    await waitFor(() => {
      expect(queryByText('network.offline')).toBeNull();
      expect(queryByText('network.cellular')).toBeNull();
    });
  });

  it('shows offline banner when disconnected', async () => {
    mockNetInfo.setNetworkState({
      type: 'none',
      isConnected: false,
      isInternetReachable: false,
    });

    const { findByText } = render(<NetworkBanner />);

    expect(await findByText('network.offline')).toBeTruthy();
    expect(await findByText('network.offline.description')).toBeTruthy();
  });

  it('shows cellular banner when on cellular data', async () => {
    mockNetInfo.setNetworkState({
      type: 'cellular',
      isConnected: true,
      isInternetReachable: true,
    });

    const { findByText } = render(<NetworkBanner />);

    expect(await findByText('network.cellular')).toBeTruthy();
    expect(await findByText('network.cellular.description')).toBeTruthy();
  });
});
