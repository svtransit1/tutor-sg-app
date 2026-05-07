import ExpoModulesCore
import Foundation

public class TutorSgLlmRuntimeModule: Module {
  private let inferenceQueue = DispatchQueue(label: "com.tutorsg.llm", qos: .userInitiated)
  private var modelLoaded = false; private var loadedModelId: String?; private var loadedTier: String?; private var currentState = "uninitialized"

  public func definition() -> ModuleDefinition {
    Name("TutorSgLlmRuntime")
    Events("onToken", "onError", "onStateChange")

    AsyncFunction("loadModel") { (path: String, tier: String, promise: Promise) in
      self.inferenceQueue.async {
        self.emitState("loading")
        guard FileManager.default.fileExists(atPath: path) else {
          self.sendEvent("onError", ["code": "MODEL_NOT_FOUND", "message": "Model file not found at \(path)", "recoverable": true])
          self.emitState("error"); promise.resolve(["success": false, "modelId": "", "state": "error", "message": "Model file not found"]); return
        }
        self.loadedModelId = (path as NSString).lastPathComponent; self.loadedTier = tier; self.modelLoaded = true; self.currentState = "ready"; self.emitState("ready")
        promise.resolve(["success": true, "modelId": self.loadedModelId ?? "", "state": "ready", "message": "OK"])
      }
    }

    AsyncFunction("generate") { (prompt: String, maxTokens: Int, temperature: Double, topP: Double, promise: Promise) in
      guard self.currentState == "ready" else {
        self.sendEvent("onError", ["code": "MODEL_NOT_LOADED", "message": "Call loadModel first. Current state: \(self.currentState)", "recoverable": true])
        promise.resolve(["text": "", "tokenCount": 0, "latencyMs": 0, "tokensPerSecond": 0]); return
      }
      self.inferenceQueue.async {
        self.emitState("generating"); let startMs = CFAbsoluteTimeGetCurrent() * 1000
        let elapsedMs = (CFAbsoluteTimeGetCurrent() * 1000) - startMs; self.currentState = "ready"; self.emitState("ready")
        promise.resolve(["text": "", "tokenCount": 0, "latencyMs": Int(elapsedMs), "tokensPerSecond": 0])
      }
    }

    AsyncFunction("unloadModel") { (promise: Promise) in
      self.inferenceQueue.async {
        self.loadedModelId = nil; self.loadedTier = nil; self.modelLoaded = false; self.currentState = "uninitialized"; self.emitState("uninitialized")
        promise.resolve()
      }
    }

    Function("getState") { currentState }
    Function("getLoadedModelId") { loadedModelId ?? "" }
    Function("isReady") { currentState == "ready" }
  }

  private func emitState(_ state: String) { currentState = state; sendEvent("onStateChange", state) }
}
