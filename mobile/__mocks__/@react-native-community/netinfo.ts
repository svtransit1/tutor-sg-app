import type { NetInfoState } from '@react-native-community/netinfo';

export const NetInfo: {
  fetch: () => Promise<NetInfoState>;
  addEventListener: (handler: (state: NetInfoState) => void) => () => void;
} = {
  fetch: () =>
    Promise.resolve({
      isConnected: true,
      type: 'wifi',
      details: { isConnectionExpensive: false },
    } as NetInfoState),
  addEventListener: () => () => {},
};

export default NetInfo;