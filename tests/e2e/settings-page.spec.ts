import { test, expect } from '../support/merged-fixtures';

test.describe('Settings Page (ATDD - Story 1.5)', () => {

  test.skip('[P0] should display all three settings sections', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  });

  test.skip('[P0] should change language to French and verify UI switches', async ({ page }) => {
    await page.goto('/settings');

    // Select French from language options
    await page.getByRole('combobox', { name: 'Language' }).selectOption('fr');

    // Verify the UI has switched to French
    await expect(page.getByRole('heading', { name: 'Compte' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Langue' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  });

  test.skip('[P1] should update display name and show success toast', async ({ page }) => {
    await page.goto('/settings');

    const newName = `TestUser-${Date.now()}`;
    await page.getByLabel('Display name').clear();
    await page.getByLabel('Display name').fill(newName);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify success toast appears
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('saved', { exact: false })).toBeVisible();

    // Verify name persists after reload
    await page.reload();
    await expect(page.getByLabel('Display name')).toHaveValue(newName);
  });
});
