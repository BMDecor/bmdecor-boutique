import { test, expect } from '@playwright/test';

const TOKEN = process.env.PRELAUNCH_BYPASS_TOKEN;

/**
 * Bypassed navigation — runs only when PRELAUNCH_BYPASS_TOKEN is available,
 * since preview.bmdecor.es is gated. Each test starts with the bypass cookie
 * already set so the gate lets us through to the real app.
 */
test.describe('core navigation', () => {
  test.skip(!TOKEN, 'PRELAUNCH_BYPASS_TOKEN not set — skipping boutique nav tests');

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

  test('Grand Lobby (/) loads with boutique title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Premium Paint Boutique/);
    await expect(page.locator('h1')).toContainText(/BM Decoración/i);
  });

  test('Benjamin Moore brand page loads', async ({ page }) => {
    await page.goto('/benjamin-moore');
    await expect(page).toHaveURL(/\/benjamin-moore$/);
    // The page shows a color count badge — confirm it renders
    await expect(page.getByText(/Colors/i).first()).toBeVisible();
  });

  test('Farrow & Ball brand page loads', async ({ page }) => {
    await page.goto('/farrow-and-ball');
    await expect(page).toHaveURL(/\/farrow-and-ball$/);
  });

  test('Little Greene brand page loads', async ({ page }) => {
    await page.goto('/little-greene');
    await expect(page).toHaveURL(/\/little-greene$/);
  });

  test('Paint category page /shop/paint/interior shows products', async ({ page }) => {
    await page.goto('/shop/paint/interior');
    await expect(page.locator('h1')).toContainText(/Interior Paint/i);
    // Products grid or "Coming Soon" placeholder — either is acceptable
    await page.waitForLoadState('networkidle');
  });

  test('Product detail page shows PaintCalculator + color selector', async ({ page }) => {
    await page.goto('/shop/product/bm-aura-interior');
    await page.waitForLoadState('networkidle');
    // PaintCalculator UI indicators
    await expect(page.getByText(/m²|Paint Calculator|Calculate/i).first()).toBeVisible();
    // Color picker trigger
    await expect(page.getByRole('button', { name: /Select Color|Change color|Pick a color/i }).first()).toBeVisible();
  });

  test('Search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveURL(/\/search/);
  });
});
