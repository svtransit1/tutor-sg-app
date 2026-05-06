import { Platform } from 'react-native';

/**
 * Result from the native document scanner.
 * The image has been automatically cropped and perspective-corrected
 * by the platform's native document scanner (VNDocumentCameraViewController
 * on iOS, ML Kit Document Scanner on Android).
 */
export interface DocumentScanResult {
  /** URI of the cropped + perspective-corrected image in app sandbox */
  uri: string;
  /** Width of the scanned image in pixels */
  width: number;
  /** Height of the scanned image in pixels */
  height: number;
  /** Timestamp when the scan was captured (ms since epoch) */
  timestamp: number;
}

/**
 * Native module interface for ExpoDocumentCamera.
 */
interface NativeDocCameraModule {
  scanDocumentAsync(): Promise<DocumentScanResult | null>;
  isAvailable(): Promise<boolean>;
  checkImageBrightnessAsync(uri: string): Promise<number>;
}

function getNativeModule(): NativeDocCameraModule | null {
  if (Platform.OS === 'web') return null;
  const proxy = (globalThis as Record<string, unknown>).ExpoModulesProxy as Record<string, unknown> | undefined;
  const mod = proxy?.ExpoDocumentCamera as NativeDocCameraModule | undefined;
  return mod ?? null;
}

/**
 * Open the native document scanner UI.
 *
 * On iOS this uses VNDocumentCameraViewController (built-in since iOS 13).
 * On Android this uses Google ML Kit Document Scanner API.
 *
 * The returned image is automatically cropped, deskewed, and
 * perspective-corrected by the platform — no post-processing needed.
 *
 * @returns The scanned document info, or null if the user cancelled.
 */
export async function scanDocumentAsync(): Promise<DocumentScanResult | null> {
  const native = getNativeModule();
  if (!native) {
    throw new Error(
      'ExpoDocumentCamera native module not found. ' +
      'Make sure you have rebuilt the native app after adding the module.'
    );
  }
  return native.scanDocumentAsync();
}

/**
 * Check whether the current device supports the native document scanner.
 * On iOS this requires iOS 13+. On Android it requires Google Play Services
 * (ML Kit Document Scanner).
 */
export async function isDocumentScannerAvailable(): Promise<boolean> {
  const native = getNativeModule();
  if (!native) return false;
  return native.isAvailable();
}

/**
 * Analyze a captured image and return its average brightness (0–255).
 *
 * Values below ~50 indicate very low light (poor for OCR).
 * Values 50–100 indicate dim lighting (usable but not ideal).
 * Values above 100 indicate adequate lighting.
 *
 * @param uri Local file URI of the image to analyze
 * @returns Average brightness as a 0–255 value
 */
export async function checkImageBrightnessAsync(uri: string): Promise<number> {
  const native = getNativeModule();
  if (!native) {
    // Fallback: assume adequate lighting if native module isn't available
    return 150;
  }
  return native.checkImageBrightnessAsync(uri);
}
