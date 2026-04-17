import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Pet Onboarding CRUD (ATDD - Stories 6.2 & 6.3)', () => {

  test('[P0] should show add pet button on dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('add-pet-btn')).toBeVisible();
  });

  test('[P0] should create a pet via the form', async ({ page, request, authHeaders }) => {
    const petName = `Moustache-${Date.now()}`;
    await page.goto('/pets/new', { waitUntil: 'networkidle' });

    await page.getByTestId('pet-name').fill(petName);
    await page.getByTestId('pet-species').getByText('Chat').click();
    await page.getByTestId('pet-birth-date').fill('2021-06-15');
    await page.getByTestId('pet-breed').fill('Persan');
    await page.getByTestId('pet-sterilized').check();
    await page.getByTestId('pet-microchip').fill('250269812345678');
    await page.getByTestId('pet-vet-name').fill('Dr. Dupont');
    await page.getByTestId('pet-vet-phone').fill('01 23 45 67 89');

    await page.getByTestId('pet-submit').click();

    // Should redirect to dashboard with new pet
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.getByText(petName)).toBeVisible();

    // Cleanup: find and delete the created pet
    const petsRes = await request.get(`${API_URL}/pets`, { headers: authHeaders });
    if (petsRes.ok()) {
      const pets = await petsRes.json();
      const created = pets.find((p: any) => p.name === petName);
      if (created) await request.delete(`${API_URL}/pets/${created.id}`, { headers: authHeaders });
    }
  });

  test('[P0] should edit a pet via the form', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `EditCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });

    // Form should be pre-filled
    await expect(page.getByTestId('pet-name')).toHaveValue(pet.name);

    // Change name
    const newName = `EditCatRenamed-${Date.now()}`;
    await page.getByTestId('pet-name').fill(newName);
    await page.getByTestId('pet-breed').fill('Siamois');
    await page.getByTestId('pet-submit').click();

    // Should redirect to pet profile
    await page.waitForURL(`/pets/${pet.id}`, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
  });

  test('[P0] should delete a pet with confirmation', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `DeleteCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });

    // Click delete and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByTestId('pet-delete').click();

    // Should redirect to dashboard
    await page.waitForURL('/');
    await expect(page.getByText(pet.name)).not.toBeVisible();
  });
});
