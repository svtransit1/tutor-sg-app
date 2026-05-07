declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
}

declare module 'expo-device' {
  export const modelName: string;
  export const deviceName: string;
  export const osName: string;
  export const osVersion: string;
  export const totalMemory: number;
  const Device: {
    modelName?: string;
    deviceName?: string;
    osName?: string;
    osVersion?: string;
  };
  export default Device;
}
