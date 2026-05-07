import { type ExpoConfig } from '@expo/config-types'

function getEnv(key: string, fallback?: string): string | undefined {
  const val = process.env[key] ?? process.env['EXPO_PUBLIC_' + key]
  return val ?? fallback
}

const config: ExpoConfig = {
  name: 'tutor-sg',
  slug: 'tutor-sg',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'tutor-sg',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4A90D9',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aaas.tutorsg',
    infoPlist: {
      NSCameraUsageDescription: 'Take photos of homework for AI tutoring',
    },
  },
  android: {
    package: 'com.aaas.tutorsg',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4A90D9',
    },
    permissions: ['android.permission.CAMERA'],
  },
  plugins: ['expo-router', 'expo-localization'],
  extra: {
    APP_ENV: getEnv('APP_ENV', 'development'),
    CDN_BASE_URL: getEnv('CDN_BASE_URL', 'https://cdn.example.com/models/'),
    MODEL_INDEX_PATH: getEnv('MODEL_INDEX_PATH', 'index.json'),
    SUPABASE_URL: getEnv('SUPABASE_URL', 'https://placeholder.supabase.co'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY', 'placeholder-anon-key'),
    HITPAY_API_KEY: getEnv('HITPAY_API_KEY', 'placeholder-hitpay-public-key'),
    ENABLE_DEV_TOOLS: getEnv('ENABLE_DEV_TOOLS', 'false') === 'true',
    LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  },
  experiments: {
    typedRoutes: true,
  },
}

export default config
