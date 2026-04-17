import { test, expect } from '../support/merged-fixtures';

// Serial: prevents concurrent seedPets from creating a multi-pet dashboard
test.describe.configure({ mode: 'serial' });

test.describe('Quick Log Form Actions', () => {

  /** If the pet-picker is showing, select the first pet and wait for the form to appear. */
  async function maybeSelectPet(page: any) {
    const dialog = page.getByRole('dialog');
    const pick = dialog.locator('.animal-pick').first();
    try {
      await pick.waitFor({ state: 'visible', timeout: 1500 });
      await pick.click();
      // Wait for Svelte to remove the picker and show the form
      await pick.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    } catch {
      // No pet picker → single-pet auto-select flow, form is already visible
    }
  }

  test('[P0] weight: should show weight input and submit', async ({ page, seedPet }) => {
    await seedPet({ name: 'WeightCat' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByTestId('action-weight').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Pesée')).toBeVisible();
    await maybeSelectPet(page);

    const weightInput = page.locator('.weight-input-lg');
    await expect(weightInput).toBeVisible({ timeout: 3000 });
    await weightInput.fill('4.5');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
  });

  test('[P0] observation: should show tags and submit', async ({ page, seedPet }) => {
    await seedPet({ name: 'ObsCat' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByTestId('action-behavior').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Observation')).toBeVisible();
    await maybeSelectPet(page);

    await expect(page.getByText('Vomissement')).toBeVisible({ timeout: 3000 });
    await page.getByText('Vomissement').click();
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
  });

  test('[P0] medicine: should show name input and submit', async ({ page, seedPet }) => {
    await seedPet({ name: 'MedCat' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByTestId('action-health_note').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Médicament')).toBeVisible();
    await maybeSelectPet(page);

    const medInput = page.getByPlaceholder('Nom du médicament');
    await expect(medInput).toBeVisible();
    await medInput.fill('Vermifuge');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
  });

  test('[P0] event: should show note input and submit', async ({ page, seedPet }) => {
    await seedPet({ name: 'EventCat' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByTestId('action-custom').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Événement')).toBeVisible();
    await maybeSelectPet(page);

    const noteInput = page.getByPlaceholder(/passé/);
    await expect(noteInput).toBeVisible({ timeout: 3000 });
    await noteInput.fill('Visite vétérinaire');
    await page.locator('.btn-log').click();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
  });
});
