import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Linking } from 'react-native';
import {
  useCameraPermissions as useExpoCameraPermissions,
  PermissionStatus,
} from 'expo-camera';

export type CameraPermissionState =
  | 'loading'
  | 'granted'
  | 'denied'
  | 'blocked';

export interface UseCameraPermissionsResult {
  permission: CameraPermissionState;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;
  isRequesting: boolean;
}

function isBlocked(status: PermissionStatus, canAskAgain: boolean): boolean {
  return status === PermissionStatus.DENIED && !canAskAgain;
}

export function useCameraPermissions(): UseCameraPermissionsResult {
  const [expoPermission, requestExpoPermission] = useExpoCameraPermissions();
  const [isRequesting, setIsRequesting] = useState(false);
  const mountedRef = useRef(true);
  const requestRef = useRef(requestExpoPermission);
  const isRequestingRef = useRef(false);
  requestRef.current = requestExpoPermission;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const permissionState: CameraPermissionState = (() => {
    if (!expoPermission) return 'loading';
    if (expoPermission.granted) return 'granted';
    if (isBlocked(expoPermission.status, expoPermission.canAskAgain)) {
      return 'blocked';
    }
    return 'denied';
  })();

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isRequestingRef.current) return false;
    isRequestingRef.current = true;
    setIsRequesting(true);
    try {
      const response = await requestRef.current();
      return response?.granted ?? false;
    } finally {
      if (mountedRef.current) {
        isRequestingRef.current = false;
        setIsRequesting(false);
      }
    }
  }, []);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    permission: permissionState,
    requestPermission,
    openSettings,
    isRequesting,
  };
}
