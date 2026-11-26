import { expect, test } from './fixtures';

test('goes from the home page to a section, an operator and through the pager', async ({
  page,
}) => {
  await page.goto('/en');
  await page
    .getByRole('main')
    .getByRole('link', { name: /Transformation operators/ })
    .click();
  await expect(page).toHaveURL('/en/operators/transformation');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Transformation');

  // The card of switchMap, not switchMapTo
  await page
    .getByRole('main')
    .getByRole('link', { name: /^switchMap / })
    .click();
  await expect(page).toHaveURL('/en/operators/transformation/switchMap');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('switchMap');

  const next = page.getByRole('link', { name: /^Next/ });
  const nextName = (await next.locator('.pager__name').textContent())?.trim() ?? '';
  await next.click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(nextName);

  await page.getByRole('link', { name: /^Previous/ }).click();
  await expect(page).toHaveURL('/en/operators/transformation/switchMap');

  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await crumbs.getByRole('link', { name: 'Transformation operators' }).click();
  await expect(page).toHaveURL('/en/operators/transformation');
  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Home' })
    .click();
  await expect(page).toHaveURL('/en');
});

test('the skip link moves the focus to the main content', async ({ page }) => {
  await page.goto('/en/operators/filtering');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test.describe('desktop sidebar', () => {
  test.skip(({ isMobile }) => isMobile, 'On phones the sidebar is a drawer, covered below');

  test('is always visible and opens the section of the current page', async ({ page }) => {
    await page.goto('/en/operators/filtering/filter');
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'filter', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await nav.getByRole('link', { name: 'Subjects' }).first().click();
    await expect(page).toHaveURL('/en/subjects');
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'The drawer only exists on small screens');

  test('opens, navigates and closes after following a link', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(nav).not.toBeInViewport();
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(nav).toBeInViewport();
    await nav.getByRole('link', { name: 'Subjects' }).first().click();
    await expect(page).toHaveURL('/en/subjects');
    await expect(nav).not.toBeInViewport();
  });

  test('closes with the close button and with Escape', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    const open = page.getByRole('button', { name: 'Open navigation menu' });
    await open.click();
    await page.getByRole('button', { name: 'Close navigation menu' }).click();
    await expect(nav).not.toBeInViewport();
    await open.click();
    await expect(nav).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(nav).not.toBeInViewport();
    await expect(open).toHaveAttribute('aria-expanded', 'false');
  });

  test('shows the PRx logo as the home link', async ({ page }) => {
    await page.goto('/en/subjects');
    await page.getByRole('banner').getByRole('link', { name: 'Play RxJS — Home' }).click();
    await expect(page).toHaveURL('/en');
  });
});
