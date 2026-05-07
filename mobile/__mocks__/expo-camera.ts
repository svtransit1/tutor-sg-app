import React from 'react';

let mockGranted = true;
let mockCanAskAgain = true;
let mockStatus: 'granted' | 'denied' | 'undetermined' = 'granted';

export const PermissionStatus = {
  GRANTED: 'granted',
  UNDETERMINED: 'undetermined',
  DENIED: 'denied',
} as const;

export const CameraType = { front: 'front', back: 'back' };
export const FlashMode = { on: 'on', off: 'off', auto: 'auto' };

export const CameraView = React.forwardRef((props: any, ref: any) =>
  React.createElement('CameraView', props),
);

export const useCameraPermissions = jest.fn().mockImplementation(() => {
  const response = {
    status: mockStatus,
    granted: mockGranted,
    expires: 'never',
    canAskAgain: mockCanAskAgain,
  };
  const request = async () => {
    mockGranted = true;
    mockStatus = 'granted';
    mockCanAskAgain = true;
    return { ...response, granted: true, status: 'granted' as const };
  };
  const get = async () => ({
    status: mockStatus,
    granted: mockGranted,
    expires: 'never',
    canAskAgain: mockCanAskAgain,
  });
  return [response, request, get];
});

export function __setMockPermissionState(
  granted: boolean,
  canAskAgain: boolean,
  status?: 'granted' | 'denied' | 'undetermined',
) {
  mockGranted = granted;
  mockCanAskAgain = canAskAgain;
  mockStatus = status ?? (granted ? 'granted' : 'denied');
}

export function __resetMockPermissionState() {
  mockGranted = true;
  mockCanAskAgain = true;
  mockStatus = 'granted';
}

export default { CameraView, CameraType, FlashMode, useCameraPermissions };
