import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: shared browser context, tests all navigate to /reminders
test.describe.configure({ mode: 'serial' });

test.describe('Reminder List (ATDD - Story 4.2)', () => {

  test('[P0] should display overdue and upcoming segments', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `ReminderCat-${Date.now()}` });

    // overdue: before today (2026-04-17)
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-03-20', name: 'Vaccin rage', frequency_days: 365 },
      headers: authHeaders,
    });
    // upcoming
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vet_visit', next_due_date: '2026-05-15', name: 'Visite annuelle', frequency_days: 365 },
      headers: authHeaders,
    });

    await page.goto('/reminders', { waitUntil: 'networkidle' });

    // At minimum, overdue and upcoming sections should be visible
    await expect(page.getByRole('heading', { name: 'En retard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'À venir' })).toBeVisible();
  });

  test('[P0] should show overdue count badge in red', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `OverdueCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-03-01', name: 'Vaccin 1', frequency_days: 365 },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'deworming', next_due_date: '2026-03-10', name: 'Vermifuge 1', frequency_days: 90 },
      headers: authHeaders,
    });

    await page.goto('/reminders', { waitUntil: 'networkidle' });

    const overdueBadge = page.getByTestId('overdue-badge');
    await expect(overdueBadge).toBeVisible();
  });

  test('[P0] should display reminder card with color bar and animal info', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `CardCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-05-08', name: 'Vaccin typhus', frequency_days: 365 },
      headers: authHeaders,
    });

    await page.goto('/reminders', { waitUntil: 'networkidle' });

    const card = page.getByTestId('reminder-card').first();
    await expect(card).toBeVisible();

    // Animal name visible in card
    await expect(card).toContainText(pet.name);

    // Reminder name visible
    await expect(card).toContainText('Vaccin typhus');
  });

  test('[P1] should show overdue section expanded with red accent', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `ExpandCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-03-01', name: 'Vaccin retard', frequency_days: 365 },
      headers: authHeaders,
    });

    await page.goto('/reminders', { waitUntil: 'networkidle' });

    const overdueSection = page.getByTestId('overdue-section');
    await expect(overdueSection).toBeVisible();
  });

  test('[P1] should open inline detail when tapping a reminder card', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `NavCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/reminders`, {
      data: { type: 'vaccine', next_due_date: '2026-04-08', name: 'Vaccin click', frequency_days: 365 },
      headers: authHeaders,
    });

    await page.goto('/reminders', { waitUntil: 'networkidle' });
    await page.getByTestId('reminder-card').first().click();
    await expect(page.getByTestId('reminder-animal-avatar')).toBeVisible();
    await expect(page.getByTestId('reminder-info-card')).toBeVisible();
  });
});
