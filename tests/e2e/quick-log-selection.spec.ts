import { test, expect } from '../support/merged-fixtures';

test.describe('Quick Log Selection (ATDD - Story 3.4)', () => {

  test.skip('[P0] should open bottom sheet with animal picker when tapping action tile', async ({ page, seedPet }) => {
    const ts = Date.now();
    const pet1 = await seedPet({ name: `Pick1-${ts}` });
    const pet2 = await seedPet({ name: `Pick2-${ts}` });
    await page.goto('/');

    // Tap an action tile (e.g., Litter)
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByRole('button', { name: 'Litter' }).click();

    // Bottom sheet should open with animal picker
    const sheet = page.getByTestId('quick-log-sheet');
    await expect(sheet).toBeVisible();

    // Both pet avatars should be shown
    await expect(sheet.getByText(pet1.name)).toBeVisible();
    await expect(sheet.getByText(pet2.name)).toBeVisible();
  });

  test.skip('[P0] should auto-skip animal picker for single pet', async ({ page, seedPet }) => {
    await seedPet({ name: `Solo-${Date.now()}` });
    await page.goto('/');

    // Tap an action tile
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByRole('button', { name: 'Litter' }).click();

    // Should NOT show animal picker sheet (auto-skip)
    await expect(page.getByTestId('quick-log-sheet')).not.toBeVisible();

    // Should proceed directly to confirmation toast
    await expect(page.getByTestId('confirmation-toast')).toBeVisible();
  });

  test.skip('[P0] should proceed after selecting an animal from multi-pet picker', async ({ page, seedPet }) => {
    const ts = Date.now();
    const pet1 = await seedPet({ name: `Multi1-${ts}` });
    await seedPet({ name: `Multi2-${ts}` });
    await page.goto('/');

    // Tap an action tile
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByRole('button', { name: 'Litter' }).click();

    // Select the first pet
    const sheet = page.getByTestId('quick-log-sheet');
    await sheet.getByText(pet1.name).click();

    // Should proceed to confirmation
    await expect(page.getByTestId('confirmation-toast')).toBeVisible();
  });

  test.skip('[P1] should show resource picker for litter action after animal selection', async ({ page, seedPet }) => {
    const ts = Date.now();
    const pet1 = await seedPet({ name: `Res1-${ts}` });
    await seedPet({ name: `Res2-${ts}` });
    await page.goto('/');

    // Tap the Food action tile (resource-dependent)
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByRole('button', { name: 'Food' }).click();

    // Select animal
    const sheet = page.getByTestId('quick-log-sheet');
    await sheet.getByText(pet1.name).click();

    // Resource picker should appear for food
    await expect(page.getByTestId('resource-picker')).toBeVisible();
  });

  test.skip('[P1] should dismiss sheet on swipe down or backdrop tap', async ({ page, seedPet }) => {
    const ts = Date.now();
    await seedPet({ name: `Dismiss1-${ts}` });
    await seedPet({ name: `Dismiss2-${ts}` });
    await page.goto('/');

    // Open the action sheet
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByRole('button', { name: 'Litter' }).click();

    const sheet = page.getByTestId('quick-log-sheet');
    await expect(sheet).toBeVisible();

    // Tap the backdrop to dismiss
    await page.getByTestId('sheet-backdrop').click();

    // Sheet should be dismissed, no event logged
    await expect(sheet).not.toBeVisible();
  });
});
