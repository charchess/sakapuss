import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Bidirectional Validation (ATDD - Story 3.4)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'ValidateCat', species: 'Cat', birth_date: '2020-01-15' },
    });
    expect(petRes.ok()).toBeTruthy();
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
    }
  });

  test('[P0] should validate a reminder and create confirmation event', async ({ request }) => {
    // Create a vaccine event with reminder
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-02-01T10:00:00Z',
        payload: { name: 'Rabies', period_months: 12 },
      },
    });

    // Get the reminder
    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    const reminders = await remindersRes.json();
    const reminder = reminders.find((r: any) => r.name === 'Rabies');
    expect(reminder).toBeTruthy();

    // Validate it via command endpoint
    const validateRes = await request.post(`${API_URL}/commands/validate`, {
      data: {
        pet_id: petId,
        reminder_id: reminder.id,
      },
    });
    expect(validateRes.status()).toBe(201);
    const result = await validateRes.json();
    expect(result.type).toBe('vaccine');
    expect(result.payload.validated).toBe(true);
    expect(result.payload.original_name).toBe('Rabies');
  });

  test('[P1] should show validation event in pet timeline', async ({ request }) => {
    // Create vaccine with reminder
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-02-01T10:00:00Z',
        payload: { name: 'Coryza', period_months: 12 },
      },
    });

    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    const reminders = await remindersRes.json();
    const reminder = reminders.find((r: any) => r.name === 'Coryza');

    // Validate
    await request.post(`${API_URL}/commands/validate`, {
      data: { pet_id: petId, reminder_id: reminder.id },
    });

    // Check timeline
    const eventsRes = await request.get(`${API_URL}/pets/${petId}/events`);
    const events = await eventsRes.json();

    // Should have the original vaccine event + the validation event
    expect(events.length).toBe(2);
    const validationEvent = events.find((e: any) => e.payload.validated === true);
    expect(validationEvent).toBeTruthy();
  });

  test('[P1] should return 404 for non-existent reminder', async ({ request }) => {
    const response = await request.post(`${API_URL}/commands/validate`, {
      data: { pet_id: petId, reminder_id: 'non-existent-id' },
    });
    expect(response.status()).toBe(404);
  });
});
