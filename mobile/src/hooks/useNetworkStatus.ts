import { useEffect, useState, useCallback } from 'react';
import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';

export type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';

export interface NetworkStatus {
  /** Whether the device has an active network connection. */
  isConnected: boolean;
  /** Whether the internet is reachable (may be false on metered cellular with no data). */
  isInternetReachable: boolean | null;
  /** The type of connection. */
  type: NetworkType;
}

const initialState: NetworkStatus = {
  isConnected: true,
  isInternetReachable: null,
  type: 'unknown',
};

function mapType(state: NetInfoState): NetworkType {
  if (state.isConnected === false) return 'none';
  if (state.type === 'wifi' || state.type === 'ethernet') return 'wifi';
  if (
    state.type === 'cellular' ||
    state.type === 'cellular_2g' ||
    state.type === 'cellular_3g' ||
    state.type === 'cellular_4g' ||
    state.type === 'cellular_5g'
  )
    return 'cellular';
  return state.type as NetworkType;
}

/**
 * A hook that tracks device network status in real-time.
 *
 * @returns {NetworkStatus} Current network connectivity state.
 *
 * @example
 * ```tsx
 * const { isConnected, type } = useNetworkStatus();
 * if (!isConnected) { /* show offline UI *\/ }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(initialState);

  const handleChange = useCallback((netState: NetInfoState) => {
    setStatus({
      isConnected: netState.isConnected ?? false,
      isInternetReachable: netState.isInternetReachable ?? null,
      type: mapType(netState),
    });
  }, []);

  useEffect(() => {
    // Fetch initial state
    NetInfo.fetch().then(handleChange).catch(() => {
      // If NetInfo fails, assume connected (degraded experience)
      setStatus({ isConnected: true, isInternetReachable: null, type: 'unknown' });
    });

    // Subscribe to changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(handleChange);

    return () => {
      unsubscribe();
    };
  }, [handleChange]);

  return status;
}
