/**
 * E2E smoke test — validates the app launches and renders the onboarding.
 * Run: pnpm exec detox test --configuration ios.sim.debug
 */
describe('smoke', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show the welcome screen on first launch', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
  });
});
