import { test, expect } from '../support/merged-fixtures';

test.describe('Quick Log Form Actions', () => {

  test('[P0] weight: should show weight input and submit', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: 'WeightCat' });
    await page.goto('/');

    await page.getByTestId('action-weight').click();
    await page.waitForTimeout(300);

    // Sheet opens with "Pesée"
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Pesée')).toBeVisible();

    // If pet selector shows, pick the first pet
    const petPick = dialog.locator('.animal-pick').first();
    if (await petPick.isVisible().catch(() => false)) {
      await petPick.click();
      await page.waitForTimeout(300);
    }

    // Weight input should be visible now
    const weightInput = page.locator('.weight-input-lg');
    await expect(weightInput).toBeVisible({ timeout: 3000 });

    await weightInput.fill('4.5');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);

    // Sheet should close
    await expect(dialog).toHaveCount(0);
  });

  test('[P0] observation: should show tags and submit', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: 'ObsCat' });
    await page.goto('/');

    await page.getByTestId('action-behavior').click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Observation')).toBeVisible();

    // Pick pet if needed
    const petPick = dialog.locator('.animal-pick').first();
    if (await petPick.isVisible().catch(() => false)) {
      await petPick.click();
      await page.waitForTimeout(300);
    }

    // Tags visible
    await expect(page.getByText('Vomissement')).toBeVisible({ timeout: 3000 });

    // Select a tag
    await page.getByText('Vomissement').click();

    // Submit
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);

    await expect(dialog).toHaveCount(0);
  });

  test('[P0] medicine: should show name input and submit', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: 'MedCat' });
    await page.goto('/');

    await page.getByTestId('action-health_note').click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Médicament')).toBeVisible();

    const petPick = dialog.locator('.animal-pick').first();
    if (await petPick.isVisible().catch(() => false)) {
      await petPick.click();
      await page.waitForTimeout(300);
    }

    await page.getByPlaceholder('Nom du médicament').fill('Vermifuge');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);

    await expect(dialog).toHaveCount(0);
  });

  test('[P0] event: should show note input and submit', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: 'EventCat' });
    await page.goto('/');

    await page.getByTestId('action-custom').click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Événement')).toBeVisible();

    const petPick = dialog.locator('.animal-pick').first();
    if (await petPick.isVisible().catch(() => false)) {
      await petPick.click();
      await page.waitForTimeout(300);
    }

    await page.getByPlaceholder(/passé/).fill('Visite vétérinaire');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);

    await expect(dialog).toHaveCount(0);
  });
});
