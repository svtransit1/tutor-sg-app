import {NativeModules,NativeEventEmitter,Platform} from 'react-native';
import type {LLMRuntimeState,LoadModelParams,LoadResult,GenerateParams,GenerateResult,TokenChunk,RuntimeError,RuntimeEvent} from './types';

function getNativeLLM(): Record<string,unknown>|null {
  return ((NativeModules as any).LLMRuntime ?? (NativeModules as any).LiteRTRuntime ?? null) as any;
}
function getNativeEmitter(): NativeEventEmitter|null {
  const m=getNativeLLM(); return m?new NativeEventEmitter(m as never):null;
}

let _state:LLMRuntimeState='uninitialized';
let _loadedModelId:string|null=null;
let _tokenListeners=new Set<(c:TokenChunk)=>void>();
let _errorListeners=new Set<(e:RuntimeError)=>void>();
let _stateListeners=new Set<(s:LLMRuntimeState)=>void>();
let _nativeTokenSub:(()=>void)|null=null;
let _nativeErrorSub:(()=>void)|null=null;
let _nativeStateSub:(()=>void)|null=null;

function _sub():void{
  const e=getNativeEmitter();if(_nativeTokenSub||!e)return;
  _nativeTokenSub=e.addListener('LLMRuntime:token',(ev:RuntimeEvent)=>{if(ev.type==='token')for(const f of _tokenListeners)f(ev.payload as TokenChunk);}).remove;
  _nativeErrorSub=e.addListener('LLMRuntime:error',(ev:RuntimeEvent)=>{if(ev.type==='error')for(const f of _errorListeners)f(ev.payload as RuntimeError);}).remove;
  _nativeStateSub=e.addListener('LLMRuntime:stateChange',(ev:RuntimeEvent)=>{if(ev.type==='state_change'){_state=ev.payload as LLMRuntimeState;for(const f of _stateListeners)f(_state);}}).remove;
}
function _assert():void{if(!getNativeLLM())throw new Error('LLMRuntime not available on '+Platform.OS);}

export async function load(p:LoadModelParams):Promise<LoadResult>{
  _sub();_state='loading';_notify('loading');
  try{_assert();const n=getNativeLLM()!;const r=await(n as any).loadModel(p.modelPath,p.tokenizerPath??null,p.tier??'mid');
    _state=r.success?'ready':'error';_loadedModelId=r.success?r.modelId:null;_notify(_state);return r;}
  catch(err){_state='error';_notify('error');return{success:false,modelId:p.modelPath,state:'error',message:err instanceof Error?err.message:String(err)};}
}
export async function generate(p:GenerateParams,onToken?:(c:TokenChunk)=>void):Promise<GenerateResult>{
  _assert();if(_state!=='ready')throw new Error('LLMRuntime not ready (state: '+_state+'). Call load() first.');
  _state='generating';_notify('generating');
  const collected:string[]=[];const handler=(c:TokenChunk)=>{collected.push(c.token);onToken?.(c);};
  _tokenListeners.add(handler);const start=Date.now();
  try{const n=getNativeLLM()!;const raw=await(n as any).generate(p.prompt,p.maxTokens??512,p.temperature??0.7,p.topP??0.9);
    const ms=raw.latencyMs??Date.now()-start;const tc=raw.tokenCount??collected.length;const tps=ms>0?(tc/ms)*1000:0;
    _state='ready';_notify('ready');return{text:raw.text??collected.join(''),tokenCount:tc,latencyMs:ms,tokensPerSecond:Math.round(tps*100)/100};}
  catch(err){_state='error';_notify('error');throw err;}
  finally{_tokenListeners.delete(handler);}
}
export async function unload():Promise<void>{_assert();await(getNativeLLM() as any).unloadModel();_state='uninitialized';_loadedModelId=null;_notify('uninitialized');}
export function getState():LLMRuntimeState{return _state;}
export function getLoadedModelId():string|null{return _loadedModelId;}
export function reset():void{_nativeTokenSub?.();_nativeErrorSub?.();_nativeStateSub?.();_nativeTokenSub=_nativeErrorSub=_nativeStateSub=null;_tokenListeners.clear();_errorListeners.clear();_stateListeners.clear();_state='uninitialized';_loadedModelId=null;}
export function onToken(fn:(c:TokenChunk)=>void):()=>void{_tokenListeners.add(fn);return()=>{_tokenListeners.delete(fn);};}
export function onError(fn:(e:RuntimeError)=>void):()=>void{_errorListeners.add(fn);return()=>{_errorListeners.delete(fn);};}
export function onStateChange(fn:(s:LLMRuntimeState)=>void):()=>void{_stateListeners.add(fn);return()=>{_stateListeners.delete(fn);};}
function _notify(s:LLMRuntimeState){for(const f of _stateListeners)f(s);}
export const LLMRuntime={load,generate,unload,getState,getLoadedModelId,reset,onToken,onError,onStateChange};
