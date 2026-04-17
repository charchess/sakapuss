import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: tests navigate to different pet URLs but share browser context
test.describe.configure({ mode: 'serial' });

test.describe('Profile Completion (ATDD - Story 5.5)', () => {

  test('[P0] should display Weight Summary section with current weight, trend, and chart link', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `SummaryCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-02-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.3, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const weightSection = page.getByTestId('weight-summary');
    await expect(weightSection).toBeVisible();

    // Current weight
    await expect(weightSection).toContainText('4.3');
    await expect(weightSection).toContainText('kg');

    // Trend indicator (shows current weight + trend arrow)
    await expect(weightSection.getByTestId('weight-trend')).toBeVisible();

    // "See chart" link
    const chartLink = weightSection.getByRole('link', { name: 'Voir le graphique' });
    await expect(chartLink).toBeVisible();
  });

  test('[P0] should display Active Reminders section with compact cards', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `ReminderProfileCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-04-20', name: 'Vaccin leucose', frequency_days: 365 },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'deworming', next_due_date: '2026-05-10', name: 'Vermifuge', frequency_days: 90 },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const remindersSection = page.getByTestId('active-reminders-section');
    await expect(remindersSection).toBeVisible();

    const compactCards = remindersSection.getByTestId('compact-reminder-card');
    await expect(compactCards).toHaveCount(2);
  });

  test('[P0] should display Recent Activity section with last 5 events and history link', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `ActivityCat-${Date.now()}` });

    // Seed 7 events
    for (let i = 1; i <= 7; i++) {
      await request.post(`${API_URL}/pets/${pet.id}/events`, {
        data: {
          type: 'note',
          occurred_at: `2026-03-${String(i).padStart(2, '0')}T10:00:00Z`,
          payload: { text: `Note ${i}` },
        },
        headers: authHeaders,
      });
    }

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const activitySection = page.getByTestId('pet-timeline');
    await expect(activitySection).toBeVisible();

    // Only last 5 events shown (recentEvents = events.slice(0,5))
    const activityItems = activitySection.getByTestId('timeline-event');
    await expect(activityItems).toHaveCount(5);

    // "See full history" link
    const historyLink = activitySection.getByRole('link', { name: "Voir l'historique complet" });
    await expect(historyLink).toBeVisible();
  });

  test('[P1] should display "Share with my vet" CTA link at bottom', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `ShareCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    // It's a link (a[href]) not a button
    const shareLink = page.getByRole('link', { name: 'Partager avec mon vétérinaire' });
    await expect(shareLink).toBeVisible();
  });
});
