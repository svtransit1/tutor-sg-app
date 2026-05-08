export function runOnJS<T>(fn: T): T { return fn; }
export function runOnUI<T>(fn: T): T { return fn; }
export default { runOnJS, runOnUI };
