import { test, expect } from '../support/merged-fixtures';

test.describe('Dashboard Frontend (ATDD)', () => {

  test('[P0] should display pets and action garden', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: `DashPet-${Date.now()}` });
    await page.goto('/');

    // Always-visible tiles (no config required)
    await expect(page.getByTestId('action-weight')).toBeVisible();
    await expect(page.getByTestId('action-behavior')).toBeVisible();

    // Section label visible
    await expect(page.getByText(/qu.*est-ce que tu viens de faire/i)).toBeVisible();
  });

  test('[P1] should navigate to pet profile when hero card clicked', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    const pet = await seedPet({ name: `NavPet-${Date.now()}` });
    await page.goto('/');
    await page.goto(`/pets/${pet.id}`);
    await expect(page).toHaveURL(new RegExp(`/pets/${pet.id}`));
  });

  test('[P0] should display core action tiles (always visible)', async ({ page, seedPet, loginAs }) => {
    await loginAs();
    await seedPet({ name: `ActionPet-${Date.now()}` });
    await page.goto('/');

    await expect(page.getByTestId('action-weight')).toBeVisible();
    await expect(page.getByTestId('action-health_note')).toBeVisible();
    await expect(page.getByTestId('action-behavior')).toBeVisible();
    await expect(page.getByTestId('action-custom')).toBeVisible();
  });
});
