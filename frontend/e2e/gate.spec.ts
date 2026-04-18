import { test, expect } from '@playwright/test';

const TOKEN = process.env.PRELAUNCH_BYPASS_TOKEN;

/**
 * Pre-launch gate — verifies the `PRELAUNCH_MODE=true` behavior on
 * preview.bmdecor.es:
 *
 *   - Without bypass: coming-soon fallback is served, noindex header set.
 *   - With ?preview=<token>: real site served, bypass cookie persisted.
 *   - Cookie alone (no token): navigation continues unblocked.
 */
test.describe('pre-launch gate', () => {
  test('coming-soon served when no bypass', async ({ page, context }) => {
    // Fresh context — no bypass cookie
    await context.clearCookies();
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Coming Soon/i);
    await expect(page.locator('h1')).toContainText('BM Decoración');
  });

  test('coming-soon page carries X-Robots-Tag noindex', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const robots = res.headers()['x-robots-tag'] ?? '';
    expect(robots).toMatch(/noindex/i);
  });

  test.describe('bypass (requires PRELAUNCH_BYPASS_TOKEN env)', () => {
    test.skip(!TOKEN, 'PRELAUNCH_BYPASS_TOKEN not set — skipping bypass flow');

    test('bypass URL grants access and sets bm_prelaunch_bypass cookie', async ({ page, context }) => {
      await context.clearCookies();
      await page.goto(`/?preview=${TOKEN}`);
      await expect(page).toHaveTitle(/Premium Paint Boutique/);

      const cookies = await context.cookies();
      const bypass = cookies.find((c) => c.name === 'bm_prelaunch_bypass');
      expect(bypass, 'bypass cookie should be set').toBeDefined();
      expect(bypass?.value).toBe('1');
      expect(bypass?.httpOnly).toBe(true);
    });

    test('cookie alone keeps gate bypassed on subsequent navigation', async ({ page, context }) => {
      await context.clearCookies();
      await context.addCookies([
        {
          name: 'bm_prelaunch_bypass',
          value: '1',
          domain: 'preview.bmdecor.es',
          path: '/',
          httpOnly: true,
          secure: true,
        },
      ]);
      await page.goto('/');
      await expect(page).toHaveTitle(/Premium Paint Boutique/);
    });

    test('wrong token is rejected and falls back to coming-soon', async ({ page, context }) => {
      await context.clearCookies();
      await page.goto('/?preview=wrong-token');
      await expect(page).toHaveTitle(/Coming Soon/i);
    });
  });
});
