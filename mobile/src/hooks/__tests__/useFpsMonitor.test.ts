import { renderHook, act } from '@testing-library/react-native';
import { useFpsMonitor } from '@/hooks/useFpsMonitor';

beforeAll(() => { (global as Record<string, unknown>).__DEV__ = true; });
afterAll(() => { delete (global as Record<string, unknown>).__DEV__; });

describe('useFpsMonitor', () => {
  let rafCallbacks: Array<(t: DOMHighResTimeStamp) => void> = [];
  let rafIdCounter = 0;
  let nowValue = 0;
  const origRaf = global.requestAnimationFrame;
  const origCaf = global.cancelAnimationFrame;
  const origNow = performance.now;
  const origWarn = console.warn;

  beforeEach(() => {
    jest.useFakeTimers();
    rafCallbacks = []; rafIdCounter = 0; nowValue = 0;
    (global as Record<string, unknown>).__DEV__ = true;
    global.requestAnimationFrame = (cb) => { const id = ++rafIdCounter; rafCallbacks.push((t) => cb(t)); return id; };
    global.cancelAnimationFrame = () => { rafCallbacks = []; };
    performance.now = () => nowValue;
    console.warn = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.requestAnimationFrame = origRaf;
    global.cancelAnimationFrame = origCaf;
    performance.now = origNow;
    console.warn = origWarn;
  });

  function simulateFrames(fps: number, seconds: number) {
    const interval = 1000 / fps;
    for (let i = 0; i < Math.round(fps * seconds); i++) { nowValue += interval; rafCallbacks.slice().forEach(cb => cb(nowValue)); }
  }

  it('defaults to 60 FPS, not low', () => { const { result } = renderHook(() => useFpsMonitor()); expect(result.current.currentFps).toBe(60); expect(result.current.isLowFps).toBe(false); });
  it('detects sustained low FPS for >2s', () => { const { result } = renderHook(() => useFpsMonitor()); simulateFrames(20, 3); act(() => jest.advanceTimersByTime(0)); expect(result.current.isLowFps).toBe(true); });
  it('resets isLowFps when FPS recovers', () => { const { result } = renderHook(() => useFpsMonitor()); simulateFrames(20, 3); act(() => jest.advanceTimersByTime(0)); expect(result.current.isLowFps).toBe(true); simulateFrames(60, 1); act(() => jest.advanceTimersByTime(0)); expect(result.current.isLowFps).toBe(false); });
  it('warns on capture + FPS < 30', () => { renderHook(() => useFpsMonitor({ isCapturing: true })); simulateFrames(25, 1); act(() => jest.advanceTimersByTime(0)); expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('FPS DROP DURING CAPTURE')); });
  it('no capture warning when not capturing', () => { renderHook(() => useFpsMonitor()); simulateFrames(25, 1); act(() => jest.advanceTimersByTime(0)); expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('FPS DROP DURING CAPTURE')); });
  it('cleans up rAF on unmount', () => { const { unmount } = renderHook(() => useFpsMonitor()); const spy = jest.spyOn(global, 'cancelAnimationFrame'); unmount(); expect(spy).toHaveBeenCalled(); spy.mockRestore(); });
  it('no-op when __DEV__ is false', () => { (global as Record<string, unknown>).__DEV__ = false; const { result } = renderHook(() => useFpsMonitor()); expect(result.current.currentFps).toBe(60); expect(result.current.isLowFps).toBe(false); });
  it('no false positive on single drop', () => { const { result } = renderHook(() => useFpsMonitor()); simulateFrames(25, 1); act(() => jest.advanceTimersByTime(0)); expect(result.current.isLowFps).toBe(false); });
  it('logs FPS to console', () => { const spy = jest.spyOn(console, 'log').mockImplementation(() => {}); renderHook(() => useFpsMonitor()); simulateFrames(45, 2); act(() => jest.advanceTimersByTime(0)); expect(spy).toHaveBeenCalledWith(expect.stringContaining('Camera FPS:')); spy.mockRestore(); });
});
