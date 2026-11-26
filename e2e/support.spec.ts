import { expect, test } from './fixtures';

test('the header heart leads to the support section from any page', async ({ page }) => {
  await page.goto('/es/operators/filtering');
  await page.getByRole('link', { name: 'Apoya mis proyectos' }).click();
  await expect(page).toHaveURL('/es#support');
  const heading = page.getByRole('heading', { level: 2, name: 'Apoya mis proyectos' });
  await expect(heading).toBeInViewport();
  // Not hidden behind the fixed header
  const header = await page.locator('header').first().boundingBox();
  const title = await heading.boundingBox();
  expect(title!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
});

test('the menu entry leads to the support section', async ({ page, isMobile }) => {
  await page.goto('/en/subjects');
  if (isMobile) await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page
    .getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Support' })
    .click();
  await expect(page).toHaveURL('/en#support');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Support my projects' }),
  ).toBeInViewport();
});

test('the Ko-fi button opens ko-fi.com/jmmgdev in a new tab', async ({ page, context }) => {
  // Do not hit the real Ko-fi site from the tests
  await context.route('https://ko-fi.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Ko-fi</title>' }),
  );
  await page.goto('/en');
  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Buy me a coffee on Ko-fi' }).click(),
  ]);
  await expect(tab).toHaveURL('https://ko-fi.com/jmmgdev');
});
