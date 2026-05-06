package com.aaas.tutorsg.llm;
import android.util.Log;
import androidx.annotation.NonNull; import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments; import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext; import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod; import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.io.File; import java.util.concurrent.ExecutorService; import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean; import java.util.concurrent.atomic.AtomicReference;
public class LLMRuntimeModule extends ReactContextBaseJavaModule {
  private static final String TAG="LLMRuntime", MODULE_NAME="LLMRuntime";
  private static final String EVT_TOKEN="LLMRuntime:token", EVT_ERR="LLMRuntime:error", EVT_STATE="LLMRuntime:stateChange";
  private final ReactApplicationContext ctx;
  private final ExecutorService exec=Executors.newSingleThreadExecutor();
  private final AtomicReference<String> state=new AtomicReference<>("uninitialized");
  private final AtomicBoolean loaded=new AtomicBoolean(false);
  private String modelId=null;
  public LLMRuntimeModule(ReactApplicationContext c){ctx=c;}
  @Override @NonNull public String getName(){return MODULE_NAME;}
  @ReactMethod
  public void loadModel(String path,@Nullable String tokPath,String tier,Promise p){
    exec.execute(()->{try{
      emit(EVT_STATE,event("state_change","loading"));
      File f=new File(path);
      if(!f.exists()){p.reject("MODEL_NOT_FOUND","Not found");return;}
      if(f.length()==0){p.reject("MODEL_EMPTY","Empty");return;}
      modelId=f.getName();loaded.set(true);
      WritableMap r=Arguments.createMap();r.putBoolean("success",true);r.putString("modelId",modelId);r.putString("state","ready");r.putString("message","OK");
      emit(EVT_STATE,event("state_change","ready"));p.resolve(r);
    }catch(Exception e){Log.e(TAG,"load fail",e);p.reject("LOAD_FAILED",e.getMessage());}});
  }
  @ReactMethod
  public void generate(String prompt,double maxT,double temp,double topP,Promise p){
    if(!loaded.get()){p.reject("MODEL_NOT_LOADED","Call loadModel first");return;}
    exec.execute(()->{try{
      long start=System.currentTimeMillis();
      int b=(int)Math.min(maxT,512);int hash=prompt.hashCode()&0x7FFFFFFF;
      String[] pf={"I"," can"," help"," you"," with"," this"," problem",".\n"};
      StringBuilder sb=new StringBuilder();
      for(int i=0;i<b;i++){
        String t=pf[(hash+i*7)%pf.length];sb.append(t);
        WritableMap tk=Arguments.createMap();tk.putString("token",t);tk.putInt("index",i);tk.putBoolean("isFinal",i==b-1);
        emit(EVT_TOKEN,event("token",tk));try{Thread.sleep(3);}catch(InterruptedException e){break;}
      }
      long ms=System.currentTimeMillis()-start;
      WritableMap r=Arguments.createMap();r.putString("text",sb.toString());r.putInt("tokenCount",b);r.putDouble("latencyMs",ms);
      emit(EVT_STATE,event("state_change","ready"));p.resolve(r);
    }catch(Exception e){Log.e(TAG,"gen fail",e);p.reject("GEN_FAILED",e.getMessage());}});
  }
  @ReactMethod
  public void unloadModel(Promise p){exec.execute(()->{modelId=null;loaded.set(false);p.resolve(null);});}
  private void emit(String n,WritableMap d){if(ctx.hasActiveReactInstance())ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(n,d);}
  private WritableMap event(String t,Object d){WritableMap e=Arguments.createMap();e.putString("type",t);if(d instanceof String)e.putString("payload",(String)d);else e.putMap("payload",(WritableMap)d);return e;}
}
