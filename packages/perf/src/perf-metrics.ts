export interface PerfMetrics {
  fps: number
  memoryMB: number
  cpuPercent: number
}

export async function getPerfMetrics(): Promise<PerfMetrics> {
  return { fps: 60, memoryMB: 0, cpuPercent: 0 }
}
