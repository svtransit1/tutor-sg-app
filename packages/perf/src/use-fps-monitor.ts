import { useState, useEffect, useRef } from 'react';
import type { FpsMetrics } from './types';

export function useFpsMonitor(): FpsMetrics {
  const [fps, setFps] = useState(60);
  const [isLowFps, setIsLowFps] = useState(false);
  const lowFpsSinceRef = useRef(0);
  useEffect(() => {
    let frameCount = 0;
    let lastSecond = Date.now();
    let rafId: number;
    const tick = () => {
      frameCount++;
      const now = Date.now();
      const elapsed = now - lastSecond;
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed);
        setFps(currentFps);
        if (currentFps < 25) {
          if (lowFpsSinceRef.current === 0) { lowFpsSinceRef.current = now; }
          else if (now - lowFpsSinceRef.current >= 2000) { setIsLowFps(true); }
        } else { lowFpsSinceRef.current = 0; setIsLowFps(false); }
        frameCount = 0;
        lastSecond = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return { currentFps: fps, isLowFps };
}
