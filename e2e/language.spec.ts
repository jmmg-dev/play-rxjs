import { expect, test } from './fixtures';

test('switches language keeping the current page', async ({ page }) => {
  await page.goto('/en/operators/transformation/switchMap');
  const languages = page.getByRole('navigation', { name: 'Language' });
  await languages.getByRole('link', { name: 'ES' }).click();
  await expect(page).toHaveURL('/es/operators/transformation/switchMap');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(
    page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: 'ES' }),
  ).toHaveAttribute('aria-current', 'true');

  await page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL('/en/operators/transformation/switchMap');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('remembers the chosen language for the root url', async ({ page }) => {
  await page.goto('/en');
  await page
    .getByRole('navigation', { name: 'Language' })
    .getByRole('link', { name: 'ES' })
    .click();
  await expect(page).toHaveURL('/es');
  await page.goto('/');
  await expect(page).toHaveURL('/es');
});

test('redirects the root url to the browser language when nothing was chosen', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL('/es');
  await context.close();
});

for (const [lang, texts] of Object.entries({
  en: { section: 'Filtering operators', heading: 'Filtering', run: 'Run' },
  es: { section: 'Operadores de filtración', heading: 'filtración', run: 'Ejecutar' },
})) {
  test(`browses a section and an operator in ${lang}`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await page.getByRole('main').getByRole('link', { name: texts.section }).click();
    await expect(page).toHaveURL(`/${lang}/operators/filtering`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(texts.heading);
    await page
      .getByRole('main')
      .getByRole('link', { name: /^filter / })
      .click();
    await expect(page).toHaveURL(`/${lang}/operators/filtering/filter`);
    await expect(page.getByRole('button', { name: texts.run })).toBeVisible();
  });
}
