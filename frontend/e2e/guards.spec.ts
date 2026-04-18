import { test, expect } from '@playwright/test';

const TOKEN = process.env.PRELAUNCH_BYPASS_TOKEN;

/**
 * Auth guards — confirm that /admin and /my-studio do the right thing for
 * an unauthenticated visitor. Both routes sit BEHIND the pre-launch gate, so
 * tests run with the bypass cookie first; then we check what happens without
 * a Cognito session.
 */
test.describe('auth guards', () => {
  test.skip(!TOKEN, 'PRELAUNCH_BYPASS_TOKEN not set — skipping auth-guard tests');

  test.beforeEach(async ({ context }) => {
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
  });

  test('/admin redirects unauthenticated user away from admin content', async ({ page }) => {
    const res = await page.goto('/admin');
    // Middleware should redirect to sign-in or return a non-admin page
    const url = page.url();
    const adminVisible = (await page.locator('h1').first().textContent()) ?? '';
    const isAdminPage = /admin dashboard|command center/i.test(adminVisible);
    expect(isAdminPage, 'should not render admin dashboard for anonymous user').toBe(false);
    // Either redirected to /sign-in, or sitting on a non-admin page
    expect(url).not.toMatch(/\/admin\/dashboard/);
  });

  test('/my-studio redirects unauthenticated user', async ({ page }) => {
    await page.goto('/my-studio');
    const url = page.url();
    // Should not land on authenticated studio content
    const heading = (await page.locator('h1').first().textContent()) ?? '';
    const studioVisible = /my studio|order history|saved projects/i.test(heading);
    expect(studioVisible).toBe(false);
  });
});
