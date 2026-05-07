/** @type {import('detox').DetoxConfig} */
module.exports = {
  testRunner: { args: { '$0': 'jest', config: 'e2e/jest.config.js' }, jest: { setupTimeout: 120000 } },
  apps: {
    'ios.debug': { type: 'ios.app', build: 'pnpm exec expo run:ios --configuration Debug', binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/tutor-sg-mobile.app' },
    'ios.release': { type: 'ios.app', build: 'pnpm exec expo run:ios --configuration Release', binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/tutor-sg-mobile.app' },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 15' } },
  },
  configurations: {
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
    'ios.sim.release': { device: 'simulator', app: 'ios.release' },
  },
};
