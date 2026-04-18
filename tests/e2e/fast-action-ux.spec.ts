import { test, expect } from '../support/merged-fixtures';

// Serial: shared petId variable across tests; sequential execution required
test.describe.configure({ mode: 'serial' });

test.describe('Fast Action UX (ATDD - Stories 4.1 & 4.2)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'ActionCat' });
    petId = pet.id;
  });

  test('[P0] should display fast action grid on pet profile', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    const grid = page.getByTestId('fast-action-grid');
    await expect(grid).toBeVisible();

    // Should have 4 action buttons
    await expect(page.getByTestId('fast-action-litter')).toBeVisible();
    await expect(page.getByTestId('fast-action-food')).toBeVisible();
    await expect(page.getByTestId('fast-action-weight')).toBeVisible();
    await expect(page.getByTestId('fast-action-health')).toBeVisible();
  });

  test('[P0] should open decision tree when tapping litter action', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    await page.getByTestId('fast-action-litter').click();

    // Decision tree modal should open with litter options
    const modal = page.getByTestId('decision-tree');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('tree-option-blood')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('tree-option-diarrhea')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('tree-option-normal')).toBeVisible({ timeout: 10000 });
  });

  test('[P1] should highlight selected option in decision tree', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });
    await page.getByTestId('fast-action-litter').click();

    await page.getByTestId('tree-option-blood').click();

    await expect(page.getByTestId('tree-option-blood')).toHaveClass(/selected/);
  });

  test('[P0] should open weight input when tapping weight action', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });
    await page.getByTestId('fast-action-weight').click();

    const modal = page.getByTestId('decision-tree');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('weight-input')).toBeVisible();
  });
});
