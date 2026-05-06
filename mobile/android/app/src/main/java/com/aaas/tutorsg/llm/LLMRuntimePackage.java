package com.aaas.tutorsg.llm;
import androidx.annotation.NonNull;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList; import java.util.Collections; import java.util.List;

public class LLMRuntimePackage implements ReactPackage {
  @NonNull @Override
  public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext c) {
    List<NativeModule> m=new ArrayList<>(); m.add(new LLMRuntimeModule(c)); return m;
  }
  @NonNull @Override
  public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext c) {
    return Collections.emptyList();
  }
}
