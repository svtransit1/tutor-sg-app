// @tutor-sg/perf — Performance monitoring for tutor-sg

export interface PerfMetrics {
  fps: number
  memoryMB: number
  cpuPercent: number
}

export async function getPerfMetrics(): Promise<PerfMetrics> {
  return { fps: 60, memoryMB: 0, cpuPercent: 0 }
}

export function startPerfTracking(): void {
  // no-op stub
}

export function stopPerfTracking(): void {
  // no-op stub
}
