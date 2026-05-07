package expo.modules.tutorsgllmruntime
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class TutorSgLlmRuntimeModule : Module() {
  private var currentState = "uninitialized"
  private var loadedModelId: String? = null
  private var loadedTier: String? = null

  override fun definition() = ModuleDefinition {
    Name("TutorSgLlmRuntime")
    Events("onToken", "onError", "onStateChange")

    AsyncFunction("loadModel") { path: String, tier: String ->
      try {
        emitState("loading")
        val modelFile = File(path)
        if (!modelFile.exists()) {
          sendEvent("onError", mapOf("code" to "MODEL_NOT_FOUND", "message" to "Model file not found at $path", "recoverable" to true))
          emitState("error")
          return@AsyncFunction mapOf("success" to false, "modelId" to "", "state" to "error", "message" to "Model file not found")
        }
        if (modelFile.length() == 0L) {
          sendEvent("onError", mapOf("code" to "MODEL_EMPTY", "message" to "Model file is empty", "recoverable" to true))
          emitState("error")
          return@AsyncFunction mapOf("success" to false, "modelId" to "", "state" to "error", "message" to "Model file is empty")
        }
        loadedModelId = modelFile.name; loadedTier = tier; currentState = "ready"; emitState("ready")
        mapOf("success" to true, "modelId" to (loadedModelId ?: ""), "state" to "ready", "message" to "OK")
      } catch (e: Exception) {
        android.util.Log.e("TutorSgLlmRuntime", "loadModel failed", e)
        sendEvent("onError", mapOf("code" to "LOAD_FAILED", "message" to (e.message ?: "Unknown error"), "recoverable" to true))
        emitState("error")
        mapOf("success" to false, "modelId" to (loadedModelId ?: ""), "state" to "error", "message" to (e.message ?: "Unknown error"))
      }
    }

    AsyncFunction("generate") { prompt: String, maxTokens: Int, temperature: Double, topP: Double ->
      if (currentState != "ready") {
        sendEvent("onError", mapOf("code" to "MODEL_NOT_LOADED", "message" to "Call loadModel first. Current state: $currentState", "recoverable" to true))
        return@AsyncFunction mapOf("text" to "", "tokenCount" to 0, "latencyMs" to 0, "tokensPerSecond" to 0)
      }
      try {
        emitState("generating"); val startMs = System.currentTimeMillis()
        emitState("ready")
        mapOf("text" to "", "tokenCount" to 0, "latencyMs" to (System.currentTimeMillis() - startMs), "tokensPerSecond" to 0)
      } catch (e: Exception) {
        android.util.Log.e("TutorSgLlmRuntime", "generate failed", e)
        sendEvent("onError", mapOf("code" to "GEN_FAILED", "message" to (e.message ?: "Generation failed"), "recoverable" to false))
        emitState("error")
        mapOf("text" to "", "tokenCount" to 0, "latencyMs" to 0, "tokensPerSecond" to 0)
      }
    }

    AsyncFunction("unloadModel") {
      try { currentState = "uninitialized"; emitState("uninitialized") }
      catch (e: Exception) { android.util.Log.e("TutorSgLlmRuntime", "unload failed", e) }
    }

    Function("getState") { currentState }
    Function("getLoadedModelId") { loadedModelId ?: "" }
    Function("isReady") { currentState == "ready" }
  }

  private fun emitState(state: String) { currentState = state; sendEvent("onStateChange", state) }
}
