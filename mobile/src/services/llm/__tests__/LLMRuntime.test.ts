jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(() => null),
  EventEmitter: jest.fn(() => null),
}));

import Platform from 'react-native';

describe('LLMRuntime', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('loads and exports module', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    expect(LLMRuntime).toBeDefined();
    expect(typeof LLMRuntime.load).toBe('function');
    expect(typeof LLMRuntime.generate).toBe('function');
    expect(typeof LLMRuntime.unload).toBe('function');
    expect(typeof LLMRuntime.getState).toBe('function');
  });

  it('returns initial state as uninitialized', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    expect(LLMRuntime.getState()).toBe('uninitialized');
  });

  it('throws when using generate without loading', async () => {
    const { LLMRuntime } = require('../LLMRuntime');
    await expect(
      LLMRuntime.generate({ prompt: 'test' }),
    ).rejects.toThrow('LLMRuntime not available');
  });

  it('reset clears listeners and state', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    LLMRuntime.reset();
    expect(LLMRuntime.getState()).toBe('uninitialized');
  });

  it('onToken returns unsubscribe function', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    const fn = jest.fn();
    const unsub = LLMRuntime.onToken(fn);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('onError returns unsubscribe function', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    const fn = jest.fn();
    const unsub = LLMRuntime.onError(fn);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('onStateChange returns unsubscribe function', () => {
    const { LLMRuntime } = require('../LLMRuntime');
    const fn = jest.fn();
    const unsub = LLMRuntime.onStateChange(fn);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('load returns error result when native module absent', async () => {
    const { LLMRuntime } = require('../LLMRuntime');
    const result = await LLMRuntime.load({
      modelPath: '/fake/model.tflite',
    });
    expect(result.success).toBe(false);
    expect(result.state).toBe('error');
  });

  it('unload rejects when native module absent', async () => {
    const { LLMRuntime } = require('../LLMRuntime');
    await expect(LLMRuntime.unload()).rejects.toThrow(
      'LLMRuntime not available',
    );
  });
});
