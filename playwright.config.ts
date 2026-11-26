import { defineConfig, devices } from '@playwright/test';

// Not the dev server port (4200), so both can run at the same time
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // The route smoke test only runs on desktop: same HTML, twice the time
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: /routes\.spec\.ts/ },
  ],
  webServer: {
    // The production build served by the SSR server, not the dev server
    command: 'npm run build && npm run serve:ssr',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env['CI'],
    timeout: 300_000,
  },
});
