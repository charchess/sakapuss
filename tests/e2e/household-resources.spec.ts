import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Household Resources (ATDD - Story 3.6)', () => {

  test('[P0] should navigate to Household Resources page from Settings', async ({ page }) => {
    await page.goto('/settings');

    await page.getByRole('link', { name: /ressources/i }).click();

    await expect(page).toHaveURL('/settings/resources');
    await expect(page.getByRole('heading', { name: 'Ressources du foyer' })).toBeVisible();
  });

  test('[P0] should add a new resource and verify it appears in the list', async ({ page }) => {
    await page.goto('/settings/resources');

    await page.getByRole('button', { name: 'Ajouter' }).click();

    // Fill resource form
    await page.getByLabel('Nom').fill('Caisse cuisine');
    await page.getByLabel('Type').selectOption('litter');

    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // Verify it appears in the list
    const resourceList = page.getByTestId('resource-list');
    await expect(resourceList).toContainText('Caisse cuisine');
    await expect(resourceList).toContainText('Litière');
  });

  test('[P0] should edit an existing resource name and verify the update', async ({ page, request, authHeaders }) => {
    // Seed a resource via API
    await request.post(`${API_URL}/resources`, {
      data: { name: `Caisse salon-${Date.now()}`, type: 'litter' },
      headers: authHeaders,
    });

    await page.goto('/settings/resources');

    // Find and edit the resource
    const resourceCard = page.getByTestId('resource-card').filter({ hasText: /Caisse salon/ });
    await resourceCard.getByRole('button', { name: 'Modifier' }).click();

    await page.getByLabel('Nom').clear();
    await page.getByLabel('Nom').fill('Caisse chambre');
    await page.getByRole('button', { name: 'Enregistrer' }).click();

    // Verify updated name
    await expect(page.getByTestId('resource-list')).toContainText('Caisse chambre');
  });

  test('[P0] should delete a resource and verify its removal', async ({ page, request, authHeaders }) => {
    const ts = Date.now();
    await request.post(`${API_URL}/resources`, {
      data: { name: `CaisseDelete-${ts}`, type: 'litter' },
      headers: authHeaders,
    });

    await page.goto('/settings/resources', { waitUntil: 'networkidle' });

    const resourceCard = page.getByTestId('resource-card').filter({ hasText: `CaisseDelete-${ts}` });
    await resourceCard.getByRole('button', { name: 'Supprimer' }).click();

    // Confirm deletion
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmer' }).click();

    // Verify removal
    await expect(page.getByTestId('resource-list')).not.toContainText(`CaisseDelete-${ts}`);
  });

  test('[P1] should show resources as chips in Quick Log selection for litter action', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `LitterCat-${Date.now()}` });

    await request.post(`${API_URL}/resources`, {
      data: { name: 'Caisse cuisine', type: 'litter' },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}`);

    // Open quick log for litter
    await page.getByRole('button', { name: /litière/i }).click();

    const resourceChips = page.getByTestId('resource-chip');
    await expect(resourceChips.first()).toBeVisible();
    await expect(page.getByTestId('resource-chip').filter({ hasText: 'Caisse cuisine' }).first()).toBeVisible();
  });
});
