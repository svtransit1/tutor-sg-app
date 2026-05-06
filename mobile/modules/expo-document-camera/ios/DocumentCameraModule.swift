import ExpoModulesCore
import VisionKit
import Accelerate

/**
 * Expo module wrapping VNDocumentCameraViewController (iOS 13+).
 *
 * Opens the native document scanner which provides auto-crop,
 * perspective correction, and deskew — no post-processing needed.
 *
 * Also provides image brightness analysis for low-light detection.
 */
public class DocumentCameraModule: Module {
  private var scannerPromise: Promise?
  private var scannerVC: VNDocumentCameraViewController?

  public required init(appContext: AppContext) {
    super.init(appContext: appContext)
  }

  public func definition() -> ModuleDefinition {
    Name("ExpoDocumentCamera")

    AsyncFunction("scanDocumentAsync") { (promise: Promise) in
      guard VNDocumentCameraViewController.isSupported else {
        promise.reject(
          "DOC_CAM_NOT_SUPPORTED",
          "Document camera requires iOS 13+"
        )
        return
      }

      guard let currentViewController = self.appContext?.utilities?.currentViewController() else {
        promise.reject("ERR_MISSING_VC", "No active view controller found")
        return
      }

      self.scannerPromise = promise
      self.scannerVC = VNDocumentCameraViewController()
      self.scannerVC!.delegate = self

      currentViewController.present(self.scannerVC!, animated: true)
    }

    AsyncFunction("isAvailable") { () -> Bool in
      if #available(iOS 13, *) {
        return VNDocumentCameraViewController.isSupported
      }
      return false
    }

    AsyncFunction("checkImageBrightnessAsync") { (uri: String, promise: Promise) in
      guard let url = URL(string: uri) ?? URL(fileURLWithPath: uri) as URL? else {
        promise.reject("ERR_INVALID_URI", "Invalid image URI")
        return
      }

      guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, nil),
            let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
        promise.reject("ERR_LOAD_IMAGE", "Failed to load image from URI")
        return
      }

      let brightness = Self.averageBrightness(of: cgImage)
      promise.resolve(brightness)
    }
  }

  /// Compute average brightness (0–255) of a CGImage by sampling pixels.
  private static func averageBrightness(of cgImage: CGImage) -> Double {
    let width = cgImage.width
    let height = cgImage.height

    // Downsample to a small thumbnail for speed
    let thumbSize = 64
    let thumbRect = CGRect(x: 0, y: 0, width: thumbSize, height: thumbSize)

    guard let context = CGContext(
      data: nil,
      width: thumbSize,
      height: thumbSize,
      bitsPerComponent: 8,
      bytesPerRow: thumbSize * 4,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return 150 }

    context.draw(cgImage, in: thumbRect)

    guard let pixelData = context.data else { return 150 }
    let data = pixelData.bindMemory(to: UInt8.self, capacity: thumbSize * thumbSize * 4)

    var totalBrightness: Double = 0
    let pixelCount = thumbSize * thumbSize

    for i in 0..<pixelCount {
      let offset = i * 4
      let r = Double(data[offset])
      let g = Double(data[offset + 1])
      let b = Double(data[offset + 2])
      // Standard luminance: 0.299R + 0.587G + 0.114B
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b
    }

    return totalBrightness / Double(pixelCount)
  }
}

// MARK: - VNDocumentCameraViewControllerDelegate

extension DocumentCameraModule: VNDocumentCameraViewControllerDelegate {
  public func documentCameraViewController(
    _ controller: VNDocumentCameraViewController,
    didFinishWith scan: VNDocumentCameraScan
  ) {
    scannerVC?.dismiss(animated: true)

    guard scan.pageCount > 0 else {
      // No pages scanned — treat as cancellation
      scannerPromise?.resolve(nil)
      return
    }

    // Take the first page scan (single-photo mode for M2-6)
    let image = scan.imageOfPage(at: 0)

    // Save to app sandbox (cache directory) — never camera roll
    let filename = "scan_\(Int(Date().timeIntervalSince1970 * 1000)).jpg"
    guard let cacheDir = FileManager.default.urls(
      for: .cachesDirectory, in: .userDomainMask
    ).first else {
      scannerPromise?.reject("ERR_FILE_SAVE", "Cannot access cache directory")
      return
    }

    let fileURL = cacheDir.appendingPathComponent(filename)

    guard let data = image.jpegData(compressionQuality: 0.8) else {
      scannerPromise?.reject("ERR_JPEG", "Failed to compress scanned image")
      return
    }

    do {
      try data.write(to: fileURL)
      scannerPromise?.resolve([
        "uri": fileURL.absoluteString,
        "width": image.size.width,
        "height": image.size.height,
        "timestamp": Int(Date().timeIntervalSince1970 * 1000)
      ])
    } catch {
      scannerPromise?.reject("ERR_FILE_SAVE", "Failed to save scanned image: \(error.localizedDescription)")
    }
  }

  public func documentCameraViewControllerDidCancel(
    _ controller: VNDocumentCameraViewController
  ) {
    scannerVC?.dismiss(animated: true)
    // User cancelled — return nil, not an error
    scannerPromise?.resolve(nil)
  }

  public func documentCameraViewController(
    _ controller: VNDocumentCameraViewController,
    didFailWithError error: Error
  ) {
    scannerVC?.dismiss(animated: true)
    scannerPromise?.reject("DOC_CAM_ERROR", error.localizedDescription)
  }
}
