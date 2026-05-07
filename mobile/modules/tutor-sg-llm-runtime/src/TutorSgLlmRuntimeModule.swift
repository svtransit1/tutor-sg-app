import ExpoModulesCore
import Foundation

public class TutorSgLlmRuntimeModule: Module {
  private let inferenceQueue = DispatchQueue(label: "com.tutorsg.llm", qos: .userInitiated)
  private var modelLoaded = false; private var loadedModelId: String?; private var loadedTier: String?; private var currentState = "uninitialized"
  public func definition() -> ModuleDefinition {
    Name("TutorSgLlmRuntime")
    Events("onToken", "onError", "onStateChange")
    AsyncFunction("loadModel") { (path: String, tier: String) -> [String: Any] in
      var result: [String: Any] = ["success": false, "modelId": "", "state": "error", "message": ""]
      self.inferenceQueue.sync {
        self.emitState("loading")
        guard FileManager.default.fileExists(atPath: path) else { self.sendEvent("onError", ["code": "MODEL_NOT_FOUND", "message": "Model file not found at \(path)", "recoverable": true]); self.emitState("error"); result = ["success": false, "modelId": "", "state": "error", "message": "Model file not found"]; return }
        // ExecuTorch: let module = try Module(filePath: path)
        self.loadedModelId = (path as NSString).lastPathComponent; self.loadedTier = tier; self.modelLoaded = true; self.currentState = "ready"; self.emitState("ready")
        result = ["success": true, "modelId": self.loadedModelId ?? "", "state": "ready", "message": "OK"]
      }
      return result
    }
    AsyncFunction("generate") { (prompt: String, maxTokens: Int, temperature: Double, topP: Double) -> [String: Any] in
      var result: [String: Any] = ["text": "", "tokenCount": 0, "latencyMs": 0, "tokensPerSecond": 0]
      guard self.currentState == "ready" else { self.sendEvent("onError", ["code": "MODEL_NOT_LOADED", "message": "Call loadModel first. Current state: \(self.currentState)", "recoverable": true]); return result }
      self.inferenceQueue.sync {
        self.emitState("generating"); let startMs = CFAbsoluteTimeGetCurrent() * 1000
        // ExecuTorch: try module.forward(input, streamingHandler: handler)
        let elapsedMs = (CFAbsoluteTimeGetCurrent() * 1000) - startMs; self.currentState = "ready"; self.emitState("ready")
        result = ["text": "", "tokenCount": 0, "latencyMs": Int(elapsedMs), "tokensPerSecond": 0]
      }
      return result
    }
    AsyncFunction("unloadModel") { self.inferenceQueue.sync { self.loadedModelId = nil; self.loadedTier = nil; self.modelLoaded = false; self.currentState = "uninitialized"; self.emitState("uninitialized") } }
    Function("getState") { currentState }
    Function("getLoadedModelId") { loadedModelId ?? "" }
    Function("isReady") { currentState == "ready" }
  }
  private func emitState(_ state: String) { currentState = state; sendEvent("onStateChange", state) }
}
