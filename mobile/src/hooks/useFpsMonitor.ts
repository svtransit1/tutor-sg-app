import { useState, useEffect, useRef } from 'react';

export interface FpsMetrics { currentFps: number; isLowFps: boolean; }
export interface UseFpsMonitorOptions { isCapturing?: boolean; }
const THRESHOLD = 30;

export function useFpsMonitor(options: UseFpsMonitorOptions = {}): FpsMetrics {
  const { isCapturing = false } = options;
  const [fps, setFps] = useState(60);
  const [isLowFps, setIsLowFps] = useState(false);
  const lowFpsSinceRef = useRef(0);
  const isCapturingRef = useRef(isCapturing);
  isCapturingRef.current = isCapturing;

  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && !__DEV__) return;
    let frameCount = 0;
    let lastSecond = performance.now();
    let rafId: number;
    const tick = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastSecond;
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        console.log('Camera FPS: ' + currentFps); // eslint-disable-line no-console
        if (isCapturingRef.current && currentFps < THRESHOLD) {
          console.warn('FPS DROP DURING CAPTURE: ' + currentFps + ' fps (threshold: ' + THRESHOLD + ')');
        }
        setFps(currentFps);
        if (currentFps < THRESHOLD) {
          if (lowFpsSinceRef.current === 0) { lowFpsSinceRef.current = now; }
          else if (now - lowFpsSinceRef.current >= 2000) { setIsLowFps(true); }
        } else { lowFpsSinceRef.current = 0; setIsLowFps(false); }
        frameCount = 0; lastSecond = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return { currentFps: fps, isLowFps };
}
