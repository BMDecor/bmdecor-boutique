import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end test config for the bmdecor boutique.
 *
 * BASE_URL — target site. Defaults to the Monday demo URL on Vercel with the
 * pre-launch gate active. Override for local: `BASE_URL=http://localhost:3000`.
 *
 * PRELAUNCH_BYPASS_TOKEN — if set, tests that exercise the bypass flow run;
 * otherwise they're skipped. Token lives in AWS Secrets Manager at
 * BmDecor/PreviewBypassToken in eu-west-1.
 */
const BASE_URL = process.env.BASE_URL ?? 'https://preview.bmdecor.es';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testIgnore: /api\./ },
  ],
});
