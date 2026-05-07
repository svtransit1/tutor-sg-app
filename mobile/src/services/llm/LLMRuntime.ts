import { Platform } from 'react-native';
import { requireNativeModule, EventEmitter, type EventSubscription } from 'expo-modules-core';
import type { LLMRuntimeState, LoadModelParams, LoadResult, GenerateParams, GenerateResult, TokenChunk, RuntimeError } from './types';
let nativeModule: any = null; let emitter: EventEmitter | null = null;
try { nativeModule = requireNativeModule('TutorSgLlmRuntime'); } catch { nativeModule = null; }
if (nativeModule) { try { emitter = new EventEmitter(nativeModule); } catch { emitter = null; } }
if (!nativeModule && process.env.NODE_ENV !== 'test') { console.warn('[LLMRuntime] Native module not available on', Platform.OS); }
let _state: LLMRuntimeState = 'uninitialized'; let _loadedModelId: string | null = null;
const _tokenListeners = new Set<(c: TokenChunk) => void>(); const _errorListeners = new Set<(e: RuntimeError) => void>(); const _stateListeners = new Set<(s: LLMRuntimeState) => void>();
let _tokenSub: EventSubscription | null = null; let _errorSub: EventSubscription | null = null; let _stateSub: EventSubscription | null = null;
function _sub(): void { if (!emitter || _tokenSub) return; _tokenSub = emitter.addListener<TokenChunk>('onToken', (ev) => { for (const f of _tokenListeners) f(ev); }); _errorSub = emitter.addListener<RuntimeError>('onError', (ev) => { for (const f of _errorListeners) f(ev); }); _stateSub = emitter.addListener<LLMRuntimeState>('onStateChange', (ev) => { _state = ev; for (const f of _stateListeners) f(_state); }); }
function _assert(): void { if (!nativeModule) throw new Error('LLMRuntime not available on ' + Platform.OS); }
export async function load(p: LoadModelParams): Promise<LoadResult> { _sub(); _state = 'loading'; _notify('loading'); try { _assert(); const r = await nativeModule.loadModel(p.modelPath, p.tier ?? 'mid'); _state = r.success ? 'ready' : 'error'; _loadedModelId = r.success ? r.modelId : null; _notify(_state); return r; } catch (err) { _state = 'error'; _notify('error'); return { success: false, modelId: p.modelPath, state: 'error', message: err instanceof Error ? err.message : String(err) }; } }
export async function generate(p: GenerateParams, onToken?: (c: TokenChunk) => void): Promise<GenerateResult> { _assert(); if (_state !== 'ready') throw new Error('LLMRuntime not ready (state: ' + _state + '). Call load() first.'); _state = 'generating'; _notify('generating'); const handler = (c: TokenChunk) => { onToken?.(c); }; _tokenListeners.add(handler); try { const raw = await nativeModule.generate(p.prompt, p.maxTokens ?? 512, p.temperature ?? 0.7, p.topP ?? 0.9); _state = 'ready'; _notify('ready'); return { text: raw.text, tokenCount: raw.tokenCount, latencyMs: raw.latencyMs, tokensPerSecond: raw.tokensPerSecond }; } catch (err) { _state = 'error'; _notify('error'); throw err; } finally { _tokenListeners.delete(handler); } }
export async function unload(): Promise<void> { _assert(); await nativeModule.unloadModel(); _state = 'uninitialized'; _loadedModelId = null; _notify('uninitialized'); }
export function getState(): LLMRuntimeState { return _state; }
export function getLoadedModelId(): string | null { return _loadedModelId; }
export function reset(): void { _tokenSub?.remove(); _errorSub?.remove(); _stateSub?.remove(); _tokenSub = null; _errorSub = null; _stateSub = null; _tokenListeners.clear(); _errorListeners.clear(); _stateListeners.clear(); _state = 'uninitialized'; _loadedModelId = null; }
export function onToken(fn: (c: TokenChunk) => void): () => void { _tokenListeners.add(fn); return () => { _tokenListeners.delete(fn); }; }
export function onError(fn: (e: RuntimeError) => void): () => void { _errorListeners.add(fn); return () => { _errorListeners.delete(fn); }; }
export function onStateChange(fn: (s: LLMRuntimeState) => void): () => void { _stateListeners.add(fn); return () => { _stateListeners.delete(fn); }; }
function _notify(s: LLMRuntimeState) { for (const f of _stateListeners) f(s); }
export const LLMRuntime = { load, generate, unload, getState, getLoadedModelId, reset, onToken, onError, onStateChange };
