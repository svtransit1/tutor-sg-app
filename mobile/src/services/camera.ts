import * as ImagePicker from 'expo-image-picker';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
}

export interface CaptureOptions {
  mediaTypes: 'images' | 'videos' | 'all';
  allowsEditing: boolean;
  quality: number;
  exif?: boolean;
}

const DEFAULT_OPTIONS: CaptureOptions = {
  mediaTypes: 'images',
  allowsEditing: false,
  quality: 0.8,
  exif: false,
};

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function getCameraPermissionStatus(): Promise<'granted' | 'denied' | 'not-determined'> {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'not-determined';
}

export async function capturePhoto(options: Partial<CaptureOptions> = {}): Promise<CapturedPhoto | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions[opts.mediaTypes === 'all' ? 'All' : opts.mediaTypes === 'videos' ? 'Videos' : 'Images'],
    allowsEditing: opts.allowsEditing,
    quality: opts.quality,
    exif: opts.exif,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width ?? 0, height: asset.height ?? 0 };
}

export async function pickFromLibrary(options: Partial<CaptureOptions> = {}): Promise<CapturedPhoto | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions[opts.mediaTypes === 'all' ? 'All' : opts.mediaTypes === 'videos' ? 'Videos' : 'Images'],
    allowsEditing: opts.allowsEditing,
    quality: opts.quality,
    exif: opts.exif,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width ?? 0, height: asset.height ?? 0 };
}