export const Platform = {
  OS: 'ios' as const,
  select: (obj: Record<string, unknown>) => obj.ios ?? obj.default,
};
export const NativeModules = {};
export default { Platform, NativeModules };
