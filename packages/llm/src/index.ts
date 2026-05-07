// @tutor-sg/llm — On-device LLM runtime abstraction

export interface LLMModel {
  name: string
  sizeBytes: number
  minTier: 'low' | 'mid' | 'high'
}

export interface LLMInferenceResult {
  text: string
  tokens: number
  latencyMs: number
}

export interface LLM {
  loadModel(model: LLMModel): Promise<void>
  generate(prompt: string): Promise<LLMInferenceResult>
  unload(): Promise<void>
}

export const AVAILABLE_MODELS: LLMModel[] = []

export default null as unknown as LLM
