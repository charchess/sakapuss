import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Pet Navigation (ATDD - Story 6.4)', () => {

  test('[P0] should show pet switcher on profile page', async ({ page, seedPet }) => {
    const cat = await seedPet({ name: 'NavCat' });
    const dog = await seedPet({ name: 'NavDog', species: 'Dog' });

    await page.goto(`/pets/${cat.id}`, { waitUntil: 'networkidle' });

    const switcher = page.getByTestId('pet-switcher');
    await expect(switcher).toBeVisible();
    await expect(switcher.getByText('NavCat')).toBeVisible();
    await expect(switcher.getByText('NavDog')).toBeVisible();
  });

  test('[P0] should navigate to another pet via switcher', async ({ page, seedPet }) => {
    const cat = await seedPet({ name: 'SwitchCat' });
    const dog = await seedPet({ name: 'SwitchDog', species: 'Dog' });

    await page.goto(`/pets/${cat.id}`, { waitUntil: 'networkidle' });

    // Click the other pet in switcher
    await page.getByTestId('pet-switcher').getByText('SwitchDog').click();

    await page.waitForURL(`/pets/${dog.id}`, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'SwitchDog' })).toBeVisible();
  });

  test('[P0] should show vet link on profile page', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: 'VetLinkCat' });

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const vetLink = page.getByTestId('vet-link');
    await expect(vetLink).toBeVisible();
    await vetLink.click();

    await page.waitForURL(`/pets/${pet.id}/vet`, { timeout: 5000 });
  });

  test('[P0] should show edit link on profile page', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: 'EditLinkCat' });

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const editLink = page.getByTestId('edit-link');
    await expect(editLink).toBeVisible();
    await editLink.click();

    await page.waitForURL(`/pets/${pet.id}/edit`, { timeout: 5000 });
  });
});
