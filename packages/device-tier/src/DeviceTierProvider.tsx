import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { assignTier, buildCapabilities } from './detect';
import { BelowFloorModal } from './components/BelowFloorModal';
import type { DeviceTier, DeviceCapabilities, DeviceTierPersistence } from './types';

export interface DeviceTierContextValue {
  tier: DeviceTier;
  capabilities: DeviceCapabilities;
  belowFloor: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface DeviceTierProviderProps {
  children: React.ReactNode;
  detectInfo?: () => Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }>;
  language?: 'en' | 'zh-Hans';
  persistence?: DeviceTierPersistence;
}

const DeviceTierContext = createContext<DeviceTierContextValue | null>(null);

async function detectDeviceInfo(): Promise<{ totalRAM: number; chipset: string; npuAvailable: boolean }> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    totalRAM: Platform.OS === 'ios' ? 8 : 4,
    chipset: Platform.OS === 'ios' ? 'A17' : 'SDM778G',
    npuAvailable: true,
  };
}

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Checking device compatibility...</Text>
    </View>
  );
}

export function DeviceTierProvider({
  children,
  detectInfo,
  language,
  persistence,
}: DeviceTierProviderProps) {
  const [tier, setTier] = useState<DeviceTier>('mid');
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    tier: 'mid', ramGB: 4, chipset: '', npuAvailable: false, belowFloor: false,
  });
  const [belowFloor, setBelowFloor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detector = detectInfo ?? detectDeviceInfo;
      const info = await detector();
      if (!mounted.current) return;

      const { tier: detectedTier, belowFloor: isBelow } = assignTier(info);
      const caps = buildCapabilities(info);

      setTier(detectedTier);
      setCapabilities(caps);
      setBelowFloor(isBelow);

      if (persistence) {
        await persistence.set(caps);
      }
    } catch (err) {
      if (!mounted.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setTier('mid');
      setBelowFloor(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [detectInfo, persistence]);

  useEffect(() => {
    async function bootstrap() {
      if (persistence) {
        const cached = await persistence.get();
        if (cached && mounted.current) {
          setTier(cached.tier);
          setCapabilities(cached);
          setBelowFloor(cached.belowFloor);
          setLoading(false);
          return;
        }
      }
      await detect();
    }
    bootstrap();
    return () => { mounted.current = false; };
  }, [detect, persistence]);

  const value = useMemo<DeviceTierContextValue>(
    () => ({ tier, capabilities, belowFloor, loading, error, refresh: detect }),
    [tier, capabilities, belowFloor, loading, error, detect],
  );

  if (loading) return <LoadingFallback />;

  if (belowFloor) {
    return (
      <DeviceTierContext.Provider value={value}>
        <BelowFloorModal visible language={language} />
      </DeviceTierContext.Provider>
    );
  }

  return (
    <DeviceTierContext.Provider value={value}>
      {children}
    </DeviceTierContext.Provider>
  );
}

export function useDeviceTier(): DeviceTierContextValue {
  const ctx = useContext(DeviceTierContext);
  if (!ctx) throw new Error('useDeviceTier must be used within a DeviceTierProvider');
  return ctx;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
});
