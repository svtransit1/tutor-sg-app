export const runOnJS =
  (fn: Function) =>
  (...args: any[]) =>
    fn(...args);
export const runOnUI =
  (fn: Function) =>
  (...args: any[]) =>
    fn(...args);
export default { runOnJS, runOnUI };
