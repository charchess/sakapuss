import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: shared browser context, tests navigate to '/' and open the sheet
test.describe.configure({ mode: 'serial' });

test.describe('Quick Log Selection (ATDD - Story 3.4)', () => {

  test('[P0] should open bottom sheet with animal picker when tapping action tile', async ({ page, seedPet }) => {
    const ts = Date.now();
    const pet1 = await seedPet({ name: `Pick1-${ts}` });
    const pet2 = await seedPet({ name: `Pick2-${ts}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tap the Événement action tile (no resource dependency, always visible)
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByTestId('action-custom').click();

    // Bottom sheet should open with animal picker (multi-pet)
    const sheet = page.getByTestId('quick-log-sheet');
    await expect(sheet).toBeVisible();

    // Both pet names should be shown in the picker
    await expect(sheet.getByText(pet1.name)).toBeVisible();
    await expect(sheet.getByText(pet2.name)).toBeVisible();
  });

  test('[P0] should auto-skip animal picker for single pet', async ({ page, seedPet, request, authHeaders }) => {
    // Clean up pets from previous tests in this serial chain so exactly 1 pet exists
    const petsRes = await request.get(`${API_URL}/pets`, { headers: authHeaders });
    const existingPets = await petsRes.json();
    for (const pet of existingPets) {
      await request.delete(`${API_URL}/pets/${pet.id}`, { headers: authHeaders });
    }
    await seedPet({ name: `Solo-${Date.now()}` });
    await page.goto('/');

    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByTestId('action-custom').click();

    await expect(page.getByTestId('quick-log-sheet')).not.toBeVisible();
    await expect(page.getByTestId('confirmation-toast')).toBeVisible();
  });

  test('[P0] should proceed after selecting an animal from multi-pet picker', async ({ page, seedPet }) => {
    const ts = Date.now();
    const pet1 = await seedPet({ name: `Multi1-${ts}` });
    await seedPet({ name: `Multi2-${ts}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tap the Événement action tile
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByTestId('action-custom').click();

    // Select the first pet from the picker
    const sheet = page.getByTestId('quick-log-sheet');
    await sheet.getByText(pet1.name).click();

    // After selecting, the form should still be visible (fills in petId, then shows form)
    await expect(sheet).toBeVisible();
  });

  test.skip('[P1] should show resource picker for litter action after animal selection', async ({ page, seedPet }) => {
    // SKIPPED: Litter tile requires litter resources; resource-picker testid not yet implemented
    const ts = Date.now();
    await seedPet({ name: `Res1-${ts}` });
    await seedPet({ name: `Res2-${ts}` });
    await page.goto('/');

    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByTestId('action-litter_clean').click();

    const sheet = page.getByTestId('quick-log-sheet');
    await sheet.getByText('Res1').click();

    await expect(page.getByTestId('resource-picker')).toBeVisible();
  });

  test('[P1] should dismiss sheet on backdrop tap', async ({ page, seedPet }) => {
    const ts = Date.now();
    await seedPet({ name: `Dismiss1-${ts}` });
    await seedPet({ name: `Dismiss2-${ts}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open the action sheet
    const actionGarden = page.getByTestId('action-garden');
    await actionGarden.getByTestId('action-custom').click();

    const sheet = page.getByTestId('quick-log-sheet');
    await expect(sheet).toBeVisible();

    // Tap the backdrop to dismiss
    await page.getByTestId('sheet-backdrop').click();

    // Sheet should be dismissed
    await expect(sheet).not.toBeVisible();
  });
});
