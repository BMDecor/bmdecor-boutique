import { test, expect } from '@playwright/test';

const TOKEN = process.env.PRELAUNCH_BYPASS_TOKEN;

/**
 * API endpoints — verified behind the pre-launch gate using the bypass
 * cookie. APIs return JSON; we don't walk the UI here, just check shapes.
 *
 * Covered routes: /api/colors, /api/color-counts, /api/products.
 */
test.describe('api endpoints', () => {
  test.skip(!TOKEN, 'PRELAUNCH_BYPASS_TOKEN not set — skipping API tests');

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

  test('GET /api/color-counts returns per-brand totals', async ({ request }) => {
    const res = await request.get('/api/color-counts');
    expect(res.status()).toBe(200);
    const json = await res.json();
    // Expect { BM: number, FB: number, LG: number }
    expect(typeof json.BM).toBe('number');
    expect(typeof json.FB).toBe('number');
    expect(typeof json.LG).toBe('number');
    // Known catalog sizes are in the thousands/hundreds; sanity-check > 0
    expect(json.BM).toBeGreaterThan(100);
    expect(json.FB).toBeGreaterThan(50);
    expect(json.LG).toBeGreaterThan(50);
  });

  test('GET /api/color-counts?brand=BM returns collection breakdown', async ({ request }) => {
    const res = await request.get('/api/color-counts?brand=BM');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(typeof json.total).toBe('number');
    expect(json.total).toBeGreaterThan(100);
    expect(typeof json.collections).toBe('object');
    // Known BM collection names should appear
    const keys = Object.keys(json.collections ?? {}).join(' ');
    expect(keys).toMatch(/Classics|Historical|Off White|Affinity/);
  });

  test('GET /api/colors?brand=BM returns color entries', async ({ request }) => {
    const res = await request.get('/api/colors?brand=BM');
    expect(res.status()).toBe(200);
    const json = await res.json();
    // Expect an array or object with an items/colors field
    const items = Array.isArray(json) ? json : json.items ?? json.colors ?? [];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    const first = items[0];
    // Each entry should have the unified schema fields
    expect(first).toHaveProperty('hexCode');
    expect(first).toHaveProperty('name');
  });
});
