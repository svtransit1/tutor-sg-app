package expo.modules.tutorsgllmruntime
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.util.concurrent.Executors
import kotlin.math.min
import kotlin.math.roundToInt

class TutorSgLlmRuntimeModule : Module() {
  private val exec = Executors.newSingleThreadExecutor()
  private var nativeInference: Any? = null
  private var currentState = "uninitialized"
  private var loadedModelId: String? = null
  private var loadedTier: String? = null
  override fun definition() = ModuleDefinition {
    Name("TutorSgLlmRuntime")
    Events("onToken", "onError", "onStateChange")
    AsyncFunction("loadModel") { path: String, tier: String ->
      exec.execute {
        try {
          emitState("loading"); val modelFile = File(path)
          if (!modelFile.exists()) { sendEvent("onError", mapOf("code" to "MODEL_NOT_FOUND", "message" to "Model file not found at $path", "recoverable" to true)); emitState("error"); return@execute }
          if (modelFile.length() == 0L) { sendEvent("onError", mapOf("code" to "MODEL_EMPTY", "message" to "Model file is empty", "recoverable" to true)); emitState("error"); return@execute }
          // LiteRT-LM: com.google.ai.edge.litert.lm.LiteRtLm.create(options)
          loadedModelId = modelFile.name; loadedTier = tier; currentState = "ready"; emitState("ready")
          mapOf("success" to true, "modelId" to (loadedModelId ?: ""), "state" to "ready", "message" to "OK")
        } catch (e: Exception) {
          android.util.Log.e("TutorSgLlmRuntime", "loadModel failed", e)
          sendEvent("onError", mapOf("code" to "LOAD_FAILED", "message" to (e.message ?: "Unknown error"), "recoverable" to true))
          emitState("error"); mapOf("success" to false, "modelId" to (loadedModelId ?: ""), "state" to "error", "message" to (e.message ?: "Unknown error"))
        }
      }
    }
    AsyncFunction("generate") { prompt: String, maxTokens: Int, temperature: Double, topP: Double ->
      exec.execute {
        if (currentState != "ready") { sendEvent("onError", mapOf("code" to "MODEL_NOT_LOADED", "message" to "Call loadModel first. Current state: $currentState", "recoverable" to true)); return@execute }
        try {
          emitState("generating"); val startMs = System.currentTimeMillis()
          // LiteRT-LM: GenerateOptions.builder().setStreamingCallback { partial, done -> ... }.build()
          emitState("ready"); mapOf("text" to "", "tokenCount" to 0, "latencyMs" to (System.currentTimeMillis() - startMs), "tokensPerSecond" to 0)
        } catch (e: Exception) {
          android.util.Log.e("TutorSgLlmRuntime", "generate failed", e)
          sendEvent("onError", mapOf("code" to "GEN_FAILED", "message" to (e.message ?: "Generation failed"), "recoverable" to false))
          emitState("error"); mapOf("text" to "", "tokenCount" to 0, "latencyMs" to 0, "tokensPerSecond" to 0)
        }
      }
    }
    AsyncFunction("unloadModel") { exec.execute { try { nativeInference = null; loadedModelId = null; loadedTier = null; currentState = "uninitialized"; emitState("uninitialized") } catch (e: Exception) { android.util.Log.e("TutorSgLlmRuntime", "unload failed", e) } } }
    Function("getState") { currentState }
    Function("getLoadedModelId") { loadedModelId ?: "" }
    Function("isReady") { currentState == "ready" }
  }
  private fun emitState(state: String) { currentState = state; sendEvent("onStateChange", state) }
}
