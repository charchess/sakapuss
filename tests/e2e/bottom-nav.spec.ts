import { test, expect } from '../support/merged-fixtures';

test.describe('Bottom Navigation (ATDD - Story 3.2)', () => {

  test('[P0] should display bottom nav on authenticated pages', async ({ page, seedPet }) => {
    await seedPet({ name: `NavPet-${Date.now()}` });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /navigation principale/i });
    await expect(nav).toBeVisible();
  });

  test('[P0] should have 5 navigation items', async ({ page, seedPet }) => {
    await seedPet({ name: `NavPet-${Date.now()}` });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /navigation principale/i });
    await expect(nav).toBeVisible();

    // 4 regular links + 1 center button = 5 links total
    const links = nav.locator('a');
    await expect(links).toHaveCount(5);
  });

  test('[P0] should show active state on current page', async ({ page, seedPet }) => {
    await seedPet({ name: `NavPet-${Date.now()}` });
    await page.goto('/');
    const homeLink = page.getByRole('navigation', { name: /navigation principale/i }).locator('a[aria-current="page"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText(/Accueil/);
  });

  test('[P0] should navigate between tabs', async ({ page, seedPet }) => {
    await seedPet({ name: `NavPet-${Date.now()}` });
    await page.goto('/');

    // Navigate to Timeline
    await page.getByRole('navigation', { name: /navigation principale/i }).getByText('Timeline').click();
    await expect(page).toHaveURL(/\/timeline/);

    // Navigate to Reminders
    await page.getByRole('navigation', { name: /navigation principale/i }).getByText('Rappels').click();
    await expect(page).toHaveURL(/\/reminders/);

    // Navigate back to Home
    await page.getByRole('navigation', { name: /navigation principale/i }).getByText('Accueil').click();
    await expect(page).toHaveURL('/');
  });

  test('[P1] should not show bottom nav on login page', async ({ page }) => {
    await page.goto('/login');
    const nav = page.getByRole('navigation', { name: /navigation principale/i });
    await expect(nav).toHaveCount(0);
  });
});
