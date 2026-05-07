export const Platform = {
  OS: 'ios' as const,
  select: (obj: Record<string, unknown>) => obj.ios ?? obj.default,
};

export const NativeModules = {};
export const StyleSheet = {
  create: <T extends Record<string, object>>(styles: T): T => styles,
};

export default { Platform, NativeModules, StyleSheet };
