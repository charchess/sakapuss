import { test, expect } from '../support/merged-fixtures';

test.describe('Dashboard WDS (ATDD - Story 3.3)', () => {

  test.skip('[P0] should display animal hero card with pet name and speech bubble', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Hero-${Date.now()}` });
    await page.goto('/');

    // Hero card with pet name
    const heroCard = page.getByTestId('animal-hero-card');
    await expect(heroCard).toBeVisible();
    await expect(heroCard.getByText(pet.name)).toBeVisible();

    // Speech bubble
    await expect(heroCard.getByTestId('speech-bubble')).toBeVisible();
  });

  test.skip('[P0] should display 3-column action garden with 6 tiles using SVG icons', async ({ page, seedPet }) => {
    await seedPet({ name: `Garden-${Date.now()}` });
    await page.goto('/');

    const actionGarden = page.getByTestId('action-garden');
    await expect(actionGarden).toBeVisible();

    // Should have exactly 6 action tiles
    const tiles = actionGarden.getByRole('button');
    await expect(tiles).toHaveCount(6);

    // Each tile should use an SVG icon, not emoji
    for (let i = 0; i < 6; i++) {
      const tile = tiles.nth(i);
      await expect(tile.locator('svg')).toBeVisible();
    }
  });

  test.skip('[P1] should show animal switcher when multiple pets exist', async ({ page, seedPet }) => {
    const ts = Date.now();
    await seedPet({ name: `Pet1-${ts}` });
    await seedPet({ name: `Pet2-${ts}` });
    await page.goto('/');

    // Animal switcher should be visible
    const switcher = page.getByTestId('animal-switcher');
    await expect(switcher).toBeVisible();

    // Should show both pet names or avatars
    await expect(switcher.getByText(`Pet1-${ts}`)).toBeVisible();
    await expect(switcher.getByText(`Pet2-${ts}`)).toBeVisible();
  });

  test.skip('[P1] should not show animal switcher for single pet', async ({ page, seedPet }) => {
    await seedPet({ name: `Solo-${Date.now()}` });
    await page.goto('/');

    await expect(page.getByTestId('animal-switcher')).not.toBeVisible();
  });

  test.skip('[P1] should show reminder nudge banner when reminders exist', async ({ page, seedPet }) => {
    await seedPet({ name: `Reminded-${Date.now()}` });
    await page.goto('/');

    // Reminder nudge banner should be visible when there are active reminders
    const nudgeBanner = page.getByTestId('reminder-nudge');
    await expect(nudgeBanner).toBeVisible();
    await expect(nudgeBanner.getByText('reminder', { exact: false })).toBeVisible();
  });

  test.skip('[P1] should show recent activity stream with last 3 entries', async ({ page, seedPet }) => {
    await seedPet({ name: `Active-${Date.now()}` });
    await page.goto('/');

    const activityStream = page.getByTestId('recent-activity');
    await expect(activityStream).toBeVisible();

    // Should show at most 3 recent entries
    const entries = activityStream.getByTestId('activity-entry');
    const count = await entries.count();
    expect(count).toBeLessThanOrEqual(3);
    expect(count).toBeGreaterThan(0);
  });
});
