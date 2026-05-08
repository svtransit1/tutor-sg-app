import { Platform } from 'react-native';

export interface PhotoExifData {
  iso?: number;
  exposureTime?: number;
  brightnessValue?: number;
}

export interface LowLightResult {
  isLowLight: boolean;
  confidence: 'high' | 'medium' | 'low';
  suggestedFix?: string;
}

const ISO_THRESHOLD = 800;
const EXPOSURE_THRESHOLD = 1 / 15;
const BRIGHTNESS_THRESHOLD = 0.5;

export function isLowLightFromExif(exif: PhotoExifData): LowLightResult {
  if (Platform.OS === 'ios' && exif.brightnessValue !== undefined) {
    const isLow = exif.brightnessValue < BRIGHTNESS_THRESHOLD;
    return {
      isLowLight: isLow,
      confidence: isLow ? 'high' : 'low',
      suggestedFix: isLow ? 'Turn on more lights or move closer to a window' : undefined,
    };
  }

  if (Platform.OS === 'android' && exif.iso !== undefined && exif.exposureTime !== undefined) {
    const isLow = exif.iso >= ISO_THRESHOLD && exif.exposureTime >= EXPOSURE_THRESHOLD;
    return {
      isLowLight: isLow,
      confidence: isLow ? 'medium' : 'low',
      suggestedFix: isLow ? 'Add more light for a clearer photo' : undefined,
    };
  }

  return { isLowLight: false, confidence: 'low' };
}
