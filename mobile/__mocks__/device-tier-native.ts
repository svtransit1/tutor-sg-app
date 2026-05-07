let mockMemory = 8;
let mockChipset = 'A18';
let mockNPU = true;

export function __setMockMemory(gb: number) { mockMemory = gb; }
export function __setMockChipset(chipset: string) { mockChipset = chipset; }
export function __setMockNPU(available: boolean) { mockNPU = available; }

export function getTotalMemory(): Promise<number> {
  return Promise.resolve(mockMemory);
}

export function getChipset(): Promise<string> {
  return Promise.resolve(mockChipset);
}

export function isNPUAvailable(): Promise<boolean> {
  return Promise.resolve(mockNPU);
}
