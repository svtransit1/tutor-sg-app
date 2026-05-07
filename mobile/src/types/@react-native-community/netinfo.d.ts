declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
    type: NetInfoType;
    details: NetInfoDetails | null;
  }
  export type NetInfoType =
    | 'unknown'
    | 'none'
    | 'wifi'
    | 'cellular'
    | 'ethernet'
    | 'other'
    | 'cellular_2g'
    | 'cellular_3g'
    | 'cellular_4g'
    | 'cellular_5g';
  export interface NetInfoDetails {
    isConnectionExpensive?: boolean;
    ssid?: string | null;
    bssid?: string | null;
    strength?: number | null;
    ipAddress?: string | null;
    subnet?: string | null;
    frequency?: number | null;
    cellularGeneration?: string | null;
    carrier?: string | null;
  }
  export const NetInfo: {
    fetch: () => Promise<NetInfoState>;
    addEventListener: (handler: (state: NetInfoState) => void) => () => void;
  };
  export default NetInfo;
}