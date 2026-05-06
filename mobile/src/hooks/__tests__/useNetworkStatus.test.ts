import { renderHook, act } from '@testing-library/react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';
import { mockNetInfo } from '@react-native-community/netinfo';

// Re-export mockNetInfo for convenience
export { mockNetInfo } from '@react-native-community/netinfo';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    mockNetInfo.reset();
    jest.clearAllMocks();
  });

  it('returns the initial state from NetInfo.fetch', async () => {
    mockNetInfo.setNetworkState({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Wait for the fetch promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.type).toBe('wifi');
  });

  it('detects offline state', async () => {
    mockNetInfo.setNetworkState({
      type: 'none',
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('none');
  });

  it('detects cellular state', async () => {
    mockNetInfo.setNetworkState({
      type: 'cellular',
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.type).toBe('cellular');
    expect(result.current.isConnected).toBe(true);
  });

  it('updates state when network changes', async () => {
    // Start on wifi
    mockNetInfo.setNetworkState({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.type).toBe('wifi');

    // Simulate going offline
    await act(async () => {
      mockNetInfo.setNetworkState({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.type).toBe('none');
  });

  it('maps cellular subtypes correctly', async () => {
    mockNetInfo.setNetworkState({
      type: 'cellular_4g',
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.type).toBe('cellular');
  });

  it('handles fetch errors gracefully', async () => {
    // Make fetch reject
    jest.spyOn(NetInfo, 'fetch').mockRejectedValueOnce(new Error('NetInfo error'));

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    // Should fall back to connected/unknown
    expect(result.current.isConnected).toBe(true);
    expect(result.current.type).toBe('unknown');
  });
});
