/**
 * Mock for expo-camera module
 *
 * Returns controlled permission responses for testing.
 * Default: granted=true, status='granted'
 * Tests can override by calling setMockPermissionStatus.
 */

let mockGranted = true;
let mockStatus = 'granted';
let mockCanAskAgain = true;
let mockRequestFn: () => void = () => {};

export function setMockPermissionStatus(
  status: 'undetermined' | 'granted' | 'denied',
  canAskAgain = true,
) {
  mockGranted = status === 'granted';
  mockStatus = status;
  mockCanAskAgain = canAskAgain;
}

export function setMockRequestHandler(fn: () => void) {
  mockRequestFn = fn;
}

export function resetMockPermissions() {
  mockGranted = true;
  mockStatus = 'granted';
  mockCanAskAgain = true;
  mockRequestFn = () => {};
}

export const CameraView = ({ children, ...rest }: any) => children;

export const useCameraPermissions = () => {
  return [
    {
      granted: mockGranted,
      status: mockStatus,
      canAskAgain: mockCanAskAgain,
      expires: 'never',
    },
    async () => {
      mockRequestFn();
      return {
        granted: mockGranted,
        status: mockStatus,
        canAskAgain: mockCanAskAgain,
        expires: 'never',
      };
    },
    async () => ({
      granted: mockGranted,
      status: mockStatus,
      canAskAgain: mockCanAskAgain,
      expires: 'never',
    }),
  ];
};

export const CameraType = { back: 'back', front: 'front' };
