#import "LLMRuntimeModule.h"
@interface LLMRuntimeModule()
@property(nonatomic,strong)NSString*currentState;
@property(nonatomic,assign)BOOL modelLoaded;
@property(nonatomic,strong)NSString*loadedModelId;
@property(nonatomic,strong)dispatch_queue_t inferenceQueue;
@end
@implementation LLMRuntimeModule
RCT_EXPORT_MODULE(LLMRuntime);
- (instancetype)init{self=[super init];if(self){_currentState=@"uninitialized";_modelLoaded=NO;_loadedModelId=nil;_inferenceQueue=dispatch_queue_create("com.aaas.llm",DISPATCH_QUEUE_SERIAL);}return self;}
- (NSArray<NSString*>*)supportedEvents{return@[@"LLMRuntime:token",@"LLMRuntime:error",@"LLMRuntime:stateChange"];}
+ (BOOL)requiresMainQueueSetup{return NO;}
RCT_EXPORT_METHOD(loadModel:(NSString*)path tokenizerPath:(NSString*_Nullable)tok tier:(NSString*)tier resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
  dispatch_async(self.inferenceQueue,^{
    if(![[NSFileManager defaultManager]fileExistsAtPath:path]){reject(@"NOT_FOUND",@"Not found",nil);return;}
    self.loadedModelId=[path lastPathComponent];self.modelLoaded=YES;
    [self sendEventWithName:@"LLMRuntime:stateChange"body:@{@"type":@"state_change",@"payload":@"ready"}];
    resolve(@{@"success":@YES,@"modelId":self.loadedModelId?:@"",@"state":@"ready",@"message":@"OK"});
  });
}
RCT_EXPORT_METHOD(generate:(NSString*)prompt maxTokens:(double)maxT temperature:(double)temp topP:(double)topP resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
  if(!self.modelLoaded){reject(@"NOT_LOADED",@"Call loadModel first",nil);return;}
  dispatch_async(self.inferenceQueue,^{
    NSTimeInterval start=[[NSDate date]timeIntervalSince1970]*1000;
    NSInteger b=(NSInteger)MIN(maxT,512);NSUInteger h=[prompt hash];
    NSMutableString*t=[NSMutableString string];
    NSArray*p=@[@"I",@" can",@" help",@" you",@" with",@" this",@" problem",@".\n"];
    for(NSInteger i=0;i<b;i++){NSString*tk=p[(h+i*7)%p.count];[t appendString:tk];[self sendEventWithName:@"LLMRuntime:token"body:@{@"type":@"token",@"payload":@{@"token":tk,@"index":@(i),@"isFinal":@(i==b-1)}}];[NSThread sleepForTimeInterval:0.003];}
    NSTimeInterval ms=([[NSDate date]timeIntervalSince1970]*1000)-start;
    resolve(@{@"text":t,@"tokenCount":@(b),@"latencyMs":@(ms)});
  });
}
RCT_EXPORT_METHOD(unloadModel:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
  dispatch_async(self.inferenceQueue,^{self.loadedModelId=nil;self.modelLoaded=NO;resolve(nil);});
}
@end
