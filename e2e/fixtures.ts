import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, Page } from '@playwright/test';

interface Fixtures {
  /** Console errors, uncaught exceptions and failed requests to our own server. */
  pageErrors: string[];
}

/**
 * Every test fails if the page logs an error, throws, or one of our own requests fails.
 * Tests that expect an error on purpose (the 404 page) clear the list after it happens.
 */
export const test = base.extend<Fixtures>({
  pageErrors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];
      const own = (url: string) => !!baseURL && url.startsWith(baseURL);
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`exception: ${err.message}`));
      page.on('requestfailed', (req) => {
        // Navigations cancel pending requests on purpose
        if (own(req.url()) && req.failure()?.errorText !== 'net::ERR_ABORTED') {
          errors.push(`request failed: ${req.url()} ${req.failure()?.errorText}`);
        }
      });
      page.on('response', (res) => {
        if (own(res.url()) && res.status() >= 400 && res.request().resourceType() !== 'document') {
          errors.push(`HTTP ${res.status()}: ${res.url()}`);
        }
      });
      await use(errors);
      expect(errors, 'page errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Fails on serious or critical accessibility violations found by axe. */
export async function expectAccessible(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map(
      (v) =>
        `${v.impact} ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
    );
  expect(blocking, 'serious or critical accessibility violations').toEqual([]);
}
