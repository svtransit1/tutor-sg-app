// TutorSgOcrModule.swift
// On-device OCR using Apple Vision Framework (VNRecognizeTextRequest)
//
// Architecture: single-shot text recognition from a local file URI.
// Follows the Expo Modules API pattern: Module subclass with AsyncFunction.

import ExpoModulesCore
import Vision
import UIKit

/// Configuration keys passed from JS.
private let kMinConfidence = "minConfidence"
private let kRecognitionLanguages = "recognitionLanguages"
private let kRecognitionLevel = "recognitionLevel"

/// Default values.
private let kDefaultMinConfidence: Double = 0.3
private let kDefaultRecognitionLevel = "accurate"
private let kDefaultLanguages = ["en", "zh-Hans"]

// MARK: - Module

public final class TutorSgOcrModule: Module {
  // MARK: Module definition

  public func definition() -> ModuleDefinition {
    Name("TutorSgOcr")

    AsyncFunction("recognizeText") { (imagePath: String, options: [String: Any]?) -> [String: Any] in
      try await recognizeTextInternal(imagePath: imagePath, options: options)
    }

    Function("isOcrAvailable") { () -> Bool in
      if #available(iOS 16.0, *) {
        return true
      }
      return false
    }
  }

  // MARK: - Private implementation

  /// Main recognition function, invoked from the async JS bridge.
  private func recognizeTextInternal(
    imagePath: String,
    options: [String: Any]?
  ) async throws -> [String: Any] {
    guard #available(iOS 16.0, *) else {
      return errorResult("OCR is not available on iOS versions below 16.0")
    }

    // 1. Load image from file path
    let imageUrl: URL
    if imagePath.hasPrefix("file://") {
      imageUrl = URL(string: imagePath)!
    } else {
      imageUrl = URL(fileURLWithPath: imagePath)
    }

    guard let imageSource = CGImageSourceCreateWithURL(imageUrl as CFURL, nil),
          let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil)
    else {
      return errorResult("Failed to load image from path: \(imagePath)")
    }

    let imageWidth = cgImage.width
    let imageHeight = cgImage.height

    // 2. Parse options
    let minConfidence = options?[kMinConfidence] as? Double ?? kDefaultMinConfidence
    let recognitionLevelStr = options?[kRecognitionLevel] as? String ?? kDefaultRecognitionLevel
    let languages = options?[kRecognitionLanguages] as? [String] ?? kDefaultLanguages

    // 3. Run Apple Vision
    return try await performVisionOCR(
      cgImage: cgImage,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      minConfidence: minConfidence,
      recognitionLevel: recognitionLevelStr == "fast"
        ? VNRequestTextRecognitionLevel.fast
        : VNRequestTextRecognitionLevel.accurate,
      languages: languages
    )
  }

  /// Execute VNRecognizeTextRequest and format the result.
  @available(iOS 16.0, *)
  private func performVisionOCR(
    cgImage: CGImage,
    imageWidth: Int,
    imageHeight: Int,
    minConfidence: Double,
    recognitionLevel: VNRequestTextRecognitionLevel,
    languages: [String]
  ) async throws -> [String: Any] {
    return try await withCheckedThrowingContinuation { continuation in
      let request = VNRecognizeTextRequest { request, error in
        if let error = error {
          continuation.resume(returning: self.errorResult("Vision request failed: \(error.localizedDescription)"))
          return
        }

        guard let observations = request.results as? [VNRecognizedTextObservation] else {
          continuation.resume(returning: self.errorResult("No recognition results"))
          return
        }

        let imageW = CGFloat(imageWidth)
        let imageH = CGFloat(imageHeight)

        // Collect all recognised text blocks, sorted top-to-bottom then left-to-right
        var blocks: [[String: Any]] = []
        var fullTextParts: [String] = []

        let sortedObservations = observations.sorted { a, b in
          let aBox = a.boundingBox
          let bBox = b.boundingBox
          // Sort by y (top of block), then by x (left of block)
          if abs(aBox.origin.y - bBox.origin.y) < 0.02 {
            return aBox.origin.x < bBox.origin.x
          }
          // Vision boundingBox y increases upward — invert for natural top-to-bottom
          return aBox.origin.y > bBox.origin.y
        }

        for observation in sortedObservations {
          guard let topCandidate = observation.topCandidates(1).first else { continue }
          let confidence = Double(topCandidate.confidence)
          guard confidence >= minConfidence else { continue }

          let box = observation.boundingBox
          let block: [String: Any] = [
            "text": topCandidate.string,
            "confidence": confidence,
            "boundingBox": [
              "x": Double(box.origin.x),
              "y": Double(1.0 - box.origin.y - box.height), // Convert Vision coords to top-left origin
              "width": Double(box.size.width),
              "height": Double(box.size.height)
            ]
          ]
          blocks.append(block)
          fullTextParts.append(topCandidate.string)
        }

        let fullText = fullTextParts.joined(separator: "\n")

        let result: [String: Any] = [
          "fullText": fullText,
          "blocks": blocks,
          "imageSize": [
            "width": imageWidth,
            "height": imageHeight
          ],
          "error": NSNull()
        ]
        continuation.resume(returning: result)
      }

      // Configure request
      request.recognitionLevel = recognitionLevel
      request.usesLanguageCorrection = true
      request.recognitionLanguages = languages
      request.minimumTextHeight = 0.01

      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
      do {
        try handler.perform([request])
      } catch {
        continuation.resume(returning: self.errorResult("Vision handler error: \(error.localizedDescription)"))
      }
    }
  }

  /// Build a standard error result dictionary.
  private func errorResult(_ message: String) -> [String: Any] {
    return [
      "fullText": "",
      "blocks": [],
      "imageSize": ["width": 0, "height": 0],
      "error": message
    ]
  }
}
