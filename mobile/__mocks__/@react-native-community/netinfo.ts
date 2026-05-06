/**
 * Jest mock for @react-native-community/netinfo.
 *
 * Provides controllable NetInfo state for tests.
 * Import and use `mockNetInfo.setNetworkState(...)` to simulate
 * different connectivity conditions.
 */

type NetInfoStateType =
  | 'unknown'
  | 'none'
  | 'wifi'
  | 'cellular'
  | 'cellular_2g'
  | 'cellular_3g'
  | 'cellular_4g'
  | 'cellular_5g'
  | 'ethernet'
  | 'vpn'
  | 'other';

interface NetInfoState {
  type: NetInfoStateType;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  details: Record<string, unknown> | null;
}

type NetInfoSubscription = () => void;

type NetInfoChangeHandler = (state: NetInfoState) => void;

let currentState: NetInfoState = {
  type: 'wifi',
  isConnected: true,
  isInternetReachable: true,
  details: null,
};

const listeners: Set<NetInfoChangeHandler> = new Set();

function notifyListeners(): void {
  const state = { ...currentState };
  listeners.forEach((listener) => listener(state));
}

const NetInfo = {
  fetch: jest.fn<Promise<NetInfoState>, []>().mockResolvedValue({ ...currentState }),
  addEventListener: jest
    .fn<(handler: NetInfoChangeHandler) => NetInfoSubscription, [NetInfoChangeHandler]>()
    .mockImplementation((handler: NetInfoChangeHandler) => {
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
      };
    }),
  /** @deprecated Use `mockNetInfo.setNetworkState` instead. */
  refresh: jest.fn<Promise<NetInfoState>, []>().mockResolvedValue({ ...currentState }),
};

/**
 * Helper to set NetInfo state from tests.
 * Automatically notifies all listeners.
 */
export const mockNetInfo = {
  setNetworkState(overrides: Partial<NetInfoState>): void {
    currentState = { ...currentState, ...overrides };
    // Update fetch mock
    NetInfo.fetch = jest.fn<Promise<NetInfoState>, []>().mockResolvedValue({ ...currentState });
    notifyListeners();
  },
  reset(): void {
    currentState = {
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
      details: null,
    };
    NetInfo.fetch = jest.fn<Promise<NetInfoState>, []>().mockResolvedValue({ ...currentState });
    listeners.clear();
  },
};

/** Called by setup-jest.ts beforeEach */
export function __resetNetInfo() {
  mockNetInfo.reset();
}

export type { NetInfoState, NetInfoStateType, NetInfoSubscription };

export default NetInfo;
