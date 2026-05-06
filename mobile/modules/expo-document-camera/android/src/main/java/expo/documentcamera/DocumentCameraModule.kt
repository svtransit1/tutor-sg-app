package expo.documentcamera

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

/**
 * Expo module wrapping Google ML Kit Document Scanner API.
 *
 * Provides auto-crop, perspective correction, and deskew via
 * the platform-native document scanner.
 *
 * Also provides image brightness analysis for low-light detection.
 */
class DocumentCameraModule : Module() {
  private val TAG = "ExpoDocumentCamera"
  private var scannerPromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoDocumentCamera")

    AsyncFunction("scanDocumentAsync") { promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.reject("ERR_NO_CONTEXT", "React context not available")
        return@AsyncFunction
      }

      if (!isScannerAvailable()) {
        promise.reject(
          "DOC_CAM_NOT_SUPPORTED",
          "ML Kit Document Scanner requires Google Play Services with ML Kit support"
        )
        return@AsyncFunction
      }

      val options = GmsDocumentScannerOptions.Builder()
        .setGalleryImportAllowed(false)
        .setPageLimit(1) // Single page for M2-6
        .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
        .build()

      scannerPromise = promise

      val activity = appContext.currentActivity ?: run {
        promise.reject("ERR_NO_ACTIVITY", "No current activity")
        return@AsyncFunction
      }

      val scanner = GmsDocumentScanning.getClient(options)
      scanner.getStartScanIntent(activity)
        .addOnSuccessListener { intent ->
          activity.startActivityForResult(intent, REQUEST_CODE_SCAN)
        }
        .addOnFailureListener { e ->
          scannerPromise?.reject("DOC_CAM_ERROR", e.message ?: "Scanner failed to start")
          scannerPromise = null
        }
    }

    AsyncFunction("isAvailable") { ->
      isScannerAvailable()
    }

    AsyncFunction("checkImageBrightnessAsync") { uri: String, promise: Promise ->
      try {
        val context = appContext.reactContext ?: throw Exception("No context")
        val imageUri = Uri.parse(uri)

        // Decode a sampled version for speed
        val options = BitmapFactory.Options().apply {
          inSampleSize = 16 // Downsample 16x for quick brightness check
        }

        val bitmap = if (imageUri.scheme == "file") {
          BitmapFactory.decodeFile(imageUri.path, options)
        } else {
          val inputStream = context.contentResolver.openInputStream(imageUri)
          inputStream?.use { BitmapFactory.decodeStream(it, null, options) }
        }

        if (bitmap == null) {
          promise.reject("ERR_LOAD_IMAGE", "Failed to decode image")
          return@AsyncFunction
        }

        val brightness = computeAverageBrightness(bitmap)
        bitmap.recycle()
        promise.resolve(brightness)
      } catch (e: Exception) {
        promise.reject("ERR_BRIGHTNESS", "Failed to check brightness: ${e.message}")
      }
    }

    OnActivityResult { _, _, _, data ->
      handleScanResult(data)
    }
  }

  private fun isScannerAvailable(): Boolean {
    return try {
      val availability = com.google.android.gms.common.GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(appContext.reactContext)
      availability == com.google.android.gms.common.ConnectionResult.SUCCESS
    } catch (e: Exception) {
      Log.w(TAG, "Google Play Services check failed", e)
      false
    }
  }

  private fun computeAverageBrightness(bitmap: Bitmap): Double {
    val width = bitmap.width
    val height = bitmap.height
    val pixels = IntArray(width * height)
    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

    var totalBrightness = 0.0
    for (pixel in pixels) {
      val r = (pixel shr 16) and 0xFF
      val g = (pixel shr 8) and 0xFF
      val b = pixel and 0xFF
      // Standard luminance: 0.299R + 0.587G + 0.114B
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b
    }

    return totalBrightness / pixels.size
  }

  private fun handleScanResult(data: Intent?) {
    if (data == null) {
      scannerPromise?.resolve(null)
      scannerPromise = null
      return
    }

    val result = GmsDocumentScanningResult.fromActivityResultIntent(data)
    if (result == null) {
      scannerPromise?.resolve(null)
      scannerPromise = null
      return
    }

    val pages = result.pages
    if (pages.isNullOrEmpty()) {
      scannerPromise?.resolve(null)
      scannerPromise = null
      return
    }

    // Take the first page (single-photo mode for M2-6)
    val page = pages[0]
    val imageUri = page.imageUri

    // Copy to app cache directory (never camera roll, never upload)
    try {
      val context = appContext.reactContext ?: throw Exception("No context")
      val inputStream = context.contentResolver.openInputStream(imageUri)
        ?: throw Exception("Cannot open image URI")

      val filename = "scan_${System.currentTimeMillis()}.jpg"
      val cacheFile = File(context.cacheDir, filename)

      FileOutputStream(cacheFile).use { outputStream ->
        inputStream.copyTo(outputStream)
      }

      inputStream.close()

      // Get bitmap for dimensions
      val bitmap = android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, imageUri)

      scannerPromise?.resolve(mapOf(
        "uri" to Uri.fromFile(cacheFile).toString(),
        "width" to bitmap.width,
        "height" to bitmap.height,
        "timestamp" to System.currentTimeMillis()
      ))
    } catch (e: Exception) {
      scannerPromise?.reject("ERR_FILE_SAVE", "Failed to save scanned image: ${e.message}")
    }

    scannerPromise = null
  }

  companion object {
    private const val REQUEST_CODE_SCAN = 0x43414D // "CAM" in hex
  }
}
