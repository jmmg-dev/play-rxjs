import { expect, test } from './fixtures';

test('finds an operator from the search button and opens it with Enter', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: 'Search operators…' }).click();
  const input = page.getByRole('combobox', { name: 'Search the documentation' });
  await expect(input).toBeFocused();
  await input.fill('switchmap');
  await expect(page.getByRole('option').first()).toContainText('switchMap');
  await input.press('Enter');
  await expect(page).toHaveURL('/en/operators/transformation/switchMap');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('opens with Ctrl+K, moves with the arrow keys and closes with Escape', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Keyboard shortcuts need a physical keyboard');
  await page.goto('/es');
  const input = page.getByRole('combobox', { name: 'Buscar en la documentación' });
  // The shortcut listener exists once the app has loaded: retry the key press until then
  await expect(async () => {
    await page.keyboard.press('Control+k');
    await expect(input).toBeFocused({ timeout: 1_000 });
  }).toPass();
  await input.fill('map');
  const options = page.getByRole('option');
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
  await input.press('ArrowDown');
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
  await input.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('says when nothing matches and navigates when a result is clicked', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('button', { name: 'Search operators…' }).click();
  const input = page.getByRole('combobox', { name: 'Search the documentation' });
  await input.fill('zzzz');
  await expect(page.getByRole('listbox')).toContainText('zzzz');
  await input.fill('debounce');
  await page.getByRole('option', { name: /debounceTime/ }).click();
  await expect(page).toHaveURL('/en/operators/filtering/debounceTime');
});
