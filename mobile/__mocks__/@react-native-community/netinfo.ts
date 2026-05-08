/** Mock for @react-native-community/netinfo. */

let _isConnected = true;
let _type = 'wifi';
let _listeners: Array<(state: { isConnected: boolean; type: string }) => void> = [];

export function __setConnected(connected: boolean, type: string = 'wifi') {
  _isConnected = connected;
  _type = type;
}

export function __resetNetInfo() {
  _isConnected = true;
  _type = 'wifi';
  _listeners = [];
}

export function __simulateReconnect() {
  _isConnected = true;
  _type = 'wifi';
  for (const fn of _listeners) {
    fn({ isConnected: true, type: 'wifi' });
  }
}

export async function fetch() {
  return { isConnected: _isConnected, type: _type };
}

export function addEventListener(fn: (state: { isConnected: boolean; type: string }) => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

export default { fetch, addEventListener };
