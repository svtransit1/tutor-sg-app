import { requireNativeModule } from 'expo-modules-core';

export interface TokenChunk {
  token: string;
  index: number;
  isFinal: boolean;
}

export interface RuntimeError {
  code: string;
  message: string;
  recoverable: boolean;
}

export type LLMRuntimeState = 'uninitialized' | 'loading' | 'ready' | 'generating' | 'error';

export interface LoadResult {
  success: boolean;
  modelId: string;
  state: LLMRuntimeState;
  message?: string;
}

export interface GenerateResult {
  text: string;
  tokenCount: number;
  latencyMs: number;
  tokensPerSecond: number;
}

interface TutorSgLlmRuntimeNativeModule {
  loadModel(path: string, tier: string): Promise<LoadResult>;
  generate(prompt: string, maxTokens: number, temperature: number, topP: number): Promise<GenerateResult>;
  unloadModel(): Promise<void>;
  getState(): LLMRuntimeState;
  getLoadedModelId(): string;
  isReady(): boolean;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const NativeModule: TutorSgLlmRuntimeNativeModule =
  requireNativeModule('TutorSgLlmRuntime');

export default NativeModule;
