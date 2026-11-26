import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// map uses the simulated userService: no real network involved
const PAGE = '/en/operators/transformation/map';

/**
 * Clicks the code and waits for CodeMirror to replace the static snippet and take the focus,
 * so that typing goes to the real editor.
 */
async function focusEditor(page: Page) {
  const editor = page.getByRole('textbox', { name: /Editable code example/ });
  await editor.click();
  await expect(editor).toHaveAttribute('contenteditable', 'true');
  await expect(editor).toBeFocused();
}

test('runs the example in the sandbox and shows its output', async ({ page }) => {
  await page.goto(PAGE);
  const playground = page.getByRole('region', { name: 'Interactive playground' });
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.getByText('running', { exact: true })).toBeVisible();
  await expect(
    playground.getByRole('listitem').filter({ hasText: 'John ****--****' }),
  ).toBeVisible();

  await playground.getByRole('button', { name: 'Stop' }).click();
  await expect(playground.getByText('idle', { exact: true })).toBeVisible();
  await expect(playground.getByRole('button', { name: 'Stop' })).toBeHidden();

  await playground.getByRole('button', { name: 'Clear console' }).click();
  await expect(playground.getByText(/Press Run/)).toBeVisible();
});

test('edits the code, runs the edited version and restores it with Reset', async ({
  page,
  isMobile,
}) => {
  await page.goto(PAGE);
  const playground = page.getByRole('region', { name: 'Interactive playground' });
  await focusEditor(page);
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type("console.log('edited by e2e');");
  await expect(playground.getByText('● modified')).toBeVisible();

  // Phones have no Ctrl key (and CodeMirror ignores it on Android): they use the Run button
  if (isMobile) await playground.getByRole('button', { name: 'Run' }).click();
  else await page.keyboard.press('ControlOrMeta+Enter');
  await expect(playground.getByRole('listitem').filter({ hasText: 'edited by e2e' })).toBeVisible();

  await playground.getByRole('button', { name: 'Reset' }).click();
  await expect(playground.getByText('● modified')).toBeHidden();
  await expect(playground.getByRole('textbox', { name: /Editable code example/ })).toContainText(
    'userService',
  );
});

test('reports compile errors in the console', async ({ page }) => {
  await page.goto(PAGE);
  const playground = page.getByRole('region', { name: 'Interactive playground' });
  await focusEditor(page);
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('const = ;');
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.getByText(/Compilation error/)).toBeVisible();
});

test('explains what the example does', async ({ page }) => {
  await page.goto(PAGE);
  const playground = page.getByRole('region', { name: 'Interactive playground' });
  const info = playground.getByRole('button', { name: 'Info: What this example does' });
  await expect(info).toHaveAttribute('aria-expanded', 'false');
  await info.click();
  await expect(info).toHaveAttribute('aria-expanded', 'true');
  await expect(playground.getByRole('region', { name: 'What this example does' })).toBeVisible();
});
