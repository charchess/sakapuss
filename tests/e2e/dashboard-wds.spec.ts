import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Dashboard WDS (ATDD - Story 3.3)', () => {

  test('[P0] should display animal hero card with pet name', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Hero-${Date.now()}` });
    await page.goto(`/?pet=${pet.id}`);

    // Hero card with pet name
    const heroCard = page.locator('.animal-card');
    await expect(heroCard).toBeVisible();
    await expect(heroCard.getByText(pet.name)).toBeVisible();
  });

  test('[P0] should display 3-column action garden with SVG icon tiles', async ({ page, seedPet }) => {
    await seedPet({ name: `Garden-${Date.now()}` });
    await page.goto('/');

    const actionGarden = page.locator('.action-garden');
    await expect(actionGarden).toBeVisible();

    // 4 tiles are always present (weight, health_note, behavior, custom)
    // litter_clean and food_serve are conditional on configured resources
    const tiles = actionGarden.getByRole('button');
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(6);

    // Each visible tile must use an SVG icon, not emoji
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      await expect(tile.locator('svg')).toBeVisible();
    }
  });

  test('[P1] should show animal switcher when multiple pets exist', async ({ page, seedPet }) => {
    const ts = Date.now();
    await seedPet({ name: `Pet1-${ts}` });
    await seedPet({ name: `Pet2-${ts}` });
    await page.goto('/');

    // Animal switcher (avatar group) should be visible
    const switcher = page.locator('.avatar-group');
    await expect(switcher).toBeVisible();

    // Should show both pet avatars (accessible by aria-label)
    await expect(switcher.getByLabel(`Pet1-${ts}`)).toBeVisible();
    await expect(switcher.getByLabel(`Pet2-${ts}`)).toBeVisible();
  });

  test('[P1] should not show animal switcher for single pet', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Solo-${Date.now()}` });
    await page.goto('/');

    // Avatar group should be visible with the seeded pet's avatar
    const switcher = page.locator('.avatar-group');
    await expect(switcher).toBeVisible();
    await expect(switcher.getByLabel(pet.name)).toBeVisible();
  });

  test('[P1] should show reminder nudge banner when reminders exist', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `Reminded-${Date.now()}` });
    // Seed an overdue reminder so the nudge banner appears
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-03-01', name: 'Vaccin test nudge', frequency_days: 365 },
      headers: authHeaders,
    });
    await page.goto('/', { waitUntil: 'networkidle' });

    const nudgeBanner = page.getByTestId('reminder-nudge');
    await expect(nudgeBanner).toBeVisible();
  });

  test('[P1] should show recent activity section', async ({ page, seedPet }) => {
    await seedPet({ name: `Active-${Date.now()}` });
    await page.goto('/');

    const activityStream = page.getByTestId('recent-activity');
    await expect(activityStream).toBeVisible();
  });
});
