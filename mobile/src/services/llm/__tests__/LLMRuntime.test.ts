import {NativeModules,NativeEventEmitter} from 'react-native';
import {load,generate,unload,getState,getLoadedModelId,reset,onToken,onError,onStateChange} from '../LLMRuntime';
import type {TokenChunk} from '../types';
const mockLoadModel=jest.fn();const mockGenerate=jest.fn();const mockUnloadModel=jest.fn();

function createMockEmitter(){
  const listeners=new Map<string,Set<(...a:any[])=>void>>();
  return{
    addListener:jest.fn((t:string,l:(...a:any[])=>void)=>{if(!listeners.has(t))listeners.set(t,new Set());listeners.get(t)!.add(l);return{remove:jest.fn(()=>{listeners.get(t)?.delete(l);})};}),
    emit:jest.fn((t:string,...a:any[])=>{listeners.get(t)?.forEach(f=>f(...a));}),
    removeAllListeners:jest.fn(),removeSubscription:jest.fn(),
  };
}
let mockEmitter:ReturnType<typeof createMockEmitter>;

beforeEach(()=>{jest.clearAllMocks();reset();mockEmitter=createMockEmitter();
  (NativeModules as any).LLMRuntime={loadModel:mockLoadModel,generate:mockGenerate,unloadModel:mockUnloadModel};
  (NativeEventEmitter as jest.Mock).mockImplementation(()=>mockEmitter);
  mockLoadModel.mockResolvedValue({success:true,modelId:'gemma-e2b-test',state:'ready',message:'OK'});
  mockGenerate.mockImplementation(async()=>{
    const tokens=['I',' can',' help',' you',' with',' this',' problem','.'];
    for(let i=0;i<tokens.length;i++)mockEmitter.emit('LLMRuntime:token',{type:'token',payload:{token:tokens[i],index:i,isFinal:i===tokens.length-1}});
    return{text:'I can help.',tokenCount:8,latencyMs:150};
  });
  mockUnloadModel.mockResolvedValue(undefined);
});
afterEach(()=>{reset();jest.restoreAllMocks();});

describe('load',()=>{
  it('calls native with correct args',async()=>{
    const r=await load({modelPath:'/m.tflite',tokenizerPath:'/t.tok',tier:'mid'});
    expect(mockLoadModel).toHaveBeenCalledWith('/m.tflite','/t.tok','mid');expect(r.success).toBe(true);
  });
  it('transitions loading→ready',async()=>{
    const states:string[]=[];onStateChange(s=>states.push(s));
    await load({modelPath:'/m.tflite'});expect(states).toEqual(['loading','ready']);
  });
  it('sets loadedModelId',async()=>{await load({modelPath:'/m.tflite'});expect(getLoadedModelId()).toBe('gemma-e2b-test');});
  it('handles native failure',async()=>{mockLoadModel.mockRejectedValueOnce(new Error('bad'));
    const r=await load({modelPath:'/b.tflite'});expect(r.success).toBe(false);expect(r.state).toBe('error');
  });
  it('null tokenizer',async()=>{await load({modelPath:'/m.tflite'});expect(mockLoadModel).toHaveBeenCalledWith('/m.tflite',null,'mid');});
  it('tier high',async()=>{await load({modelPath:'/m.tflite',tier:'high'});expect(mockLoadModel).toHaveBeenCalledWith('/m.tflite',null,'high');});
  it('no native module',async()=>{delete(NativeModules as any).LLMRuntime;delete(NativeModules as any).LiteRTRuntime;
    const r=await load({modelPath:'/m.tflite'});expect(r.success).toBe(false);expect(r.state).toBe('error');
  });
});

describe('generate',()=>{
  beforeEach(async()=>{await load({modelPath:'/m.tflite'});});
  it('calls native with args',async()=>{await generate({prompt:'2+2?',maxTokens:256,temperature:0.5,topP:0.8});
    expect(mockGenerate).toHaveBeenCalledWith('2+2?',256,0.5,0.8);
  });
  it('returns result',async()=>{mockGenerate.mockResolvedValueOnce({text:'4',tokenCount:1,latencyMs:50});
    const r=await generate({prompt:'?'});expect(r.text).toBe('4');expect(r.tokenCount).toBe(1);
  });
  it('fires onToken per token',async()=>{const chunks:TokenChunk[]=[];await generate({prompt:'Hi'},c=>chunks.push(c));
    expect(chunks.length).toBe(8);expect(chunks[0].token).toBe('I');expect(chunks[7].isFinal).toBe(true);
  });
  it('uses defaults',async()=>{await generate({prompt:'T'});expect(mockGenerate).toHaveBeenCalledWith('T',512,0.7,0.9);});
  it('throws if not loaded',async()=>{await unload();await expect(generate({prompt:'T'})).rejects.toThrow(/not ready/);});
  it('returns to ready',async()=>{await generate({prompt:'T'});expect(getState()).toBe('ready');});
  it('computes tokensPerSecond',async()=>{mockGenerate.mockResolvedValueOnce({text:'abc',tokenCount:3,latencyMs:500});const r=await generate({prompt:'T'});expect(r.tokensPerSecond).toBe(6);});
  it('handles native failure',async()=>{mockGenerate.mockRejectedValueOnce(new Error('OOM'));await expect(generate({prompt:'T'})).rejects.toThrow('OOM');expect(getState()).toBe('error');});
});

describe('unload',()=>{
  it('calls native and resets state',async()=>{await load({modelPath:'/m.tflite'});await unload();
    expect(mockUnloadModel).toHaveBeenCalled();expect(getState()).toBe('uninitialized');expect(getLoadedModelId()).toBeNull();
  });
});

describe('events',()=>{
  it('onToken add/remove',()=>{const f=jest.fn();const u=onToken(f);u();expect(f).not.toHaveBeenCalled();});
  it('onError add/remove',()=>{const f=jest.fn();const u=onError(f);u();expect(f).not.toHaveBeenCalled();});
  it('multiple listeners',async()=>{const fns=[jest.fn(),jest.fn()];const u=fns.map(f=>onToken(f));await load({modelPath:'/m.tflite'});await generate({prompt:'T'},fns[0]);expect(fns[0]).toHaveBeenCalled();u.forEach(u=>u());});
});

describe('edge',()=>{
  it('starts uninitialized',()=>{expect(getState()).toBe('uninitialized');});
  it('load/unload/load cycle',async()=>{await load({modelPath:'/m1.tflite'});const id1=getLoadedModelId();await unload();
    mockLoadModel.mockResolvedValueOnce({success:true,modelId:'m2',state:'ready'});await load({modelPath:'/m2.tflite'});expect(getLoadedModelId()).toBe('m2');expect(id1).not.toBe(getLoadedModelId());
  });
});
