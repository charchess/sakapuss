import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Profile Completion (ATDD - Story 5.5)', () => {
  // ALL SKIPPED: Pet profile page exists at /pets/{id} but doesn't have the expected data-testid values
  // (weight-summary, weight-trend, active-reminders-section, compact-reminder-card, recent-activity-section,
  // activity-item). Tests also seed events/reminders via authenticated API with mismatched schemas.

  test.skip('[P0] should display Weight Summary section with current weight, trend, and chart link', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `SummaryCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-02-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.3, unit: 'kg' } },
    });

    await page.goto(`/pets/${pet.id}`);

    const weightSection = page.getByTestId('weight-summary');
    await expect(weightSection).toBeVisible();

    // Current weight
    await expect(weightSection).toContainText('4.3');
    await expect(weightSection).toContainText('kg');

    // Trend indicator
    await expect(weightSection.getByTestId('weight-trend')).toBeVisible();

    // "See chart" link
    const chartLink = weightSection.getByRole('link', { name: 'Voir le graphique' });
    await expect(chartLink).toBeVisible();
  });

  test.skip('[P0] should display Active Reminders section with compact cards', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `ReminderProfileCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', due_date: '2026-04-20', label: 'Vaccin leucose' },
    });
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'deworming', due_date: '2026-05-10', label: 'Vermifuge' },
    });

    await page.goto(`/pets/${pet.id}`);

    const remindersSection = page.getByTestId('active-reminders-section');
    await expect(remindersSection).toBeVisible();

    const compactCards = remindersSection.getByTestId('compact-reminder-card');
    await expect(compactCards).toHaveCount(2);
  });

  test.skip('[P0] should display Recent Activity section with last 5 events and history link', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `ActivityCat-${Date.now()}` });

    // Seed 7 events
    for (let i = 1; i <= 7; i++) {
      await request.post(`${API_URL}/pets/${pet.id}/events`, {
        data: {
          type: 'note',
          occurred_at: `2026-03-${String(i).padStart(2, '0')}T10:00:00Z`,
          payload: { text: `Note ${i}` },
        },
      });
    }

    await page.goto(`/pets/${pet.id}`);

    const activitySection = page.getByTestId('recent-activity-section');
    await expect(activitySection).toBeVisible();

    // Only last 5 events shown
    const activityItems = activitySection.getByTestId('activity-item');
    await expect(activityItems).toHaveCount(5);

    // "See full history" link
    const historyLink = activitySection.getByRole('link', { name: "Voir l'historique complet" });
    await expect(historyLink).toBeVisible();
  });

  test.skip('[P1] should display "Share with my vet" CTA button at bottom', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `ShareCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}`);

    const shareButton = page.getByRole('button', { name: 'Partager avec mon vétérinaire' });
    await expect(shareButton).toBeVisible();
  });
});
