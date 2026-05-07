import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  __setMockPermissionState,
  __resetMockPermissionState,
} from 'expo-camera';
import { useCameraPermissions } from '../useCameraPermissions';

describe('useCameraPermissions', () => {
  beforeEach(() => {
    __resetMockPermissionState();
  });

  it('starts as granted when permission is granted', () => {
    __setMockPermissionState(true, true, 'granted');
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permission).toBe('granted');
    expect(result.current.isRequesting).toBe(false);
  });

  it('returns denied when permission is undetermined', () => {
    __setMockPermissionState(false, true, 'undetermined');
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permission).toBe('denied');
  });

  it('returns denied when permission is denied but can ask again', () => {
    __setMockPermissionState(false, true, 'denied');
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permission).toBe('denied');
  });

  it('returns blocked when permission is denied and cannot ask again', () => {
    __setMockPermissionState(false, false, 'denied');
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permission).toBe('blocked');
  });

  it('requestPermission returns true when granted', async () => {
    __setMockPermissionState(false, true, 'denied');
    const { result } = renderHook(() => useCameraPermissions());

    expect(result.current.permission).toBe('denied');

    let granted: boolean | undefined;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(true);
  });

  it('sets isRequesting to true during permission request', async () => {
    __setMockPermissionState(false, true, 'denied');
    const { result } = renderHook(() => useCameraPermissions());

    let promise: Promise<boolean>;
    act(() => {
      promise = result.current.requestPermission();
    });

    await waitFor(() => {
      expect(result.current.isRequesting).toBe(true);
    });

    await act(async () => {
      await promise!;
    });

    expect(result.current.isRequesting).toBe(false);
  });

  it('returns stable requestPermission reference across renders', () => {
    const { result, rerender } = renderHook(() => useCameraPermissions());

    const first = result.current.requestPermission;
    rerender();
    expect(result.current.requestPermission).toBe(first);
  });

  it('returns stable openSettings reference across renders', () => {
    const { result, rerender } = renderHook(() => useCameraPermissions());

    const first = result.current.openSettings;
    rerender();
    expect(result.current.openSettings).toBe(first);
  });
});
