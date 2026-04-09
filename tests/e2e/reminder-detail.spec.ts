import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Reminder Detail (ATDD - Story 4.3)', () => {

  let petId: string;
  let reminderId: string;

  test.skip('[P0] should display animal context with avatar and speech bubble', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `DetailCat-${Date.now()}` });
    petId = pet.id;

    const res = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: { type: 'vaccine', due_date: '2026-04-10', label: 'Vaccin leucose' },
    });
    const reminder = await res.json();
    reminderId = reminder.id;

    await page.goto(`/reminders/${reminderId}`);

    // Animal avatar
    await expect(page.getByTestId('reminder-animal-avatar')).toBeVisible();

    // First-person speech bubble
    const speechBubble = page.getByTestId('reminder-speech-bubble');
    await expect(speechBubble).toBeVisible();
    await expect(speechBubble).toContainText(pet.name);
  });

  test.skip('[P0] should display info card with type, date, product, last done, frequency', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `InfoCat-${Date.now()}` });
    petId = pet.id;

    const res = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        type: 'deworming',
        due_date: '2026-04-15',
        label: 'Milbemax',
        product: 'Milbemax 4mg',
        last_done: '2026-01-15',
        frequency_months: 3,
      },
    });
    const reminder = await res.json();
    reminderId = reminder.id;

    await page.goto(`/reminders/${reminderId}`);

    const infoCard = page.getByTestId('reminder-info-card');
    await expect(infoCard).toBeVisible();
    await expect(infoCard).toContainText('Vermifuge');
    await expect(infoCard).toContainText('15 avr. 2026');
    await expect(infoCard).toContainText('Milbemax 4mg');
    await expect(infoCard).toContainText('15 janv. 2026');
    await expect(infoCard).toContainText('3 mois');
  });

  test.skip('[P0] should show celebration state after tapping "C\'est fait"', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `DoneCat-${Date.now()}` });
    petId = pet.id;

    const res = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        type: 'deworming',
        due_date: '2026-04-08',
        label: 'Vermifuge',
        frequency_months: 3,
      },
    });
    const reminder = await res.json();
    reminderId = reminder.id;

    await page.goto(`/reminders/${reminderId}`);

    // Tap "C'est fait"
    await page.getByRole('button', { name: "C'est fait" }).click();

    // Verify celebration state
    await expect(page.getByTestId('celebration-checkmark')).toBeVisible();
    await expect(page.getByText('Prochain dans 3 mois')).toBeVisible();
  });

  test.skip('[P1] should show delay chips after tapping "Reporter"', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `DelayCat-${Date.now()}` });
    petId = pet.id;

    const res = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: { type: 'vaccine', due_date: '2026-04-08', label: 'Vaccin reporter' },
    });
    const reminder = await res.json();
    reminderId = reminder.id;

    await page.goto(`/reminders/${reminderId}`);

    // Tap "Reporter"
    await page.getByRole('button', { name: 'Reporter' }).click();

    // Verify delay chips appear
    await expect(page.getByRole('button', { name: '+3j' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+1sem' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+2sem' })).toBeVisible();
  });

  test.skip('[P1] should show confirmation toast and redirect after selecting delay chip', async ({ page, seedPet, request }) => {
    const pet = await seedPet({ name: `ChipCat-${Date.now()}` });
    petId = pet.id;

    const res = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: { type: 'vaccine', due_date: '2026-04-08', label: 'Vaccin chip' },
    });
    const reminder = await res.json();
    reminderId = reminder.id;

    await page.goto(`/reminders/${reminderId}`);

    // Tap "Reporter" then select a chip
    await page.getByRole('button', { name: 'Reporter' }).click();
    await page.getByRole('button', { name: '+3j' }).click();

    // Verify confirmation toast
    const toast = page.getByTestId('toast-message');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Reporté');

    // Verify redirect to reminders list
    await expect(page).toHaveURL('/reminders');
  });
});
