# tutor-sg-ocr — On-device OCR Native Module

## Overview

Expo / React Native native module that provides a unified TypeScript API over:

| Platform | Engine | Framework |
|---|---|---|
| iOS | Apple Vision Framework | `VNRecognizeTextRequest` |
| Android | Google ML Kit Text Recognition | `com.google.mlkit:text-recognition` |

Part of the [tutor-sg-app](https://github.com/aaas-pte-ltd/tutor-sg-app) monorepo.
Built with the Expo Modules API (`expo-modules-core`).

**Privacy guarantee:** All recognition happens on-device. No image data ever leaves the
device. No network calls are made during OCR.

## Installation

The module is a local workspace package. It is already referenced from
`mobile/package.json` as `"tutor-sg-ocr": "file:modules/tutor-sg-ocr"`.

```bash
pnpm install
```

## Usage

```ts
import { recognizeText, isOcrAvailable } from "tutor-sg-ocr";

// Check availability (always true on iOS 16+ / Android 11+ with Google Play Services)
if (!isOcrAvailable()) {
  console.warn("OCR not available on this device");
}

// Recognise text from a local image file
const result = await recognizeText("file:///path/to/homework.jpg", {
  minConfidence: 0.4,
  recognitionLanguages: ["en", "zh-Hans"],
  recognitionLevel: "accurate",
});

if (result.error) {
  console.error("OCR failed:", result.error);
  return;
}

console.log(result.fullText);
// "What is the sum of 23 and 45?\nShow your working."

for (const block of result.blocks) {
  console.log(`"${block.text}" at (${block.boundingBox.x}, ${block.boundingBox.y})`);
}
```

## API

### `recognizeText(imagePath, options?)`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `imagePath` | `string` | — | Absolute file URI (`file://...`) or path |
| `options.minConfidence` | `number` | `0.3` | Minimum confidence threshold (0–1) |
| `options.recognitionLanguages` | `string[]` | `["en", "zh-Hans"]` | Language hints for recognition |
| `options.recognitionLevel` | `"fast" \| "accurate"` | `"accurate"` | Speed vs. accuracy trade-off (iOS only) |
| `options.androidTextLocale` | `string` | `"en"` | Android ML Kit locale selector; `"zh"` for Chinese |

### `OcrResult`

| Field | Type | Description |
|---|---|---|
| `fullText` | `string` | Concatenated text, top-to-bottom, left-to-right |
| `blocks` | `OcrTextBlock[]` | Individual text blocks with position and confidence |
| `imageSize` | `{ width, height }` | Image dimensions in pixels |
| `error` | `string \| null` | Error message if recognition failed |

### `OcrTextBlock`

| Field | Type | Description |
|---|---|---|
| `text` | `string` | Recognised text |
| `boundingBox` | `OcrRect` | Normalised rect (0–1) relative to image size |
| `confidence` | `number` | Confidence score 0–1 |

### `isOcrAvailable()`

Returns `true` if the native OCR engine can be used on the current device.

## Tests

```bash
cd mobile/modules/tutor-sg-ocr
npx jest --no-cache
```

## Dependencies

### iOS
- iOS 16.0+ (via `Info.plist` / Podfile deployment target)
- Apple Vision Framework (system, no additional dependencies)
- `ExpoModulesCore` (from `expo-modules-core` pod)

### Android
- Android API 30+ (Android 11+)
- Google Play Services (for ML Kit)
- `com.google.mlkit:text-recognition:16.0.1` (via Gradle)
