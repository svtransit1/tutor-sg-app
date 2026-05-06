declare module 'expo-splash-screen';
declare module 'react-native-gesture-handler';
declare module 'react-native-reanimated';

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function expect<T>(actual: T): {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toBeNull(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toHaveLength(expected: number): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toContain(expected: unknown): void;
  resolves: { toBe(expected: unknown): Promise<void>; toEqual(expected: unknown): Promise<void> };
  not: {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toBeNull(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeDefined(): void;
    toHaveLength(expected: number): void;
  };
};

declare module 'react-native-mmkv' {
  export class MMKV {
    set(key: string, value: string): void;
    getString(key: string): string | undefined;
    delete(key: string): void;
  }
}
