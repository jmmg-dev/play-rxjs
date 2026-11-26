import { CATEGORIES } from '../src/app/content/catalog';
import { LANGS } from '../src/app/content/model';
import { expect, expectAccessible, test } from './fixtures';

/**
 * Every public page, built from the same catalog the app and the sitemap use, so a new
 * section or operator is covered without touching this file.
 */
const PATHS = [
  '',
  ...CATEGORIES.flatMap((c) => [`/${c.path}`, ...c.items.map((i) => `/${c.path}/${i.id}`)]),
];
/** The browser logs the 404 of the document itself; on the error page that one is expected. */
function ignoreDocument404(errors: string[]): void {
  errors.splice(0, errors.length, ...errors.filter((e) => !/status of 404/.test(e)));
}

const ROUTES = LANGS.flatMap((lang) => PATHS.map((path) => `/${lang}${path}`));

test('the sitemap lists exactly the routes under test', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>https:\/\/playrxjs\.com([^<]*)<\/loc>/g)].map((m) => m[1]);
  expect(locs.sort()).toEqual([...ROUTES].sort());
});

for (const route of ROUTES) {
  test(`${route} renders`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    expect((await page.title()).trim()).not.toBe('');
    await expect(page.locator('html')).toHaveAttribute('lang', route.slice(1, 3));
  });
}

test('an unknown page answers with a real 404 and the error page', async ({ page, pageErrors }) => {
  const response = await page.goto('/en/operators/transformation/doesNotExist');
  ignoreDocument404(pageErrors);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
});

test.describe('accessibility (axe, serious and critical issues)', () => {
  for (const lang of LANGS) {
    for (const path of ['', '/operators/transformation', '/operators/transformation/switchMap']) {
      test(`/${lang}${path}`, async ({ page }) => {
        await page.goto(`/${lang}${path}`);
        await expectAccessible(page);
      });
    }
    test(`/${lang} 404 page`, async ({ page, pageErrors }) => {
      await page.goto(`/${lang}/nope`);
      ignoreDocument404(pageErrors);
      await expectAccessible(page);
    });
  }
});
