describe('App launch (smoke)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('launches and renders the app root', async () => {
    await expect(element(by.id('app-root'))).toBeVisible();
  });
});
