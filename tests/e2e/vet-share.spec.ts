import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Vet Sharing (ATDD - Story 7.2)', () => {

  test.skip('[P0] should display animal multi-select, email input, and preview section', async ({ page, seedPet }) => {
    const pet1 = await seedPet({ name: `ShareCat1-${Date.now()}` });
    const pet2 = await seedPet({ name: `ShareCat2-${Date.now()}` });

    await page.goto('/settings/vet-sharing');

    // Animal multi-select
    const animalSelect = page.getByTestId('animal-multi-select');
    await expect(animalSelect).toBeVisible();

    // Email input
    await expect(page.getByLabel('Email du vétérinaire')).toBeVisible();

    // Preview section
    await expect(page.getByTestId('share-preview')).toBeVisible();
  });

  test.skip('[P0] should show "Link sent" toast and active share card after submitting', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `ToastCat-${Date.now()}` });

    await page.goto('/settings/vet-sharing');

    // Select animal
    await page.getByTestId('animal-multi-select').getByText(pet.name).click();

    // Fill email
    await page.getByLabel('Email du vétérinaire').fill('dr.martin@vetclinic.com');

    // Submit
    await page.getByRole('button', { name: 'Envoyer le lien' }).click();

    // Toast confirmation
    const toast = page.getByTestId('toast-message');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Lien envoyé');

    // Active share card appears
    const shareCard = page.getByTestId('active-share-card');
    await expect(shareCard).toBeVisible();
    await expect(shareCard).toContainText('dr.martin@vetclinic.com');
    await expect(shareCard).toContainText(pet.name);
  });

  test.skip('[P1] should show confirmation dialog and update status when revoking', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `RevokeCat-${Date.now()}` });

    // Create an active share via API
    await request.post(`${API_URL}/vet-shares`, {
      data: {
        pet_ids: [pet.id],
        vet_email: 'dr.revoke@vetclinic.com',
      },
    });

    await page.goto('/settings/vet-sharing');

    const shareCard = page.getByTestId('active-share-card');
    await expect(shareCard).toBeVisible();

    // Tap revoke
    await shareCard.getByRole('button', { name: 'Révoquer' }).click();

    // Confirmation dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Révoquer');

    // Confirm revocation
    await dialog.getByRole('button', { name: 'Confirmer' }).click();

    // Status updated
    await expect(shareCard).not.toBeVisible();
  });
});
