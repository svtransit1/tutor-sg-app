export type LLMRuntimeState = 'uninitialized' | 'loading' | 'ready' | 'generating' | 'error';
export interface LoadModelParams { modelPath: string; tokenizerPath?: string; tier?: 'high' | 'mid'; }
export interface LoadResult { success: boolean; modelId: string; state: LLMRuntimeState; message?: string; }
export interface GenerateParams { prompt: string; maxTokens?: number; temperature?: number; topP?: number; }
export interface TokenChunk { token: string; index: number; isFinal: boolean; }
export interface GenerateResult { text: string; tokenCount: number; latencyMs: number; tokensPerSecond: number; }
export interface RuntimeError { code: string; message: string; recoverable: boolean; }
export interface RuntimeEvent { type: 'load_progress' | 'token' | 'error' | 'state_change'; payload: unknown; }
export type ModelId = string;
