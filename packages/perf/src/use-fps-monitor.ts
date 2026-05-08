import { useRef, useEffect, useState, useCallback } from 'react'
import { FpsMonitor, FpsStats } from './fps-monitor'

export interface FpsMonitorControls {
  stats: FpsStats
  /** True when FPS has been below 25 for more than 2 seconds */
  lowFpsWarning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

const LOW_FPS_THRESHOLD = 25
const LOW_FPS_SUSTAINED_MS = 2000

export function useFpsMonitor(
  enabled: boolean = typeof __DEV__ !== 'undefined' ? __DEV__ : false,
): FpsMonitorControls {
  const monitorRef = useRef<FpsMonitor | null>(null)
  const lowFpsSince = useRef<number | null>(null)
  const [stats, setStats] = useState<FpsStats>({
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    frameCount: 0,
  })
  const [lowFpsWarning, setLowFpsWarning] = useState(false)

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new FpsMonitor()
    }
    return () => {
      monitorRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    const monitor = monitorRef.current
    if (!monitor) return

    if (!enabled) {
      monitor.stop()
      lowFpsSince.current = null
      setLowFpsWarning(false)
      return
    }

    monitor.start()
    const interval = setInterval(() => {
      const currentStats = monitor.getStats()
      setStats(currentStats)

      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log(`Camera FPS: ${currentStats.current}`)
      }

      // Track sustained low FPS for warning
      if (currentStats.current < LOW_FPS_THRESHOLD && currentStats.current > 0) {
        if (lowFpsSince.current === null) {
          lowFpsSince.current = Date.now()
        } else if (Date.now() - lowFpsSince.current >= LOW_FPS_SUSTAINED_MS) {
          setLowFpsWarning(true)
        }
      } else {
        lowFpsSince.current = null
        setLowFpsWarning(false)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      monitor.stop()
    }
  }, [enabled])

  const start = useCallback(() => monitorRef.current?.start(), [])
  const stop = useCallback(() => monitorRef.current?.stop(), [])
  const reset = useCallback(() => {
    monitorRef.current?.reset()
    lowFpsSince.current = null
    setStats({ current: 0, min: 0, max: 0, avg: 0, frameCount: 0 })
    setLowFpsWarning(false)
  }, [])

  return { stats, lowFpsWarning, start, stop, reset }
}
