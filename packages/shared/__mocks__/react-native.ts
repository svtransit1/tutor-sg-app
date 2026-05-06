const Platform = {
  OS: 'ios',
  select: (obj: Record<string, unknown>) => ('ios' in obj ? obj.ios : obj.default),
};
const NativeModules = {};
export { Platform, NativeModules };
export default { Platform, NativeModules };
