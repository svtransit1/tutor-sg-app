// TutorSgOcrModule.kt
// On-device OCR using Google ML Kit Text Recognition.
//
// Architecture: single-shot text recognition from a local file URI.
// Follows the Expo Modules API pattern: Module subclass with ModuleDefinition.

package expo.modules.tutorsgocr

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Log
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

private const val TAG = "TutorSgOcr"
private const val DEFAULT_MIN_CONFIDENCE = 0.3
private val DEFAULT_LANGUAGES = listOf("en", "zh-Hans")

/**
 * Expo Native Module wrapping Google ML Kit on-device text recognition.
 *
 * Exposed JS API:
 * - recognizeText(imagePath: string, options?: OcrOptions): OcrResult
 * - isOcrAvailable(): boolean
 */
class TutorSgOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TutorSgOcr")

    AsyncFunction("recognizeText") { imagePath: String, options: Map<String, Any>? ->
      recognizeTextInternal(imagePath, options)
    }

    Function("isOcrAvailable") {
      true // ML Kit Text Recognition requires Google Play Services; most Android 11+ devices have it
    }
  }

  /**
   * Run ML Kit Text Recognition on the given image file.
   */
  private suspend fun recognizeTextInternal(
    imagePath: String,
    options: Map<String, Any>?
  ): Bundle {
    val context = appContext.reactContext ?: return errorBundle("React context not available")
    val minConfidence = options?.get("minConfidence") as? Double ?: DEFAULT_MIN_CONFIDENCE
    val recognitionLanguages = options?.get("recognitionLanguages") as? List<String> ?: DEFAULT_LANGUAGES
    val androidTextLocale = options?.get("androidTextLocale") as? String ?: "en"

    // Resolve file URI to a Bitmap
    val uri = if (imagePath.startsWith("file://")) {
      Uri.parse(imagePath)
    } else {
      Uri.fromFile(File(imagePath))
    }

    val bitmap: Bitmap
    try {
      val inputStream = context.contentResolver.openInputStream(uri)
        ?: return errorBundle("Failed to open image: $imagePath")
      bitmap = BitmapFactory.decodeStream(inputStream)
      inputStream.close()
    } catch (e: Exception) {
      Log.e(TAG, "Failed to decode image", e)
      return errorBundle("Failed to decode image: ${e.message}")
    }

    val imageWidth = bitmap.width
    val imageHeight = bitmap.height

    // Build the InputImage
    val inputImage = InputImage.fromBitmap(bitmap, 0)

    // Create recognizer with locale-specific options
    val recognizer: TextRecognizer = when {
      androidTextLocale.startsWith("zh") || recognitionLanguages.any { it.startsWith("zh") } -> {
        TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
      }
      else -> {
        TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
      }
    }

    return try {
      val result = recognizer.process(inputImage).await()
      buildResult(result, imageWidth, imageHeight, minConfidence.toFloat())
    } catch (e: Exception) {
      Log.e(TAG, "ML Kit recognition failed", e)
      errorBundle("ML Kit recognition failed: ${e.message}")
    } finally {
      recognizer.close()
    }
  }

  /**
   * Convert ML Kit [com.google.mlkit.vision.text.Text] to the standard result Bundle.
   */
  private fun buildResult(
    visionText: com.google.mlkit.vision.text.Text,
    imageWidth: Int,
    imageHeight: Int,
    minConfidence: Float
  ): Bundle {
    val blocksList = mutableListOf<Bundle>()
    val fullTextParts = mutableListOf<String>()

    // ML Kit returns TextBlock → Line → Element.
    // We flatten to one block per line for consistency with the iOS output.
    val sortedBlocks = visionText.textBlocks.sortedWith(
      compareBy<com.google.mlkit.vision.text.TextBlock> { it.boundingBox?.top ?: 0 }
        .thenBy { it.boundingBox?.left ?: 0 }
    )

    for (block in sortedBlocks) {
      for (line in block.lines) {
        // ML Kit doesn't expose per-line confidence directly;
        // we estimate from the mean of element confidences.
        val elementConfidences = line.elements.mapNotNull { it.confidence?.toDouble() }
        val lineConfidence = if (elementConfidences.isNotEmpty()) {
          elementConfidences.average()
        } else {
          1.0 // default high confidence when not available
        }

        if (lineConfidence < minConfidence) continue

        val box = line.boundingBox ?: continue

        val blockBundle = Bundle().apply {
          putString("text", line.text)
          putDouble("confidence", lineConfidence)
          putBundle("boundingBox", Bundle().apply {
            putDouble("x", box.left.toDouble() / imageWidth)
            putDouble("y", box.top.toDouble() / imageHeight)
            putDouble("width", box.width().toDouble() / imageWidth)
            putDouble("height", box.height().toDouble() / imageHeight)
          })
        }
        blocksList.add(blockBundle)
        fullTextParts.add(line.text)
      }
    }

    return Bundle().apply {
      putString("fullText", fullTextParts.joinToString("\n"))
      putParcelableArrayList("blocks", ArrayList(blocksList))
      putBundle("imageSize", Bundle().apply {
        putInt("width", imageWidth)
        putInt("height", imageHeight)
      })
      putString("error", null)
    }
  }

  /**
   * Build a standard error result Bundle.
   */
  private fun errorBundle(message: String): Bundle {
    return Bundle().apply {
      putString("fullText", "")
      putParcelableArrayList("blocks", ArrayList())
      putBundle("imageSize", Bundle().apply {
        putInt("width", 0)
        putInt("height", 0)
      })
      putString("error", message)
    }
  }
}
