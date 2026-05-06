import { requireNativeModule } from "expo-modules-core";
import type { OcrResult, OcrOptions } from "./TutorSgOcr.types";

/**
 * Native OCR module interface.
 * Maps to the native TutorSgOcrModule on iOS (Apple Vision) and Android (ML Kit).
 */
export interface NativeTutorSgOcrModule {
  /**
   * Run text recognition on a local image file.
   *
   * @param imagePath Absolute file URI or path to the image.
   * @param options Recognition options (confidence threshold, language hints, etc.).
   * @returns OcrResult with recognised text blocks and metadata.
   */
  recognizeText(imagePath: string, options?: OcrOptions): Promise<OcrResult>;

  /**
   * Returns true if the device supports the native OCR framework.
   * On iOS this usually returns true for iOS 13+; on Android for API 21+.
   */
  isOcrAvailable(): boolean;
}

/**
 * The native OCR module, loaded at runtime via the JSI host object.
 *
 * @throws {Error} If the native module is not linked or the platform is unsupported.
 */
function loadNativeModule(): NativeTutorSgOcrModule {
  try {
    return requireNativeModule<NativeTutorSgOcrModule>("TutorSgOcr");
  } catch {
    throw new Error(
      "TutorSgOcr native module is not available. " +
        "Ensure the module is linked and you are running on a physical device or simulator."
    );
  }
}

let _nativeModule: NativeTutorSgOcrModule | null = null;

function getNativeModule(): NativeTutorSgOcrModule {
  if (!_nativeModule) {
    _nativeModule = loadNativeModule();
  }
  return _nativeModule;
}

/**
 * Run text recognition on a local image file using the platform-native OCR engine.
 *
 * @param imagePath Absolute file URI or path to the image.
 * @param options  Optional recognition parameters.
 * @returns A promise that resolves to an OcrResult.
 *
 * @example
 * ```ts
 * import { recognizeText } from 'tutor-sg-ocr';
 *
 * const result = await recognizeText('file:///path/to/homework.jpg');
 * console.log(result.fullText);
 * ```
 */
export async function recognizeText(
  imagePath: string,
  options?: OcrOptions
): Promise<OcrResult> {
  const native = getNativeModule();
  return native.recognizeText(imagePath, options);
}

/**
 * Check whether the device supports the native OCR framework.
 *
 * @returns true if the native OCR engine can be used on this device.
 */
export function isOcrAvailable(): boolean {
  try {
    return getNativeModule().isOcrAvailable();
  } catch {
    return false;
  }
}

export type { OcrResult, OcrTextBlock, OcrRect, OcrOptions } from "./TutorSgOcr.types";
