import { type ExpoConfig, type ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'tutor-sg',
  slug: 'tutor-sg',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'tutor-sg',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aaas.tutorsg',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'Allow tutor-sg to use the camera to scan your homework.',
      NSMicrophoneUsageDescription:
        'Allow tutor-sg to use the microphone for voice input.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.aaas.tutorsg',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow tutor-sg to access the camera.',
        microphonePermission:
          'Allow tutor-sg to access the microphone.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'CHANGEME',
    },
  },
});
